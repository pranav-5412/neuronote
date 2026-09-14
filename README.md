# NeuroNote

**A little curiosity. A connected mind.**

NeuroNote is a student second brain. Phase 3 replaces the earlier in-memory Brain/document demo with a Supabase foundation: email authentication, profiles, saved workspaces, document metadata, and private original files. The Phase 1/2 visual design and navigation are retained.

**A Supabase project is required to use accounts and the workspace.** The project has been provisioned; local configuration lives in the ignored `.env.local`. AI, parsing, OCR, embeddings, RAG, the graph, study generation, and mastery/streak calculations remain future work.

## Run locally

Node.js 24 is recommended (used for verification).

```sh
npm ci
cp .env.example .env.local
```

Complete [the Supabase setup guide](docs/SUPABASE_SETUP.md), then run:

```sh
npm run dev
```

Open the exact address configured in `NEXT_PUBLIC_SITE_URL`. For the in-app browser, use `http://127.0.0.1:3000` consistently. For production mode, run `npm run build` followed by `npm start`. Rebuild and restart after changing public environment variables.

## Implemented

- Email/password signup, email confirmation, login, logout, cookie session refresh, protected pages, safe redirects, and useful auth errors/loading.
- Automatic profile creation and display-name editing. Avatar URL is reserved; avatar uploads are deferred.
- Persistent Brain creation, listing, editing, and deletion. Nonempty brains cannot be deleted; move or delete documents first.
- Private uploads and pasted text, server-side format/MIME/signature/size validation, metadata persistence, renaming, moving, deletion, and short-lived download links.
- Real loading/error feedback. Partial uploads and failed deletions remain visible and recoverable. No simulated processing or fabricated study history is attached to real accounts.
- Existing responsive shell, command search, theme settings, library filters, cards, and source preview placeholder. Original files can be downloaded; previews do not parse or render their contents yet.

## Data and security

Two ordered migrations define `profiles`, `brains`, `documents`, `document_chunks`, `concepts`, `concept_connections`, `notes`, `flashcards`, `flashcard_reviews`, `quizzes`, `quiz_questions`, `quiz_attempts`, and `mastery_records`. Only profiles, brains, and documents are actively used.

All 13 tables have RLS and separate owner SELECT/INSERT/UPDATE/DELETE policies (52 policies). Composite foreign keys prevent linking child rows to another user's parents. Identity fields are immutable. Consistent database triggers maintain `updated_at`; the auth trigger creates profiles.

The `study-documents` bucket is private, limited to 25 MB and the supported MIME types. Three storage policies restrict reading, inserting, and deleting to owned document paths and permitted lifecycle states; there is no overwrite/update policy. Paths use `user UUID/document UUID/random UUID.extension`. Brain IDs are deliberately omitted so moving a document does not require a risky storage copy/delete.

Uploads create a metadata record before saving the file and only become `uploaded` after storage succeeds. Failed uploads are marked `upload_failed` before cleanup. Interrupted requests leave a visible row; after two minutes it can be deleted and uploaded again. Deletion marks the record, removes storage through its API, then deletes metadata. A database trigger blocks metadata deletion while storage still has the object. A failed step leaves a retryable row. This is compensating cleanup, not a distributed transaction or background repair worker.

Deleting a source cascades its derived chunks; notes, flashcards, concepts, and quizzes retain their content with a nullable source reference. Deleting an empty brain removes its remaining associated study material, as the confirmation explains. Account deletion is intentionally restricted until owned data is cleaned up; no account-deletion UI is implemented.

Server-only repositories and services verify the session before data access and derive ownership from the authenticated user. RLS is an additional boundary. Browser code receives neither service credentials nor storage paths in workspace data. Downloads use authenticated routes and 60-second signed URLs; treat a signed URL as a temporary bearer link. A link already issued can work until it expires.

## Architecture

```text
src/app/(auth)/              Login/signup and loading
src/app/(workspace)/         Protected layout, dashboard, section routes
src/app/auth/confirm/        Email confirmation handler
src/app/api/documents/      Authenticated multipart upload and download routes
src/proxy.ts                Next.js 16 session refresh entry point
src/lib/supabase/            Typed browser/server clients and cookie handling
src/lib/repositories/        Verified session, workspace queries, mutations
src/lib/services/            Document storage lifecycle and recovery
src/lib/validation/          Forms, files, request size, origin checks
src/actions/                Server action boundary
src/state/                  Remote workspace snapshot, pending/error feedback
src/types/database.ts       Generated database types, including relationships
src/types/workspace.ts      UI/domain models
src/components/             Existing reusable UI, auth, profile settings
src/data/workspace-options.ts Static categories and future-study placeholders
supabase/migrations/        Ordered schema, security, and storage SQL
scripts/                    Local schema loader and type generation
```

The old mock reducer and seed persistence have been removed. Remaining static study examples are limited to future-feature presentation; real workspace data starts empty. The dashboard shows actual document totals, with study features explicitly pending.

## Verification

```sh
npm run db:types
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

`test:unit` runs migration-backed PostgreSQL tests in PGlite with minimal test-only Supabase auth/storage schemas. Tests exercise all 13 tables' cross-user isolation, insert spoofing, parent ownership, private storage policies, deletion order, timestamp triggers, file/request validation, and redirect validation. Lifecycle unit tests inject storage/metadata failures and verify recovery ordering.

These are **not hosted Supabase integration tests**: the fixtures do not run GoTrue, PostgREST, SMTP, or the actual Storage service. The guide contains the required two-account live acceptance checklist.

Playwright runs the unconfigured app on port 3100 at desktop 1440px, laptop 1280px, tablet 820px, and mobile 390px. It checks auth routes, theme persistence, responsive overflow, runtime errors, expired confirmation, protected redirects, and rejected file requests. Build without Supabase variables for this offline suite; both runtime variables are cleared by its server configuration. Full authenticated workspace browser testing remains pending a project. Screenshots/traces are ignored under `test-results/`.

Database types are generated from the actual ordered migrations applied to local PostgreSQL (no credentials needed), including nullability, defaults, enums, and public foreign keys. Regenerate when migrations change. Future migrations should be additive; do not edit an already-applied migration.

ESLint remains pinned to 9.39.5 for compatibility with the Next.js plugin. Dependency installation may note that upstream deprecation; lint runs with zero warnings. If your shell sets both `NO_COLOR` and `FORCE_COLOR`, use `env -u NO_COLOR npm run test:e2e` to avoid Node's unrelated color-environment warning.

## Deployment limits

This upload endpoint requires a Node host/proxy accepting a 26 MB multipart body and at least a 120-second request window. Some serverless hosts impose smaller body limits; confirm your host's limits before deployment. Do not advertise 25 MB uploads on a host that cannot accept them. File signatures provide basic format screening, not full document validation or malware scanning. No deployment was performed.

Workspace reads currently load the account's full Brain/document lists. Pagination and background cleanup are future scaling work. Uploaded files stay `uploaded`; no fake progress toward AI results is shown.

## Git workflow

Public repository: https://github.com/pranav-5412/neuronote

Verify each phase, then wait for the owner to say **“ok”** or **“done”** before committing that phase. Phase 3 is left uncommitted for review.
