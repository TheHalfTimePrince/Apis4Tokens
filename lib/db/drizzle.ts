import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Add this if you need to load env variables outside Next.js runtime
import { loadEnvConfig } from '@next/env';

// Load env variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

export const db = drizzle(sql, { schema });
