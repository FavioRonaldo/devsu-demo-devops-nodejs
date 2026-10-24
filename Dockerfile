FROM node:24.21.0-alpine3.24 AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force


FROM node:24.21.0-alpine3.24 AS runtime

LABEL org.opencontainers.image.title="demo-devops-nodejs" \
      org.opencontainers.image.description="Users REST API" \
      org.opencontainers.image.source="https://github.com/FavioRonaldo/devsu-demo-devops-nodejs" \
      org.opencontainers.image.licenses="UNLICENSED"

ENV NODE_ENV=production \
    PORT=8000 \
    DATABASE_DIALECT=sqlite \
    DATABASE_NAME=/app/data/dev.sqlite

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json index.js app.js ./
COPY shared ./shared
COPY users ./users

RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    && mkdir -p /app/data \
    && chown node:node /app/data

USER node

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "index.js"]
