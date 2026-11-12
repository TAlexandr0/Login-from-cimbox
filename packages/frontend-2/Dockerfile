ARG NODE_ENV=production

FROM node:22-bookworm-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee AS build-stage

WORKDIR /speckle-server

COPY package.json tsconfig.json vite.config.ts index.html ./
RUN npm install

COPY public ./public
COPY src ./src
COPY packages/frontend-2/server.mjs ./packages/frontend-2/server.mjs

RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12:nonroot@sha256:13593b7570658e8477de39e2f4a1dd25db2f836d68a0ba771251572d23bb4f8e AS production-stage

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
