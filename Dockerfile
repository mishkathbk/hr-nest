# Stage 1: Build the application
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy generated prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
