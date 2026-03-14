# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Build Angular application
# ============================================
FROM node:20-alpine AS builder

# Install dependencies for node-gyp (if needed)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Accept build argument for configuration (development or production)
ARG CONFIGURATION=production
ENV CONFIGURATION=${CONFIGURATION}

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Angular app with specified configuration
RUN npm run build -- --configuration=${CONFIGURATION}

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from builder stage
# Angular 17+ outputs to dist/<project-name>/browser
COPY --from=builder /app/dist/create-learn-angular/browser /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S angular && \
    adduser -S -D -H -u 1001 -h /usr/share/nginx/html -s /sbin/nologin -G angular angular && \
    chown -R angular:angular /usr/share/nginx/html && \
    chown -R angular:angular /var/cache/nginx && \
    chown -R angular:angular /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R angular:angular /var/run/nginx.pid

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Run as non-root user
USER angular

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
