# Root Dockerfile for Railway deployment
# This builds the frontend from the correct context
# Updated: Using npm install instead of npm ci to avoid lock file issues

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy frontend package files first
COPY frontend/package.json ./

# Install dependencies using npm install for Railway
# This avoids package-lock.json issues
RUN npm install --legacy-peer-deps

# Copy frontend source code
COPY frontend/ ./

# Set build environment variables
ENV SKIP_PREFLIGHT_CHECK=true
ENV TSC_COMPILE_ON_ERROR=true
ENV REACT_APP_API_URL=https://your-backend-url.railway.app/api

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config (Railway needs this at root level)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Railway will assign dynamically)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]