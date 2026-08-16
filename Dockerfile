# Multi-stage Dockerfile for Yatri.in Full-Stack Application

# Stage 1: Build Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install
COPY frontend/ ./frontend/
RUN npm run build --workspace frontend

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --only=production

COPY backend/ ./backend/
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["node", "backend/server.js"]
