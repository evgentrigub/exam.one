FROM node:22-alpine AS build
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
COPY apps/frontend apps/frontend
RUN pnpm --filter ./apps/frontend build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/apps/frontend/.output ./
RUN mkdir -p /app/public/audio/listening/generated \
    && chown -R node:node /app/public/audio/listening/generated
USER node
EXPOSE 3000
CMD ["node", "server/index.mjs"]
