FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /quality
COPY ai/quality/package.json ./package.json
RUN npm install --no-audit --no-fund
RUN chown -R node:node /quality

ENV CHROME_PATH=/usr/bin/chromium
USER node
CMD ["npm", "run", "versions"]
