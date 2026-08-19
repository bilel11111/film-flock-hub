# Film Flock Hub

A social film-discovery workspace for exploring titles, following recommendations, and connecting with other viewers.

## Overview

Film Flock Hub brings film discovery and social interaction into one focused interface. The application includes a home view, browse experience, title details, friends, direct messages, settings, authentication, and a conversational discovery surface.

## Highlights

- Browse and inspect film and series titles through a dedicated discovery flow.
- View title-specific details and reusable movie-card components.
- Support authenticated experiences with friends, messages, and profile settings.
- Integrate title data through a typed TMDB utility layer.
- Provide a responsive interface built for desktop and mobile layouts.

## Technology

- React 19 and TypeScript
- TanStack Start and Vite
- Tailwind CSS
- Supabase authentication and data services
- Zod for validation
- Lucide React and date-fns for interface utilities

## Local development

```bash
bun install
bun run dev
```

Create a local `.env` file from `.env.example` and provide the required Supabase and application configuration values. Never commit local environment files or service-role credentials.

## Project structure

The main application routes live under `src/routes/_app/`. Reusable presentation components are in `src/components/`, while TMDB and server integrations are isolated under `src/lib/` and `src/integrations/`.

## Status

This repository is an active portfolio project focused on discovery, authentication, and social film features.

## License



##link

orzint.com

No license has been declared yet. Add a license file before accepting external contributions or distributing the project.

## Author

**Bilel JM** — [GitHub](https://github.com/bilel11111)
