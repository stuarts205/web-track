# syntax=docker/dockerfile:1

# Multi-arch base: resolves to linux/arm64 on a Raspberry Pi (64-bit OS required).
# Debian slim (glibc) is used instead of Alpine so Next's native SWC binaries
# and the pg driver work without musl workarounds on ARM.
ARG NODE_VERSION=22-bookworm-slim

# ---------- deps: install all dependencies (dev deps needed for build + drizzle-kit)
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: compile the Next.js app
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# configs/db.tsx throws at import time without DATABASE_URL. The pool is lazy,
# so a placeholder is enough for `next build`; the real value is set at runtime.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build
ENV BETTER_AUTH_SECRET=build-time-placeholder
# Keeps the build from running out of memory on 2–4 GB Pis.
ENV NODE_OPTIONS=--max-old-space-size=1536

RUN npm run build

# ---------- migrator: one-off image that runs `drizzle-kit push` against the DB
FROM node:${NODE_VERSION} AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json drizzle.config.ts tsconfig.json ./
COPY configs ./configs
CMD ["npx", "drizzle-kit", "push"]

# ---------- runner: minimal production image
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
