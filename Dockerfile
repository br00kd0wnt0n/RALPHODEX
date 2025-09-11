# Root Dockerfile for Railway deployment
# This builds the frontend from the correct context
# Updated: Using npm install instead of npm ci to avoid lock file issues
# Fixed: nginx config updated to remove backend proxy references

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (React app is at root level)
COPY package.json ./
COPY package-lock.json ./

# Debug and install dependencies with force resolution
RUN ls -la ./
RUN npm ci --force
RUN npm install ajv@^8.0.0 --save-dev

# Copy source code
COPY . ./ 

# Exclude backend and other non-frontend files
RUN rm -rf backend/ docs/ *.md *.pdf *.xlsx

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