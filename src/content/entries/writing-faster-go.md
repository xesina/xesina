---
title: 'Writing faster Go: profile first, then kill allocations'
description: A practical loop for Go performance work. Benchmark with testing.B, find the cost with pprof, and cut the allocations that actually matter.
pubDate: 2026-06-24T09:00:00Z
tags: [go, performance, systems]
---

Performance work goes wrong when it starts with a guess. Someone decides a function "feels
slow", rewrites it, and moves on without ever checking whether it mattered. In Go you never
have to guess: the tooling is good enough to tell you. This is the loop I use, in order:
measure, find the real cost, change one thing, measure again.

## Measure first: benchmarks

Go's `testing` package has benchmarks built in. A benchmark is just a function that runs your
code `b.N` times:

```go
func BenchmarkParse(b *testing.B) {
	input := loadFixture()
	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = Parse(input)
	}
}
```

Run it with `-benchmem`, which is the flag that matters:

```
go test -bench=Parse -benchmem ./...

BenchmarkParse-10    248511    4815 ns/op    2208 B/op    37 allocs/op
```

Read those columns right to left. `allocs/op` (heap allocations per call) and `B/op` (bytes
allocated) usually predict `ns/op` better than anything else, because every heap allocation is
work now and garbage-collection work later.

Two practical notes. Use `b.ResetTimer()` after expensive setup so it isn't counted. And on Go
1.24+ you can write `for b.Loop()` instead of the `b.N` loop; it stops the compiler from
optimising your loop body away, which is the classic way to get a benchmark that measures
nothing.

## Profile: find the real cost

A benchmark tells you a function is slow. A profile tells you where the time goes.

```
go test -bench=Parse -cpuprofile=cpu.out ./...
go tool pprof -http=:8080 cpu.out
```

That opens a flame graph in your browser. For a running service, import `net/http/pprof` and
read it live from `/debug/pprof/`. For allocations specifically, take a memory profile and
sort by allocation count, which maps directly to GC pressure:

```
go test -bench=Parse -memprofile=mem.out ./...
go tool pprof -alloc_objects mem.out
```

## Why allocations dominate

When a value escapes to the heap you pay twice: once to allocate it, and again later when the
garbage collector has to scan and free it. Keeping a value on the stack avoids both. The
compiler decides this through escape analysis, and it will show you what it decided:

```
go build -gcflags='-m' ./...

./parse.go:42:9: &buf escapes to heap
./parse.go:51:13: make([]token, 0, n) does not escape
```

You can't override escape analysis, but you can avoid forcing escapes. The usual causes:
returning a pointer to a local, storing a pointer inside an interface, capturing a variable in
a closure that outlives the call, or a slice or map the compiler can't size.

## Five changes that usually pay off

### 1. Preallocate slices and maps

If you know the size, say so:

```go
out := make([]Result, 0, len(rows)) // capacity up front
for _, r := range rows {
	out = append(out, transform(r))
}
```

Growing a slice reallocates and copies; growing a map rehashes. One `make` with capacity
replaces a handful of hidden allocations.

### 2. Reuse buffers with sync.Pool

For short-lived objects on a hot path (byte buffers, encoders), a `sync.Pool` lets you reuse
instead of reallocate:

```go
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func render(v Value) string {
	buf := bufPool.Get().(*bytes.Buffer)
	defer func() { buf.Reset(); bufPool.Put(buf) }()
	writeInto(buf, v)
	return buf.String()
}
```

Reset the object before putting it back, and never assume `Get` hands you a clean one.

### 3. Stop converting between string and []byte

`[]byte(s)` and `string(b)` both copy. In a hot loop that adds up fast. Operate on `[]byte`
and convert once at the boundary, and use the `Append` family to write into a buffer you own:

```go
buf = strconv.AppendInt(buf, n, 10) // no intermediate string
```

### 4. Watch interface boxing

Putting a value into an interface can allocate, because the interface needs a pointer to the
value. That includes handing an `int` to `fmt`. In hot paths, prefer concrete types and typed
helpers:

```
BenchmarkSprintf-10     8912340    134 ns/op    16 B/op    2 allocs/op
BenchmarkItoa-10       72944011     16 ns/op     0 B/op    0 allocs/op
```

`strconv.Itoa(n)` does the same job as `fmt.Sprintf("%d", n)` with zero allocations.

### 5. Build strings with strings.Builder

`+` inside a loop allocates a fresh string every iteration. `strings.Builder` writes into one
growing buffer, and `Grow` lets you size it once:

```go
var b strings.Builder
b.Grow(len(parts) * 8)
for _, p := range parts {
	b.WriteString(p)
}
return b.String()
```

## Tune the garbage collector, last

Once the allocation profile is flat, the GC itself becomes a knob. Two environment variables
do most of the work:

- `GOGC` (default 100) sets how much the heap grows between collections. Higher means fewer,
  larger collections: more memory, less CPU.
- `GOMEMLIMIT` (Go 1.19+) is a soft memory ceiling. This is the one for containers: set it a
  little below the container's memory limit and the runtime collects harder as it approaches,
  instead of getting OOM-killed.

Reach for these after you've cut allocations, not instead of it. A GC knob trades memory for
CPU; removing an allocation costs nothing.

## The loop, again

That's the whole thing: a benchmark to know if you're faster, a profile to know where to look,
escape analysis to understand why, and one change at a time so you can tell what actually
worked. Most of the wins are allocations. Measure, and let the numbers pick the fight.
