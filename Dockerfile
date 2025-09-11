# Root Dockerfile for Railway deployment
# This builds the frontend from the correct context

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

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

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Railway will assign dynamically)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]