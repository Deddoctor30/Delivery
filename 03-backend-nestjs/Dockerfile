# ---- builder: полные зависимости, генерация клиента, сборка ----
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# ---- runtime: тот же базовый образ, переносим готовое ----
FROM node:20-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

# node_modules с уже сгенерированным Prisma Client, установленной prisma CLI и собранным bcrypt
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/static ./static
COPY --from=builder /app/package*.json ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3001
CMD ["./entrypoint.sh"]
