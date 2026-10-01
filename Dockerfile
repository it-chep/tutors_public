# ---- Stage 1: сборка приложения ----
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: раздача SPA ----
FROM node:18-alpine
RUN npm install -g serve

COPY --from=builder /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
