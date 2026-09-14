# Phase 3 handoff

The Supabase foundation is implemented and the hosted project is provisioned. Project ref: `rpuqrsdhuvmpuezttsuy`. Phase 3 has not been committed or pushed. The local preview is available at http://127.0.0.1:3000/login.

## Features and scope

- Email signup/confirmation, login, logout, session refresh, protected routes, auth loading/errors, and editable display names.
- Brain CRUD and document listing, real file upload, metadata persistence, rename, move, private download, and ordered deletion with recoverable failures.
- Existing design, theme system, library controls, and navigation preserved. Mock Brain/document persistence and simulated processing removed; new real accounts start empty.
- AI, parsing, OCR, embeddings, graph logic, quiz/flashcard generation, and mastery calculations are not implemented.

## Database and storage

Migrations define 13 tables: profiles, brains, documents, document_chunks, concepts, concept_connections, notes, flashcards, flashcard_reviews, quizzes, quiz_questions, quiz_attempts, mastery_records. Only the first three are actively used.

All 13 tables have RLS enabled, with 52 owner policies. Composite parent references enforce ownership. Database triggers handle timestamps, immutable identity fields, and automatic profiles.

The private study-documents bucket allows supported formats up to 25 MB. Three storage policies restrict access to owned metadata/path combinations. Files use stable random paths; document moves do not relocate storage. Metadata deletion is blocked until file cleanup succeeds. Nonempty brains cannot be deleted.

## Verification performed

- Lint: passed, zero warnings.
- TypeScript: passed.
- Production build: passed.
- Unit/database tests: 38 passed, including all-table cross-user access, spoofing, storage RLS, lifecycle failures/retries, file/request validation, and safe redirects.
- Browser tests: 16 passed at 1440px, 1280px, 820px, and 390px. Auth navigation, both themes, overflow, console errors, invalid confirmation, protected redirects, and unauthorized/cross-origin file requests verified.
- Desktop login and mobile dark signup screenshots visually reviewed.
- Formatting and Git whitespace checks: passed.
- Database type generation: passed, all 13 tables plus enums and public foreign keys.

Local SQL tests use PGlite and minimal Supabase platform fixtures. They do not replace a hosted Auth/Storage integration test. Authenticated workspace browser flows and real email delivery remain unverified until setup.

## Your setup steps

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for exact instructions:

1. The Supabase project has been created and both migrations applied.
2. Email authentication is enabled with confirmation required.
3. Site URL is `http://127.0.0.1:3000`; `/auth/confirm` is an allowed redirect.
4. `.env.local` contains the URL and publishable key and the local production server recognizes the project.
5. Complete the guide's two-account live checklist before calling hosted integration fully verified.

No service-role key is needed. Hosted signup, refresh/logout, Brain/file persistence, storage deletion, and two-user isolation still need live acceptance testing with user accounts. Upload hosting must accept 26 MB multipart requests. File preview remains a placeholder; original download works through the implemented private route. Workspace reads are currently unpaginated, and interrupted uploads require user cleanup rather than a background worker.

## Files created

- `.env.example`
- `docs/SUPABASE_SETUP.md`
- `scripts/generate-database-types.mjs`
- `scripts/schema-database.mjs`
- `src/actions/auth.ts`
- `src/actions/workspace.ts`
- `src/app/(auth)/loading.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(workspace)/[section]/page.tsx`
- `src/app/(workspace)/layout.tsx`
- `src/app/(workspace)/page.tsx`
- `src/app/api/documents/[id]/download/route.ts`
- `src/app/api/documents/upload/route.ts`
- `src/app/auth.css`
- `src/app/auth/confirm/route.ts`
- `src/components/auth/auth-form.tsx`
- `src/components/auth/workspace-load-error.tsx`
- `src/components/settings/profile-settings.tsx`
- `src/data/workspace-options.ts`
- `src/lib/auth-paths.ts`
- `src/lib/repositories/mutations.ts`
- `src/lib/repositories/session.ts`
- `src/lib/repositories/workspace.ts`
- `src/lib/result.ts`
- `src/lib/services/documents.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/config.ts`
- `src/lib/supabase/proxy.ts`
- `src/lib/supabase/server.ts`
- `src/lib/validation/files.ts`
- `src/lib/validation/input.ts`
- `src/lib/validation/origin.ts`
- `src/proxy.ts`
- `src/state/workspace-actions.ts`
- `src/types/database.ts`
- `supabase/migrations/202609140001_core_schema.sql`
- `supabase/migrations/202609140002_private_storage.sql`
- `tests/fixtures/supabase-platform.sql`
- `tests/unit/document-lifecycle.test.ts`
- `tests/unit/security.test.mjs`
- `tests/unit/validation.test.ts`
- `vitest.config.mts`
- `docs/PHASE_3_REPORT.md`

## Files modified

- `README.md`
- `package-lock.json`
- `package.json`
- `playwright.config.ts`
- `src/app/layout.tsx`
- `src/components/app-shell.tsx`
- `src/components/brains/brain-detail.tsx`
- `src/components/brains/brain-form.tsx`
- `src/components/brains/brains-page.tsx`
- `src/components/dashboard/dashboard.tsx`
- `src/components/documents/document-actions.tsx`
- `src/components/documents/document-collection.tsx`
- `src/components/documents/document-viewer.tsx`
- `src/components/documents/documents-page.tsx`
- `src/components/documents/processing-queue.tsx`
- `src/components/documents/status-badge.tsx`
- `src/components/documents/upload-dialog.tsx`
- `src/components/providers.tsx`
- `src/components/section-page.tsx`
- `src/components/shared/confirm-dialog.tsx`
- `src/state/workspace-provider.tsx`
- `src/types/workspace.ts`
- `tests/shell.spec.ts`
- `tests/workspace.spec.ts`

## Files removed or relocated

- `src/app/[section]/page.tsx`
- `src/app/page.tsx`
- `src/data/workspace-seed.ts`
- `src/state/workspace-reducer.ts`
- `tests/workspace-reducer.spec.ts`

The dashboard and section pages were relocated into the protected `(workspace)` route group; their URLs are unchanged. The removed reducer, seed records, and reducer tests belonged to the replaced mock persistence.
