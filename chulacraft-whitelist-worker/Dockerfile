FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY worker.cjs healthcheck.cjs lib.cjs bounded-fetch.cjs ./
RUN mkdir -p /run/whitelist-worker \
    && chown node:node /run/whitelist-worker \
    && chmod 0700 /run/whitelist-worker

USER node
CMD ["node", "worker.cjs"]
