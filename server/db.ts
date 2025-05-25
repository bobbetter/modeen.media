import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { env } from "./config/environment";

neonConfig.webSocketConstructor = ws;

const dbConfig = env.getDatabaseConfig();
export const pool = new Pool({ connectionString: dbConfig.url });
export const db = drizzle(pool, { schema });