FROM node:20-alpine AS base
# Alpine is ~5x smaller than ubuntu/debian
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
# Install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

FROM base AS builder
# Build the application
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js - static pages will be skipped if DB not available
RUN npm run build

FROM base AS runner
# Production runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install netcat for healthcheck and su-exec for user switching
RUN apk add --no-cache netcat-openbsd su-exec

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy application files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/

RUN mkdir -p .next && chown nextjs:nodejs .next && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
