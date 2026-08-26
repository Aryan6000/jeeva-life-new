import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      nitro: {
        // Vercel preset — auto-detected by Vercel CI via NITRO_PRESET env var
        // Locally uses node-server (default)
        preset: process.env["NITRO_PRESET"] ?? "node-server",
      },
    }),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
