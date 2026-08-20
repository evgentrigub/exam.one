FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY libraries/contracts/package.json libraries/contracts/package.json
COPY libraries/database/package.json libraries/database/package.json
COPY libraries/exam-content/package.json libraries/exam-content/package.json
COPY libraries/nestjs-libraries/package.json libraries/nestjs-libraries/package.json
RUN pnpm install --frozen-lockfile
COPY libraries/contracts libraries/contracts
COPY libraries/exam-content libraries/exam-content
COPY apps/frontend apps/frontend
RUN pnpm --filter @exam-one/contracts build \
  && pnpm --filter @exam-one/exam-content build \
  && pnpm --filter ./apps/frontend exec nuxt prepare \
  && pnpm --filter ./apps/frontend exec nuxt build

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
