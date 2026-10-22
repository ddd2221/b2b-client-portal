# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Enable hot reload polling inside containers
ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies first for Docker layer caching
COPY package.json ./
RUN npm install

# Copy application source code
COPY . .

EXPOSE 3000

# Run Next.js in hot-reloading development mode
CMD ["npm", "run", "dev"]
