# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Ensure the data directory exists for SQLite
RUN mkdir -p server/data server/uploads

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
