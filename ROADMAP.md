# Capacity Management Dashboard — Implementation Roadmap

A six-step plan to build a decision-ready Nuxt dashboard from the Capacity Overview API. Complete each step before moving to the next.

API: `https://capacity.workshape.dev/api/v1/capacity-overview`

---

## Step 1 — App shell (sidebar + navbar)

**Goal:** A collapsible, mobile-friendly dashboard chrome using shadcn-vue.

**Deliverables**

- Install shadcn-vue primitives needed by the shell (`sidebar`, `button`, `breadcrumb`, `separator`, `dropdown-menu`, `tooltip`, `sheet`, `skeleton`)
- Default layout with `UiSidebarProvider`
- `AppSidebar`: brand header and nav items (Overview, Centres, Classrooms, Children)
- `AppNavbar`: sidebar trigger, breadcrumb, placeholder month selector and theme toggle
- Placeholder Overview page inside the layout

**Done when:** The shell renders on desktop and mobile, the sidebar collapses, and nav items are present even if later pages are not built yet.

---

## Step 2 — Data layer and capacity engine

**Goal:** Typed API access and derived metrics. The endpoint returns raw data only — utilization, available places, and warnings are computed here.

**Capacity rules**

- Each full-time enrolment consumes one physical place
- One three-day and one two-day enrolment may share one place
- An unpaired part-time enrolment still consumes one place
- Unassigned children are shown but do **not** count against a classroom
- Over-capacity rooms and incompatible age-group assignments are intentional signals, not API errors

**Deliverables**

- TypeScript types matching the OpenAPI schema (`CapacityOverview`, `Centre`, `Classroom`, `Enrolment`, etc.)
- `useCapacityOverview` composable (`useFetch` with optional `month=YYYY-MM`)
- Pure functions that compute occupied places, available places, utilization, unassigned children, over-capacity, and age-group mismatches
- Loading, empty, and error handling (including 422 for invalid months)

**Done when:** A unit-testable engine can take a raw API payload and return centre/classroom summaries with exceptions. No charts yet.

---

## Step 3 — Overview page (KPIs + centre cards)

**Goal:** At-a-glance status for operations users planning capacity and attendance.

**Deliverables**

- KPI cards: total capacity, occupied places, utilization, unassigned children, exception counts
- Per-centre summary cards with utilization and warning badges
- Loading, empty, and error states using shadcn-vue `Card`, `Badge`, `Skeleton`, `Alert`
- Responsive grid that works on desktop and mobile

**Done when:** An operator can see which centres need attention without opening a classroom list.

---

## Step 4 — Classroom views

**Goal:** Detail for classroom moves and attendance decisions.

**Deliverables**

- Classroom table/list per centre: name, capacity, occupied places, utilization bar, accepted age groups
- Exception signals: over-capacity and age-group mismatch
- Unassigned children list (shown, not counted against capacity)
- Optional classroom/centre routes or a filterable single page

**Done when:** An operator can identify which rooms are over capacity, which assignments are age-incompatible, and which children have no classroom.

---

## Step 5 — Charts and month switching

**Goal:** Informed charts plus a working reporting-month selector.

**Deliverables**

- Utilization comparison across centres (and optionally classrooms)
- Occupancy breakdown by age group and/or attendance type
- Month selector in the navbar wired to the API (`month` query param)
- Handle 422 validation responses for invalid/unavailable months
- Restrict the selector to `meta.available_months`

**Done when:** Changing month refetches data and charts/KPIs update. Charts stay readable on mobile.

---

## Step 6 — Quality controls, README, and deployment

**Goal:** Meet the brief’s quality and submission requirements.

**Deliverables**

- Formatting, linting, and TypeScript checking with convenient package scripts
- Meaningful automated tests (capacity engine first)
- Concise README: setup, architecture, assumptions, trade-offs, what you would improve next
- GitHub repository + live deploy (GitHub Pages, Cloudflare Pages, or similar)

**Done when:** `bun run lint`, `bun run typecheck`, and `bun run test` pass locally, the README is complete, and both repo and live URLs can be submitted.

---

## Notes

- Prefer a focused, maintainable solution over a broad one.
- Stop after six hours of work; record incomplete ideas as README trade-offs rather than stretching the exercise.
- AI tools are permitted.
