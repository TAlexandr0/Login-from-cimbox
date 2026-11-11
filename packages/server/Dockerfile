ARG NODE_ENV=production

FROM node:22-bookworm-slim@sha256:221ee67425de7a3c11ce4e81e63e50caaec82ede3a7d34599ab20e59d29a0cb5 AS build-stage

WORKDIR /speckle-server/packages/server

COPY packages/server/package.json ./package.json
RUN npm install

COPY packages/server/tsconfig.json ./tsconfig.json
COPY packages/server/src ./src

RUN npm run build && npm prune --omit=dev

FROM gcr.io/distroless/nodejs22-debian12@sha256:8d8b9363b0c9d1153f845824f9b754fdb050ada4fa190583eca2da13fdd3138c AS production-stage

WORKDIR /speckle-server/packages/server

COPY --link --from=build-stage /speckle-server/packages/server/package.json ./package.json
COPY --link --from=build-stage /speckle-server/packages/server/node_modules ./node_modules
COPY --link --from=build-stage /speckle-server/packages/server/dist ./dist

ARG SPECKLE_SERVER_VERSION=2.5.4-core
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} \
  SPECKLE_SERVER_VERSION=${SPECKLE_SERVER_VERSION} \
  PORT=3000 \
  HOST=0.0.0.0

EXPOSE 3000

ENTRYPOINT [ "/nodejs/bin/node", "./dist/index.js" ]
