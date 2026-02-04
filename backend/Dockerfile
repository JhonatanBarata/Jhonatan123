FROM node:20-slim

# Install OpenSSL / CA certificates for Prisma client native engines.
# Try to install libssl3 (newer Debian) and fall back to libssl1.1 when available.
RUN apt-get update -y && \
	apt-get install -y --no-install-recommends ca-certificates openssl libssl3 || true && \
	(apt-get install -y --no-install-recommends libssl1.1 || true) && \
	rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
# Install dependencies inside the image so the container has all modules.
# We still mount the source code at runtime for fast iteration; installing
# here ensures the anonymous /app/node_modules volume is seeded on first run.
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma

# Generate Prisma client at build time so the runtime doesn't need to generate it.
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
