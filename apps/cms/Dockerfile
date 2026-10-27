# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG PUBLIC_URL
ENV NODE_ENV=production STRAPI_TELEMETRY_DISABLED=true PUBLIC_URL=$PUBLIC_URL
RUN test -n "$PUBLIC_URL" && npm run build && npm prune --omit=dev
RUN mkdir -p public/uploads

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=1337 STRAPI_TELEMETRY_DISABLED=true
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json /app/tsconfig.json /app/favicon.png ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 1337
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
