# ==============================================================
# Stage 1: builder — install all deps and build everything
# ==============================================================
FROM node:24-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /workspace

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml \
     tsconfig.json tsconfig.base.json ./

COPY artifacts/api-server/package.json      ./artifacts/api-server/
COPY artifacts/tunisian-format/package.json ./artifacts/tunisian-format/
COPY artifacts/mockup-sandbox/package.json  ./artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json      ./lib/api-client-react/
COPY lib/api-spec/package.json              ./lib/api-spec/
COPY lib/api-zod/package.json               ./lib/api-zod/
COPY lib/db/package.json                    ./lib/db/
COPY scripts/package.json                   ./scripts/

# Install all dependencies (exact versions from lockfile)
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build api-server (esbuild bundles to dist/index.mjs)
RUN pnpm --filter @workspace/api-server run build

# Build tunisian-format SPA (Vite outputs to dist/public)
RUN BASE_PATH=/ pnpm --filter @workspace/tunisian-format run build

# ==============================================================
# Stage 2: migrate — runs drizzle-kit push on startup
# ==============================================================
FROM builder AS migrate

CMD ["pnpm", "--filter", "@workspace/db", "run", "push"]

# ==============================================================
# Stage 3: api — production Node.js API server
# ==============================================================
FROM node:24-bookworm-slim AS api

WORKDIR /app

COPY --from=builder /workspace/artifacts/api-server/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]

# ==============================================================
# Stage 4: web — nginx serving the compiled SPA
# ==============================================================
FROM nginx:alpine AS web

COPY --from=builder /workspace/artifacts/tunisian-format/dist/public \
     /usr/share/nginx/html
COPY deploy/nginx-web.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
