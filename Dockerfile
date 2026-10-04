# Build: TypeScript -> dist (tsc), then a runtime image with production dependencies only
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:22-slim

ENV NODE_ENV=production \
    MCP_HOST=0.0.0.0 \
    CASE_DESK_MCP_PORT=4102

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
# Served at /openapi.json and /postman.json (paths relative to the app root)
COPY openapi ./openapi
COPY postman ./postman

USER node

EXPOSE 4102
CMD ["node", "dist/case-desk/server.js"]
