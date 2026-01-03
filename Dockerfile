# Base dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npm audit fix --force || true

# Build app
FROM deps AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# .env file is already copied from COPY . . above
# Build the application
RUN npm run build

# Production
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

# Environment variables will be provided at runtime
ENV NODE_ENV=production
ENV PORT=5555

EXPOSE 5555

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5555/api/health || exit 1

CMD ["npm", "start"]
