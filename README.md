# Film Hub / Orzint

> **A social film-discovery workspace for browsing titles, saving ideas, and connecting with other viewers.**

Film Hub is the source repository behind [Orzint](https://orzint.com), a responsive experience for discovering movies and TV series. The project combines a title-discovery workflow with authenticated social features, including friends, direct messages, profile settings, and an AI-assisted discovery surface.

## What the project does

| Area | Current capability |
| --- | --- |
| Film discovery | Browse movies and series, inspect title details, and surface recommendations through reusable movie-card components and a typed title-data utility layer. |
| Social workspace | Use authenticated profiles, friends, direct messages, and personal settings as part of the viewer experience. |
| Personal library | Maintain a watchlist-oriented viewing workflow and track personal activity through the application interface. |
| Conversational discovery | Access an AI Chat section intended to help people explore titles and viewing ideas. |
| Responsive navigation | Use a full desktop navigation bar and a compact mobile bottom navigation for the core app sections. |
| Administration | Expose an admin entry point only for users identified as administrators by the authentication layer. |

The live public application is available at **[orzint.com](https://orzint.com)**. Its repository homepage is configured to point to that address.

## Technology

The application is a TypeScript project built with **React 19**, **TanStack Start**, **Vite**, and **Tailwind CSS**. It uses **Supabase** for authentication and application data services, with TanStack Query for client-side data workflows. Supporting libraries include Zod for validation, Lucide for interface icons, and date-fns for date handling.

| Layer | Main tools |
| --- | --- |
| Frontend | React 19, TypeScript, Tailwind CSS, Radix UI primitives |
| Application framework | TanStack Start, TanStack Router, Vite |
| Data and auth | Supabase JavaScript client, TanStack Query |
| Validation and utilities | Zod, React Hook Form, date-fns, Lucide React |
| Package workflow | Bun (`bun.lock` is committed) |

## Prerequisites

Install a current version of [Bun](https://bun.sh) before working with the project. You will also need access to a Supabase project configured for the environment you intend to run.

## Local development

Clone the repository and install the locked dependencies.

```bash
git clone https://github.com/bilel11111/film-flock-hub.git
cd film-flock-hub
bun install
```

Create a local environment file from the checked-in example, then supply values from your Supabase project.

```bash
cp .env.example .env
```

Start the development server with:

```bash
bun run dev
```

The repository also provides the following commands.

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Vite development server. |
| `bun run build` | Build the production application. |
| `bun run build:dev` | Build with Vite’s development mode. |
| `bun run preview` | Preview a local production build. |
| `bun run lint` | Run ESLint across the repository. |
| `bun run format` | Format supported files with Prettier. |

## Environment configuration

The application includes an `.env.example` file. Keep actual values in a local `.env` file, and never commit credentials, API secrets, service-role keys, or production configuration files.

| Variable | Use |
| --- | --- |
| `SUPABASE_PROJECT_ID` | Server-side identifier for the connected Supabase project. |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable credential used by the Supabase integration. |
| `SUPABASE_URL` | URL for the connected Supabase project. |
| `VITE_SUPABASE_PROJECT_ID` | Client-exposed project identifier used by the Vite application. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client-exposed publishable key used by the Vite application. |
| `VITE_SUPABASE_URL` | Client-exposed Supabase project URL. |

> Variables prefixed with `VITE_` are included in the client build. Only place values intended for browser use in those variables; do not expose private keys in them.

## Project structure

The application follows TanStack Start’s file-based routing conventions. The `src/routes/__root.tsx` route supplies the global app shell, while `src/routes/_app.tsx` provides the authenticated layout and navigation. Do not manually edit generated route-tree output.

| Path | Responsibility |
| --- | --- |
| `src/routes/` | TanStack Start routes, root layout, authentication entry point, and authenticated application shell. |
| `src/components/movie-card.tsx` | Reusable display component for film and series titles. |
| `src/hooks/use-auth.ts` | Authenticated user and profile behavior. |
| `src/lib/tmdb-utils.ts` and `src/lib/tmdb.functions.ts` | Typed title-data helpers and integrations. |
| `src/lib/config.server.ts` | Server-side configuration support. |
| `src/assets/` | Brand and visual assets used by the application. |
| `.env.example` | Documented environment-variable names, without secret values. |

## Content and link responsibility

Film Hub is designed for lawful film discovery, metadata browsing, social conversation, and user-managed lists. The project’s title-data helpers and user interface do **not** grant rights to distribute, host, or stream copyrighted works.

If you add an external viewing link, verify that it points to an authorized source for the relevant territory and rights holder. Keep moderation, access control, privacy, age classification, and takedown processes appropriate to the jurisdictions and content you serve. Do not commit copyrighted media files, private user data, or unlicensed stream URLs to this public repository.

## Deployment notes

Before deploying, set the same environment variables in the target platform’s secret manager, configure the Supabase redirect URLs for the public origin, and test both authenticated and unauthenticated paths. The repository’s homepage points to [orzint.com](https://orzint.com); update DNS and hosting settings separately from GitHub when changing the live destination.

## Contributing

Keep changes focused, run `bun run lint` and `bun run build` before opening a pull request, and document any new environment variable in `.env.example`. Do not include actual secret values in commits or issues.

## License

No license has been declared. Add an explicit license before accepting external contributions or distributing the source under defined permissions.

## Maintainer

**Bilel JM** — [GitHub](https://github.com/bilel11111)
