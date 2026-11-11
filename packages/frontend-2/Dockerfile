ARG NODE_ENV=production

FROM node:22-bookworm-slim@sha256:221ee67425de7a3c11ce4e81e63e50caaec82ede3a7d34599ab20e59d29a0cb5 AS build-stage

WORKDIR /speckle-server

COPY package.json tsconfig.json vite.config.ts index.html ./
RUN npm install

COPY public ./public
COPY src ./src
COPY packages/frontend-2/server.mjs ./packages/frontend-2/server.mjs

RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12:nonroot@sha256:ed26b3ab750110c51d9dbdfd6c697561dc40a01c296460c3494d47b550ef4126 AS production-stage

ENV PORT=8080
ENV HOST=0.0.0.0

WORKDIR /speckle-server
COPY --link --from=build-stage /speckle-server/dist ./dist
COPY --link --from=build-stage /speckle-server/packages/frontend-2/server.mjs ./server/index.mjs

EXPOSE ${PORT}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
USER nonroot
ENTRYPOINT [ "/nodejs/bin/node", "./server/index.mjs" ]
