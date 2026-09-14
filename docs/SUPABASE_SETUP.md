# Connect NeuroNote to Supabase

No Supabase project was available during implementation. These steps activate the code already in this repository. SQL migrations, configuration, and email settings are intentionally kept separate: authentication URLs and email delivery are project settings, not application database schema.

## 1. Create the project

1. Open [Supabase](https://supabase.com/dashboard) and create a new project named **NeuroNote** in your organization. Choose a nearby region and save the database password privately.
2. Wait for provisioning. In the project's **Connect** dialog, copy the **Project URL** and **Publishable key**. The key starts with `sb_publishable_`.
3. Copy `.env.example` to `.env.local` in the NeuroNote repository. Fill in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

Use your actual URL/key in the local file only. Never put a secret key, service-role key, database password, or access token into a `NEXT_PUBLIC_` variable. The app does not need privileged credentials. `.env.local` is ignored by Git; `.env.example` contains placeholders only.

The clients follow [Supabase's cookie-based Next.js guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).

## 2. Apply the migrations once, in order

For a new project, open **SQL Editor → New query**, paste the complete contents of each file, and run them separately in this order:

1. `supabase/migrations/202609140001_core_schema.sql`
2. `supabase/migrations/202609140002_private_storage.sql`

Each migration uses its own transaction. Do not run `tests/fixtures/supabase-platform.sql` in Supabase: it is only a local test fixture. Do not rerun the core migration after it has succeeded. Keep a record that these two migrations were applied. If adopting Supabase CLI migration tracking later, mark these existing versions applied before pushing new migrations; do not replay them.

Verify in the dashboard:

- Table Editor shows all 13 application tables, with RLS enabled.
- Storage shows **study-documents**, marked **Private**, with a 25 MB limit.
- Database policies include four owner policies per application table and the three `study_files_*` policies on `storage.objects`.

Do not add broad storage policies or make the bucket public. On an existing project, audit preexisting policies first: PostgreSQL permissive policies can combine to grant broader access. A dedicated new project is the cleanest setup.

## 3. Configure email authentication

1. Under Authentication, enable the email/password provider and keep email confirmation enabled.
2. In **Authentication → URL Configuration**, set **Site URL** to `http://127.0.0.1:3000`.
3. Add `http://127.0.0.1:3000/auth/confirm` to allowed redirect URLs.
4. Under **Authentication → Email Templates → Confirm signup**, use this confirmation link in the email:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
  >Confirm your email</a
>
```

The handler also supports the PKCE `code` exchange, but the token-hash template above works when the email is opened in a different browser. Templates and redirects are described in the official [email template](https://supabase.com/docs/guides/auth/auth-email-templates) and [redirect URL](https://supabase.com/docs/guides/auth/redirect-urls) guides.

Use the same hostname throughout. `localhost` and `127.0.0.1` have different cookies. If you prefer localhost, change the local site variable and both Supabase URL settings consistently. Before deploying, replace the Site URL with your HTTPS domain, add its exact `/auth/confirm` redirect, set the hosting environment variables, and rebuild. Keep development redirects only while needed.

If confirmation email does not arrive, check Supabase's Auth logs and email delivery configuration. Set up a verified SMTP sender for real student signups using [Supabase's SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp); do not treat the built-in test email service as production delivery.

## 4. Start NeuroNote

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. The “Workspace connection needed” notice should disappear. Sign up, confirm your email, and sign in. Your new workspace should be empty, and Settings should show your name and email. Existing Phase 2 sample records are not migrated into real accounts.

If running the production server, use `npm run build` and then `npm start`. Restart/rebuild after changing public environment variables. If a local server already owns port 3000, stop that server before starting another.

## 5. Live acceptance checklist — required after setup

Use two real confirmed accounts, **A** in a normal browser and **B** in a separate browser profile/incognito window. Use disposable test material. Do not test isolation from the dashboard SQL editor: its privileged role bypasses RLS.

### Accounts

- Sign up A; verify the confirmation link, profile creation, and login.
- Refresh while signed in; the session persists.
- Visit `/login` and `/signup` while signed in; both return to the workspace.
- Try a wrong password and an expired confirmation link; feedback is readable.
- Try signing up with A's email again; receive generic confirmation/sign-in guidance without an account-existence leak.
- Change the display name in Settings, refresh, and verify the sidebar name.
- Sign out; visiting `/my-brain` redirects to login and private file endpoints reject access.

### Brains and files

- Create Biology and Chemistry; rename Biology; refresh and verify persistence.
- Upload a genuine PDF and a text file. Add pasted notes. Verify metadata and an `Uploaded` status.
- Download each original and compare its content with the source.
- Rename a document, move it to Chemistry, refresh, and download again. The file should still work.
- Try empty, unsupported, oversized, or extension/MIME-mismatched files. They must fail without showing success.
- Attempt to delete a brain with documents. It must explain that documents need to be moved/deleted first.
- Delete a document, then verify both its metadata row and object are absent in the dashboard. Delete an empty brain.
- Interrupt an upload connection. Reconnect/refresh, wait two minutes if it remains uploading, and delete the incomplete item before re-uploading. A failed deletion must remain visible and retryable.

### Two-account isolation

- While signed in as A, copy a Brain UUID, document UUID, and the document's private storage path from the dashboard.
- In B's browser, open `/my-brain?brain=A_BRAIN_UUID` and `/documents?document=A_DOCUMENT_UUID`. Both must show missing-resource states, never A's content.
- In B's browser, request `/api/documents/A_DOCUMENT_UUID/download`; it must return an error, never a signed URL.
- For direct Data API testing, use B's authenticated Supabase client (publishable key plus B's session). Selecting A's rows must return no records; updating/deleting A's IDs must affect zero rows; inserting with A's `user_id` must fail. Linking B's document to A's brain must fail.
- Using B's authenticated Storage client, attempt `.download(A_STORAGE_PATH)`, `.createSignedUrl(A_STORAGE_PATH, 60)`, `.upload(A_STORAGE_PATH, file)`, and `.remove([A_STORAGE_PATH])`. Download/signing/upload must fail; removal must not remove A's object (Storage may return an empty successful result for inaccessible objects). Verify A can still download it.
- A valid signed URL already issued to A is a short-lived bearer link and is intentionally shareable for 60 seconds. Test authorization by requesting a **new** URL as B, not by reusing A's link.

### Responsive workspace

With A signed in, check 1440px desktop, 1280px laptop, 820px tablet, and 390px mobile. Check navigation/drawer, command search, create/edit dialogs, long filenames, upload queue, error messages, source download, and both themes. Auth pages were tested automatically at these widths; hosted workspace flows await this setup.

## Troubleshooting

- **Connection notice:** URL/publishable key missing or placeholders unchanged; restart after editing `.env.local`.
- **Workspace cannot load:** check that both migrations succeeded and the user's profile exists. The migration backfills profiles for preexisting users.
- **Email goes to the wrong host:** align Site URL, allowed redirects, local environment, and email template.
- **Upload rejected as cross-origin:** preserve the browser's original `Host` through your trusted reverse proxy. The API compares Origin and Host.
- **Large uploads fail before the app responds:** your hosting proxy may have a smaller body limit. This Node endpoint needs 26 MB multipart requests; choose compatible hosting or design direct-to-storage uploads in a later phase.
- **File cleanup fails:** retry deletion from the UI. Never delete rows from `storage.objects` with SQL; use the Storage API/dashboard, which also removes the underlying file.
