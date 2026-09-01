# Capacity management dashboard

Operations dashboard for centre, classroom, and enrolment capacity. Built with Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, and shadcn-vue.

- **Live:** [management-dashboard.dastaran.com](https://management-dashboard.dastaran.com)
- **Source:** [github.com/MohsenDastaran/management-dashboard](https://github.com/MohsenDastaran/management-dashboard)

## Rendering modee

The app runs in **both SSR and CSR**. Switch with `ssr` in `[nuxt.config.ts](nuxt.config.ts)`:

| Mode            | Config       | What you get                                                                              |
| --------------- | ------------ | ----------------------------------------------------------------------------------------- |
| SSR (universal) | `ssr: true`  | HTML is rendered on the server, then hydrated in the browser. Better first paint and SEO. |
| CSR (SPA)       | `ssr: false` | The shell is sent to the browser and Vue renders everything on the client.                |

This repo is set to `ssr: false`. `bun run dev` and `bun run build` follow that flag. For a static client-only deploy, set `ssr: true` and use `bun run generate`.

## Features

- **Overview** — capacity, occupied places, utilisation, unassigned children, and exception counts, plus utilisation and enrolment-mix charts
- **Centres** — per-centre occupancy and exception signals
- **Classrooms** — rooms grouped by centre, occupancy, accepted age groups, over-capacity and age-mismatch flags
- **Children** — enrolments, assignments, and unassigned children
- **Reporting month** — year stepper and month grid; requests `?month=YYYY-MM`
- **Local what-if edits** — classroom and child changes stay in memory on this device (no edit API). They reset on refresh or month change
- **Validation** — invalid edit fields are blocked; malformed API payloads surface an error instead of crashing the dashboard

## Capacity rules

The [Capacity Overview API](https://capacity.workshape.dev/api/v1/capacity-overview) is read-only. Occupancy and exceptions are derived in `app/lib/capacity.ts`:

- Each full-time enrolment consumes one physical place
- One three-day and one two-day enrolment may share one place
- An unpaired part-time enrolment still consumes one place
- Unassigned children are shown but never counted against a classroom
- Over-capacity rooms and incompatible age groups are signals, not errors

## Setup

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script             | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `bun run dev`      | Development server                              |
| `bun run build`    | Production build (SSR when `ssr: true`)         |
| `bun run preview`  | Serve the production build                      |
| `bun run generate` | Static output (use with `ssr: false` for a SPA) |

The API base URL is `runtimeConfig.public.apiBase` (`https://capacity.workshape.dev`). Override with `NUXT_PUBLIC_API_BASE` if needed.

## Architecture

```
app/
  pages/            Overview, centres, classrooms, children
  composables/      Fetch, reporting month, in-memory edits, theme
  lib/capacity.ts   Pure occupancy engine
  lib/editValidation.ts  Form and payload checks
  components/       Cards, charts, edit modals, shell
  types/capacity.ts OpenAPI-aligned types
```

`useCapacityOverview` loads `GET /api/v1/capacity-overview` with `useAsyncData` (one request per reporting month), overlays local edits, then `summarize()` for KPIs and charts.

## Assumptions and trade-offs

- The API has no write endpoints, so edits are client-only and are not persisted
- Age mismatches are allowed on purpose; the UI warns but does not block them
- Charts are CSS bar layouts rather than a charting library, to keep the bundle small
- Automated tests, lint, and typecheck scripts from the original brief are not wired up yet
