# NeuroNote

**A little curiosity. A connected mind.**

An AI-powered second brain for students, starting with a carefully scoped frontend foundation. Phase 1 contains mock data and no backend, authentication, file processing, AI, or graph implementation.

## Run locally

Requires Node.js 20.9 or later (verified with Node.js 24).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or service credentials are needed.

## Phase 1

- Responsive application shell, collapsible desktop sidebar, focus-managed mobile drawer, and ten navigation destinations.
- Dashboard with study statistics, overall mastery, streak, continuing study, subject workspaces, and recent activity.
- Search with Command/Ctrl+K, keyboard navigation, subject/page matching, and no-result feedback.
- Light, dark, and system appearance, persisted on the device.
- Four mock brains and temporary in-memory brain creation with name validation. New brains reset when the workspace page unmounts or refreshes.
- Workspace summary pages; clear future-phase placeholders for study features.
- Route loading skeleton, error recovery, not-found page, visible focus, skip link, reduced-motion support.

The small connected-node illustration is decorative SVG. XYFlow is intentionally not installed until the graph phase. Supabase, document parsing, and AI are intentionally not implemented.

## Stack and organization

Next.js 16.3.5 (latest stable at setup), React 19, strict TypeScript, Tailwind CSS 4, shadcn/ui components generated with the official CLI and customized locally, Motion, Lucide, cmdk, and next-themes.

```text
src/app/                       App Router layout, pages, route states, global styles
src/app/[section]/page.tsx      Validated section routes and page metadata
src/components/app-shell.tsx    Navigation, header, mobile drawer, theme toggle
src/components/search-command.tsx  Search palette
src/components/dashboard/      Dashboard and reusable brain cards
src/components/section-page.tsx Workspace preview, settings, future-phase pages
src/components/ui/             Reusable Button, Dialog, Skeleton primitives
src/components/providers.tsx   Theme and reduced-motion providers
src/data/mock-data.ts          Typed mock workspaces, statistics, activity, session
src/lib/                       Navigation definitions and class-name helper
tests/shell.spec.ts             Browser interaction and responsive regression tests
```

Mock records remain separate from the UI and `BrainCard` accepts a typed record. A later data layer can supply those records without adding fake API endpoints now. UI state belongs to client components; routing, metadata, and the static dashboard use server components.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

Browser tests run against the production server at desktop (1440px), tablet (820px), and mobile (390px) widths. They cover navigation, horizontal overflow, theme persistence, console runtime errors, keyboard search, empty results, workspace validation, mobile focus restoration, sidebar collapse, and the continue-study placeholder. Screenshots are saved under ignored `test-results/` for visual review.

ESLint is pinned to 9.39.5 because the current Next.js React lint plugin uses APIs removed in ESLint 10. npm reports this release as deprecated; lint itself runs with zero warnings. Revisit the pin when the upstream config supports ESLint 10.

## Git workflow

Public repository: https://github.com/pranav-5412/neuronote

Complete and verify each phase, then wait for the owner to say **“ok”** or **“done”** before committing that phase. Phase 1 was approved by the owner.
