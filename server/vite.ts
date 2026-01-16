import { type Express } from "express";
import fs from "fs";
import path from "path";

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

  try {
    const { createServer: createViteServer } = await import("vite");
    const { default: viteConfig } = await import("../vite.config");

    const vite = await createViteServer({
      ...viteConfig,
      server: {
        ...viteConfig.server,
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
      },
      appType: "custom",
    });

    app.use(vite.middlewares);

    // Serve index.html for all non-API routes (SPA fallback)
    // This MUST be after vite.middlewares so Vite handles module requests first
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;

      // Skip API routes
      if (url.startsWith("/api")) {
        return next();
      }

      // Skip if Vite has already handled this request (headers sent)
      if (res.headersSent) {
        return;
      }

      // Skip Vite-specific internal paths
      if (
        url.startsWith("/@id/") ||
        url.startsWith("/@fs/") ||
        url.startsWith("/@vite/") ||
        url.startsWith("/src/") ||
        url.startsWith("/node_modules/")
      ) {
        return next();
      }

      try {
        // Read index.html from the client directory
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "client", "index.html"),
          "utf-8"
        );

        // Apply Vite HTML transforms (injects HMR client, etc.)
        template = await vite.transformIndexHtml(url, template);

        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    log("Vite dev server active", "vite");
  } catch (error) {
    // Vite not available - probably production environment
    log("Vite not available (production environment)", "vite");
  }
}

// NO STATIC SERVE IN PRODUCTION
export function serveStatic() {
  // intentionally empty — frontend is on Vercel
}
