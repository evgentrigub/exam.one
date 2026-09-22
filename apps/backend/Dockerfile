FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY libraries/contracts/package.json libraries/contracts/package.json
COPY libraries/database/package.json libraries/database/package.json
COPY libraries/nestjs-libraries/package.json libraries/nestjs-libraries/package.json
COPY data/package.json data/package.json
RUN pnpm install --frozen-lockfile
COPY apps/backend apps/backend
COPY libraries/contracts libraries/contracts
COPY libraries/database libraries/database
COPY libraries/nestjs-libraries libraries/nestjs-libraries
COPY data data
RUN pnpm --filter @exam-one/exam-packs build \
  && pnpm --filter @exam-one/database build \
  && pnpm --filter @exam-one/contracts build \
  && pnpm --filter @exam-one/nestjs-libraries build \
  && pnpm --filter ./apps/backend build
RUN pnpm deploy --filter ./apps/backend --prod --legacy /production
# pnpm deploy --prod skips @prisma/engines postinstall, so migrate would try
# to download schema-engine into a root-owned directory at runtime. Query
# engines are no longer required: Prisma 7 Client is generated into
# @exam-one/database and compiled to dist/.
RUN set -eu; \
  src_engines="$(find /workspace/node_modules/.pnpm -type d -path '*/node_modules/@prisma/engines' | head -n1)"; \
  dest_engines="$(find /production/node_modules/.pnpm -type d -path '*/node_modules/@prisma/engines' | head -n1)"; \
  if [ -z "$src_engines" ] || [ -z "$dest_engines" ]; then \
    echo "Prisma engines copy failed. src_engines='$src_engines' dest_engines='$dest_engines'"; \
    find /workspace/node_modules/.pnpm -maxdepth 3 -iname '*prisma*' -print | head; \
    find /production/node_modules/.pnpm -maxdepth 3 -iname '*prisma*' -print | head; \
    exit 1; \
  fi; \
  cp -a "$src_engines"/schema-engine-* "$dest_engines"/ 2>/dev/null || true; \
  if ! ls "$dest_engines"/schema-engine-* >/dev/null 2>&1; then \
    echo "Prisma schema-engine copy produced no binaries in $dest_engines"; \
    ls -la "$src_engines" "$dest_engines"; \
    exit 1; \
  fi

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /production ./
COPY --from=build /workspace/apps/backend/dist ./dist
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN apk add --no-cache su-exec \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/data/listening/generated \
    && chown -R node:node /app/data/listening/generated
EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
