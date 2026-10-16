# syntax=docker/dockerfile:1

# Dearmine API — Node/Express + Prisma on Neon.
# The web app is deployed separately (Vercel); this image serves the REST API only.

FROM node:22-slim

# Prisma needs OpenSSL at runtime; ca-certificates for outbound TLS
# (Neon, Cloudflare R2, SMTP, Razorpay).
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Install all dependencies (build tools included) and generate the Prisma client.
# The client MUST be generated inside this image so its engine matches the platform.
COPY package.json package-lock.json ./
RUN npm ci --include=dev && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

# Build the API bundle (tsup bundles server + src/shared into server/dist/index.js).
COPY tsconfig*.json ./
COPY src ./src
COPY server ./server
RUN npm run build:api

EXPOSE 4000

# Apply pending migrations, then start the API.
# Listens on $PORT (Render injects PORT at runtime).
CMD ["sh", "-c", "npx prisma migrate deploy && node server/dist/index.js"]
