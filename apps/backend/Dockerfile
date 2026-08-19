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
COPY libraries/exam-content libraries/exam-content
COPY libraries/nestjs-libraries libraries/nestjs-libraries
RUN pnpm --filter @exam-one/database build \
  && pnpm --filter @exam-one/contracts build \
  && pnpm --filter @exam-one/nestjs-libraries build \
  && pnpm --filter ./apps/backend build
RUN pnpm deploy --filter ./apps/backend --prod --legacy /production
# pnpm deploy --prod reinstalls production node_modules from the store and
# drops the client written by `prisma generate` during the database build.
RUN set -eu; \
  src="$(find /workspace/node_modules/.pnpm -type d -path '*/node_modules/.prisma/client' | head -n1)"; \
  dest="$(find /production/node_modules/.pnpm -type d -path '*/node_modules/@prisma/client' | head -n1)"; \
  if [ -z "$src" ] || [ -z "$dest" ]; then \
    echo "Prisma client copy failed. src='$src' dest='$dest'"; \
    find /workspace/node_modules/.pnpm -maxdepth 3 -iname '*prisma*' -print | head; \
    find /production/node_modules/.pnpm -maxdepth 3 -iname '*prisma*' -print | head; \
    exit 1; \
  fi; \
  mkdir -p "$dest/../../.prisma"; \
  cp -a "$src" "$dest/../../.prisma/client"

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /production ./
COPY --from=build /workspace/apps/backend/dist ./dist
RUN mkdir -p /app/data/listening/generated \
    && chown -R node:node /app/data/listening/generated
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
