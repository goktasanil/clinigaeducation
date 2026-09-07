FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ai/commerce/trendyol/package.json ./package.json
RUN npm install --no-audit --no-fund
COPY ai/commerce/trendyol/server.mjs ./server.mjs
RUN chown -R node:node /app

ENV NODE_ENV=production
EXPOSE 8010
USER node
CMD ["node", "server.mjs"]
