import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

const fontRegular = fs.readFileSync(path.join(process.cwd(), 'src/og/fonts/Vazirmatn-Regular.ttf'));
const fontBold = fs.readFileSync(path.join(process.cwd(), 'src/og/fonts/Vazirmatn-Bold.ttf'));

// satori doesn't shape Arabic script, so OG cards are generated for English
// entries only; Persian posts (and every other page) use /open-graph/_site.png.
export async function getStaticPaths() {
  const entries = await getCollection('entries', (e) => !e.data.draft && e.data.lang === 'en');
  const paths = entries.map((e) => ({
    params: { route: `${e.id}.png` },
    props: { title: e.data.title, description: e.data.description ?? '' },
  }));
  paths.push({
    params: { route: '_site.png' },
    props: {
      title: 'Sina Saeidi',
      description: 'Software engineer and open-source enthusiast. Writing, links, and notes.',
    },
  });
  return paths;
}

const div = (style: Record<string, unknown>, children: unknown) => ({ type: 'div', props: { style, children } });

function card(title: string, description: string) {
  return div(
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: '#0a0a0b',
      borderLeft: '12px solid #f97b46',
      fontFamily: 'Vazirmatn',
    },
    [
      div({ display: 'flex', flexDirection: 'column' }, [
        div({ fontSize: 28, color: '#9a988e', marginBottom: 28, letterSpacing: 1 }, 'xesina.com'),
        div({ fontSize: 64, fontWeight: 700, color: '#ededec', lineHeight: 1.15 }, title),
        description
          ? div({ fontSize: 30, color: '#9a988e', lineHeight: 1.4, marginTop: 26 }, description)
          : div({}, ''),
      ]),
      div({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 28 }, [
        div({ color: '#ededec', fontWeight: 700 }, 'Sina Saeidi'),
        div({ color: '#9a988e' }, 'Software engineer'),
      ]),
    ],
  );
}

export async function GET(context: APIContext) {
  const { title, description } = context.props as { title: string; description: string };
  const svg = await satori(card(title, description) as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Vazirmatn', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'Vazirmatn', data: fontBold, weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
