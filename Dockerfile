# Multi-stage build for FluxoLab Platform
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development dependencies
FROM base AS dev-deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci

# Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build backend
FROM base AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fluxolab

# Copy production dependencies
COPY --from=deps --chown=fluxolab:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=fluxolab:nodejs /app/backend/node_modules ./backend/node_modules

# Copy built applications
COPY --from=frontend-builder --chown=fluxolab:nodejs /app/dist ./frontend/dist
COPY --from=backend-builder --chown=fluxolab:nodejs /app/backend/dist ./backend/dist

# Copy configuration files
COPY --chown=fluxolab:nodejs package*.json ./
COPY --chown=fluxolab:nodejs backend/package*.json ./backend/
COPY --chown=fluxolab:nodejs backend/nest-cli.json ./backend/
COPY --chown=fluxolab:nodejs backend/tsconfig*.json ./backend/
COPY --chown=fluxolab:nodejs frontend/package*.json ./frontend/
COPY --chown=fluxolab:nodejs frontend/tsconfig*.json ./frontend/
COPY --chown=fluxolab:nodejs frontend/vite.config.ts ./frontend/
COPY --chown=fluxolab:nodejs frontend/tailwind.config.js ./frontend/
COPY --chown=fluxolab:nodejs frontend/postcss.config.js ./frontend/

# Copy source files for development
COPY --chown=fluxolab:nodejs . .

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd backend && npm ci --only=production && npm cache clean --force

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp
RUN chown -R fluxolab:nodejs /app/logs /app/uploads /app/temp

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Switch to non-root user
USER fluxolab

# Start the application
CMD ["npm", "run", "start:prod"]
