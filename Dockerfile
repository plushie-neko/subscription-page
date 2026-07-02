# Stage 1: Build the SvelteKit app
FROM node:24.17-trixie-slim AS build
WORKDIR /opt/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Stage 2: Runtime image
FROM node:24.17-trixie-slim
WORKDIR /opt/app

LABEL org.opencontainers.image.title="Remnawave Subscription Page (SvelteKit)"
LABEL org.opencontainers.image.description="Cute Material Design 3 rewrite of Remnawave Subscription Page in SvelteKit"
LABEL org.opencontainers.image.vendor="Remnawave"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

# Install curl for optional container healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /opt/app/build ./build
COPY --from=build /opt/app/node_modules ./node_modules
COPY --from=build /opt/app/package.json ./package.json
COPY --from=build /opt/app/docker-entrypoint.sh ./

ENV PORT=3010
ENV NODE_ENV=production

ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]
CMD [ "node", "build/index.js" ]
