// Prisma configuration for Prisma 6
// This file is automatically loaded by Prisma CLI

// For Prisma 6, we use environment variables for configuration
// See .env for database connection settings
// prisma.config.ts
// prisma.config.ts (6.13.0)
import 'dotenv/config'                 // helps with env loading edge cases
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
    schema: path.join('prisma', 'schema.prisma'),
    migrations: {
        path: path.join('prisma', 'migrations'),
        // Use tsx to run TS in ESM cleanly. Add -r tsconfig-paths/register if you use path aliases.
        seed: 'tsx prisma/seed.ts',
        // or: seed: 'tsx -r tsconfig-paths/register prisma/seed.ts'
    },
})

