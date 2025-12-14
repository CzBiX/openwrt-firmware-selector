FROM node:lts-slim AS build

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV PNPM_HOME="/pnpm"
RUN --mount=type=cache,target=/pnpm/store,id=pnpm pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


FROM alpine:latest AS preprocess
RUN apk --no-cache add gzip
WORKDIR /out

# Compress files with Brotli
RUN --mount=from=build,source=/app,target=/app,rw find /app/dist -type f -exec gzip --best {} \; && \
    cp -r /app/dist/* .

FROM ghcr.io/static-web-server/static-web-server:2
RUN rm -rf /public/*
COPY --from=preprocess /out /var/public

# Enable pre-compressed files serving
ENV SERVER_COMPRESSION_STATIC=true
ENV SERVER_ROOT=/var/public