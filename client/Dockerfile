# Multi-stage build for React app
FROM node:20-alpine as build-stage

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    autoconf \
    automake \
    libtool \
    nasm \
    build-base \
    libpng-dev \
    libjpeg-turbo-dev \
    giflib-dev \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set Node.js memory options and build the app
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration (use simple http config)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
