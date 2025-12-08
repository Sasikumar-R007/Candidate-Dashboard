import { type Express } from "express";

// Simple logger for both dev & prod
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// DEVELOPMENT ONLY — Vite dev server
export async function setupVite(app: Express, server: any) {
  if (process.env.NODE_ENV === "production") {
    return; // never load vite on Render
  }

  const { createServer: createViteServer } = await import("vite");
  const { default: viteConfig } = await import("../vite.config");

  const vite = await createViteServer({
    ...viteConfig,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  log("Vite dev server active", "vite");
}

// NO STATIC SERVE IN PRODUCTION
export function serveStatic() {
  // intentionally empty — frontend is on Vercel
}
