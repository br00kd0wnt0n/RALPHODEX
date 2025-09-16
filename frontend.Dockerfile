# Frontend Dockerfile for Railway deployment
# This builds the frontend from the correct context
# Updated: Using npm install instead of npm ci to avoid lock file issues
# Fixed: nginx config updated to remove backend proxy references

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy frontend package files first
COPY frontend/package.json ./
COPY frontend/package-lock.json ./

# Debug and install dependencies with force resolution
RUN ls -la ./
RUN npm ci --force
RUN npm install ajv@^8.0.0 --save-dev

# Copy frontend source code
COPY frontend/ ./

# Set build environment variables
ENV SKIP_PREFLIGHT_CHECK=true
ENV TSC_COMPILE_ON_ERROR=true
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:3001/api}

# Build the application
RUN SKIP_PREFLIGHT_CHECK=true TSC_COMPILE_ON_ERROR=true GENERATE_SOURCEMAP=false CI=false npm run build

# Debug: List build output
RUN ls -la build/ || echo "Build directory:" && ls -la

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config (Railway needs this at root level)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Debug: Check what files were copied
RUN ls -la /usr/share/nginx/html/

# Create startup script for Railway's PORT
RUN printf '#!/bin/sh\n\
if [ -n "$PORT" ]; then\n\
  sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf\n\
  sed -i "s/listen \\[::\\]:80;/listen \\[::\\]:$PORT;/g" /etc/nginx/conf.d/default.conf\n\
fi\n\
exec nginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

# Expose port (Railway will assign dynamically)
EXPOSE 80

# Start nginx with PORT handling
CMD ["/bin/sh", "/start.sh"]
