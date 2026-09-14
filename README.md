# NeuroNote

**A little curiosity. A connected mind.**

An AI-powered second brain for students, starting with a carefully scoped frontend foundation. Phases 1–2 use frontend demo data only: no backend, authentication, storage service, file parsing, AI, or graph implementation.

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
- Four mock brains, extended in Phase 2 with shared in-memory state that survives client navigation and resets on a full refresh.
- Workspace summary pages; clear future-phase placeholders for study features.
- Route loading skeleton, error recovery, not-found page, visible focus, skip link, reduced-motion support.

The small connected-node illustration is decorative SVG. XYFlow is intentionally not installed until the graph phase. Supabase, document parsing, and AI are intentionally not implemented.

## Phase 2

- Brain creation with category, icon, optional description, duplicate-name validation, editing/renaming, and confirmed deletion.
- Brain detail pages with Overview, Documents, Notes, Concepts, Flashcards, and Quizzes tabs; keyboard-accessible tab navigation and read-only study samples.
- Document library with search, brain/type/status filters, sorting, grid/list views, and mobile filter controls.
- Drag-and-drop and file-picker queues for PDF, DOCX, PPTX, TXT, Markdown, and PNG/JPG/WEBP/GIF images. Up to 20 non-empty files, 25 MB each. Pasted text is also supported.
- A brain must be chosen before processing. Only metadata is retained for selected files; the app never reads file bytes, uploads files, or makes fake API calls. Pasted text stays in memory.
- A shared timer advances the mock processing stages from Waiting through Complete. The optional first-file failure simulation and a seeded failed document provide reproducible retry flows. Processing continues across client navigation and stops when no active documents remain.
- Viewer placeholder with page controls for known sample page counts, zoom, expanded fullscreen view, extracted-text panel, topics, concepts, and study-material counts. New file page counts remain unknown because no parsing happens.
- Rename, move, delete, reprocess, retry, and open actions. Deletion and replacement of existing processed material require confirmation.

### State and scope

`WorkspaceState` normalizes brains, documents, topics, and concepts. Reducer actions maintain references: deleting a brain cascades to its documents and material; moving a document preserves its material; reprocessing replaces results without duplication. Resource totals are derived from records. Mastery, streaks, activity, reviews, notes, and quiz results are explicitly illustrative study history, not a real learning engine.

The provider owns session state; no persistence or real storage is added. Refreshing or opening a new browser tab resets to seed data. Future backend work can replace the provider/action boundary without changing the presentation components. Browser UUIDs and timestamps are created in event handlers, not during rendering or in the reducer.

Sample results come from centralized fixtures and are not inferred from uploaded content. Pasted text is preserved across a reprocess. The actual flashcard/quiz engines and knowledge graph remain out of scope.

## Stack and organization

Next.js 16.3.5 (latest stable at setup), React 19, strict TypeScript, Tailwind CSS 4, shadcn/ui components generated with the official CLI and customized locally, Motion, Lucide, cmdk, and next-themes.

```text
src/app/                       App Router layout, pages, route states, global styles
src/app/[section]/page.tsx      Validated section routes and page metadata
src/components/app-shell.tsx    Navigation, header, mobile drawer, theme toggle
src/components/search-command.tsx  Search palette
src/components/dashboard/      Dashboard and reusable brain cards
src/components/section-page.tsx Settings and future-phase pages
src/components/ui/             Reusable Button, Dialog, Skeleton primitives
src/components/providers.tsx   Theme, reduced-motion, and workspace providers
src/data/mock-data.ts          Dashboard labels and historical sample activity
src/data/workspace-seed.ts     Centralized subjects, source material, topics, concepts
src/types/workspace.ts         Domain types and processing states
src/state/                    Shared provider and pure workspace reducer
src/components/brains/         Brain CRUD, detail tabs, and subject icons
src/components/documents/      Library, queue, actions, simulation status, viewer
src/components/shared/         Confirmation dialogs and empty panels
src/lib/                       Navigation definitions and class-name helper
tests/shell.spec.ts             Browser interaction and responsive regression tests
```

Mock records remain separate from the UI and `BrainCard` accepts a typed record. A later data layer can supply those records without adding fake API endpoints now. UI state belongs to client components; routing and metadata use server components. The dashboard consumes the same client store as the library so resource counts and brain cards stay consistent.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

Browser tests run against the production server at desktop (1440px), laptop (1280px), tablet (820px), and mobile (390px) widths. They cover navigation, horizontal overflow, theme persistence, console runtime errors, keyboard search, empty results, workspace validation, mobile focus restoration, sidebar collapse, and the continue-study placeholder. Phase 2 adds brain editing/deletion, library filters and sorting, upload validation, processing failure/retry, document moves, pasted-text preservation during reprocessing, viewer controls, missing records, and reducer referential-integrity checks. Tests use an isolated production server on port 3100. Screenshots are saved under ignored `test-results/` for visual review.

ESLint is pinned to 9.39.5 because the current Next.js React lint plugin uses APIs removed in ESLint 10. npm reports this release as deprecated; lint itself runs with zero warnings. Revisit the pin when the upstream config supports ESLint 10.

## Git workflow

Public repository: https://github.com/pranav-5412/neuronote

Complete and verify each phase, then wait for the owner to say **“ok”** or **“done”** before committing that phase. Phases 1 and 2 were approved by the owner.
