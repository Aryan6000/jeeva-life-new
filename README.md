# JeevaLife

A wellbeing web app for tracking daily check-ins, logging practices, and following programme journeys.

## Tech stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework with SSR
- [TanStack Router](https://tanstack.com/router) and [TanStack Query](https://tanstack.com/query)
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- shadcn/ui (built on Radix UI primitives)

## Requirements

- [Node.js](https://nodejs.org) 20.19+ or 22.12+ (npm is included with Node.js)

## Getting started

```sh
npm install     # install dependencies
npm run dev     # start the dev server (URL is printed in the terminal, usually http://localhost:5173)
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run format` — format the codebase with Prettier

## Production

`npm run build` produces a Node.js server bundle in `.output/`. Run it with:

```sh
node .output/server/index.mjs
```

The build is powered by Nitro. To target a different host, set the `NITRO_PRESET`
environment variable at build time (for example `NITRO_PRESET=cloudflare-module`).

## Project structure

- `src/routes/` — file-based routes (`__root.tsx` is the app shell and error/404 boundaries)
- `src/components/` — UI components (`ui/` is shadcn/ui, `jeeva/` is app-specific)
- `src/lib/` — application logic, stores, and helpers
- `src/server.ts` and `src/start.ts` — custom SSR server entry and start instance (auto-detected by TanStack Start)
- `src/routeTree.gen.ts` — generated route tree (do not edit by hand)
