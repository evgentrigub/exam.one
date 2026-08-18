FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY libraries/contracts/package.json libraries/contracts/package.json
COPY libraries/database/package.json libraries/database/package.json
COPY libraries/exam-content/package.json libraries/exam-content/package.json
COPY libraries/nestjs-libraries/package.json libraries/nestjs-libraries/package.json
RUN pnpm install --frozen-lockfile
COPY apps/backend apps/backend
COPY libraries/contracts libraries/contracts
COPY libraries/database libraries/database
COPY libraries/nestjs-libraries libraries/nestjs-libraries
RUN pnpm --filter @exam-one/database build \
  && pnpm --filter @exam-one/contracts build \
  && pnpm --filter @exam-one/nestjs-libraries build \
  && pnpm --filter ./apps/backend build
RUN pnpm deploy --filter ./apps/backend --prod --legacy /production

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /production ./
COPY --from=build /workspace/apps/backend/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
