FROM node:24-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY worker.cjs healthcheck.cjs lib.cjs bounded-fetch.cjs ./
RUN mkdir -p /run/whitelist-worker \
    && chown node:node /run/whitelist-worker \
    && chmod 0700 /run/whitelist-worker

USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD ["node", "healthcheck.cjs"]
CMD ["node", "worker.cjs"]
