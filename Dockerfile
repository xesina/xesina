# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# install deps from the lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# build the static site
COPY . .
RUN npm run build

# ---- serve stage ----
FROM nginx:1.27-alpine AS runtime

# nginx config tuned for Astro's directory-style static output
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
