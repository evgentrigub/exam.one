# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
# Every manifest is copied so the frozen lockfile matches the workspace; only the frontend and its
# workspace dependencies are installed.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY libraries/contracts/package.json libraries/contracts/package.json
COPY libraries/database/package.json libraries/database/package.json
COPY libraries/nestjs-libraries/package.json libraries/nestjs-libraries/package.json
COPY data/package.json data/package.json
# The pnpm store cache (shared with the backend image) survives install-layer invalidation.
# --ignore-scripts skips the frontend postinstall `nuxt prepare`, which would run before
# nuxt.config.ts is copied; `nuxt build` prepares .nuxt itself.
RUN --mount=type=cache,id=exam-one-pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir /pnpm/store --filter exam-one-frontend... --ignore-scripts
COPY libraries/contracts libraries/contracts
COPY data data
COPY apps/frontend apps/frontend
# Vite bundles @exam-one/contracts and @exam-one/exam-packs from their TypeScript sources, so they
# need no build here. Type-checking runs in CI (`pnpm type-check`), not in the image.
ENV SKIP_NUXT_TYPECHECK=1
RUN pnpm --filter ./apps/frontend exec nuxt build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/apps/frontend/.output ./
RUN mkdir -p /app/public/audio/listening/generated \
    /app/public/audio/listening/a2 \
    && chown -R node:node /app/public/audio
USER node
EXPOSE 3000
CMD ["node", "server/index.mjs"]
