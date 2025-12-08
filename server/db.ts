import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon connection
// Use custom WebSocket in development (Replit) environment for SSL handling
// Use standard WebSocket in production environments (Render, Vercel, etc.)
if (process.env.NODE_ENV === 'production') {
  // Production: Use standard WebSocket
  neonConfig.webSocketConstructor = ws;
} else {
  // Development (Replit): Use custom WebSocket with SSL bypass
  class CustomWebSocket extends ws {
    constructor(address: string | URL, protocols?: string | string[]) {
      super(address, protocols, {
        rejectUnauthorized: false
      });
    }
  }
  neonConfig.webSocketConstructor = CustomWebSocket as typeof ws;
}

neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with production-ready settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle({ client: pool, schema });
