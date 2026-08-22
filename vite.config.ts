import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

// Standard TanStack Start + Vite configuration.
//
// Plugin order matters: tanstackStart() must be registered before viteReact().
// The SSR server entry is auto-detected from src/server.ts (our error wrapper),
// and the custom start instance from src/start.ts.
//
// Build target: Nitro's default preset builds a Node.js server into .output/
// (run it with `node .output/server/index.mjs`). To deploy elsewhere later,
// set the NITRO_PRESET env var at build time (e.g. NITRO_PRESET=cloudflare-module).
export default defineConfig({
  plugins: [
    // Resolves the "@/*" path alias declared in tsconfig.json.
    tsConfigPaths(),
    // Tailwind CSS v4.
    tailwindcss(),
    // TanStack Start: SSR, file-based routing, and server functions.
    tanstackStart(),
    // React (Fast Refresh / JSX) — must come after tanstackStart().
    viteReact(),
  ],
  resolve: {
    // Keep a single copy of React across the dependency graph to avoid
    // duplicate hook/context bugs.
    dedupe: ["react", "react-dom"],
  },
});
