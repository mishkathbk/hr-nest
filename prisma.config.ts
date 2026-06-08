// prisma.config.ts
// Prisma 7 requires the database URL to be defined here (not in schema.prisma).
// The Prisma CLI reads this file automatically when running any `prisma` command.
// dotenv.config() is called here so that DATABASE_URL from .env is available
// to all Prisma CLI commands (db pull, db push, generate, etc.).

import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
