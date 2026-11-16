# DAYFLOW

DAYFLOW is a responsive personal productivity and finance dashboard built with
React, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide, and Recharts.

## Getting started

```sh
npm install
npm run dev
```

The app starts at `/dashboard`; signed-out visitors are routed to `/login`.
Authenticated tasks, transactions, budgets, savings goals, and profile data load
from the user's Supabase account.

## Supabase configuration

Copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project API settings. Never
put a `service_role` or secret key in this frontend project. Restart Vite after
changing environment variables. Apply the DAYFLOW SQL schema in the Supabase
SQL Editor before using the app; the tables use Row Level Security and are
queried only for the signed-in user. Add the app's local and deployed
`/reset-password` URLs to Supabase Authentication's allowed redirect URLs.

## Available scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check the project and create a production build.
- `npm run lint` — run ESLint.
- `npm run preview` — preview the production build locally.

## Routes

- `/dashboard`
- `/tasks`
- `/calendar`
- `/transactions`
- `/budgets`
- `/savings`
- `/reports`
- `/settings`
- `/login`, `/register`, `/forgot-password`, and `/reset-password`

## Project structure

- `src/components/` — shared layout, UI, task, and finance components.
- `src/contexts/` — shared client-side application state.
- `src/data/` — starter data retained for development reference.
- `src/pages/` — route-level screens.
- `src/services/` — Supabase task, finance, and dashboard data access.
- `src/index.css` — Tailwind v4 setup and shared DAYFLOW design tokens.
