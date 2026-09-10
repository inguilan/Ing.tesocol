---
name: supabase-sync-debugging
description: "Diagnose and repair Next.js/Supabase persistence and schema-sync failures. Use when browser logs show PGRST205, PGRST204, missing tables or columns, records created in the UI but absent from Supabase, failed upserts, stale PostgREST schema cache, or migrations that may not be applied to the configured project."
argument-hint: "Describe the Supabase error, affected workflow, and configured environment."
user-invocable: true
disable-model-invocation: false
---

# Supabase Sync Debugging

## Outcome

Restore a verified write path between the application and the intended Supabase project, or produce a precise blocker. Keep the fix at the schema/configuration or persistence boundary; do not hide a failed write by changing only the UI.

## When to Use

- A record appears in a Next.js UI but not in Supabase.
- The browser reports `PGRST205` (table not found) or `PGRST204` (column not found).
- An upsert or insert fails while reads or page navigation still return `200`.
- Local migration files contain a table or column that the Supabase API cannot see.
- The PostgREST schema cache may be stale.

## Procedure

1. **Capture the first failing operation.** Record the route, browser error code, table, column, HTTP status, and the exact client operation. Separate the page response (`GET /... 200`) from the database operation; a successful page response does not prove persistence.

2. **Find the owning write path.** Trace the form action to the state mutation and then to the Supabase call. Confirm whether the app writes directly to the operational table, to an aggregate JSON row such as `app_state`, or to both. Identify whether the write is fire-and-forget and whether the caller surfaces errors.

3. **Build the expected schema contract.** Extract every table and column used by the write payload and read query. Compare it with the relevant migrations, including policies, unique indexes used by `onConflict`, required columns, and data types. Check migration order and duplicate or overlapping migrations before editing application code.

4. **Verify the target environment.** Compare `NEXT_PUBLIC_SUPABASE_URL` and the Supabase project selected in the dashboard or CLI. Never print or request anon/service-role secrets. Treat a missing table or column as an environment mismatch until the remote project and migration history are confirmed.

5. **Classify the failure.**
   - `PGRST205`: verify the table exists in the intended remote database, the migration ran, the schema is `public`, and the API can see it.
   - `PGRST204`: verify the column exists with the exact spelling in the intended table, the migration ran, and the API schema cache was refreshed.
   - Permission or RLS errors (`401`, `403`, or policy messages): inspect the authenticated session and policies. Do not weaken RLS broadly as a first fix.
   - No error but no row: inspect whether the operation was awaited, whether the payload is empty, whether `upsert` has the required conflict constraint, and whether another effect overwrites the row afterward.

6. **Apply the smallest infrastructure fix.** Prefer the repository's documented Supabase migration workflow. Apply pending migrations to the verified project, or run the specific idempotent migration when the project is intentionally managed manually. Refresh PostgREST after DDL when needed (`notify pgrst, 'reload schema';`). Do not edit generated or unrelated migrations to make the error disappear.

7. **Check the application contract.** If the remote schema is correct, fix the narrowest client issue: await the write, log the returned error, preserve the existing public API, and ensure state hydration does not overwrite a newly created record with stale data. Keep localStorage fallback behavior intact when Supabase is not configured.

8. **Validate in layers.**
   - Run the narrowest available typecheck, lint, or test for the changed code.
   - Log in with an authenticated user and create one representative project.
   - Confirm the browser network/request result has no Supabase error.
   - Query the intended Supabase table and confirm the row and mapped fields, especially the legacy ID and conflict key.
   - Reload the page or open a second session and confirm hydration reads the persisted record.
   - Recheck the browser console for `PGRST205`, `PGRST204`, and failed sync messages.

## Decision Rules

- If both a table and one of its columns are missing, investigate unapplied migrations or the wrong project before changing TypeScript.
- If the dashboard table editor is empty while the app uses seeded in-memory data, distinguish local initial state from remote persisted state; do not call the seed data proof of a successful write.
- If the migration exists locally but the remote schema is old, the primary fix is migration deployment, not renaming the client payload.
- If only one mapped field fails, compare the exact payload key with the remote column and its type, then fix the schema or mapping according to the intended contract.
- If the write succeeds but the UI is stale, inspect hydration timing and state replacement after the write rather than duplicating database calls.
- Stop and report a blocker when the target project cannot be identified, credentials are unavailable, or applying migrations requires an approval the agent cannot provide.

## Completion Criteria

The task is complete only when all are true:

- The configured Supabase project is explicitly identified.
- Every table and column used by the affected write exists remotely with the expected type and conflict constraint.
- Authenticated reads and writes satisfy the relevant RLS policies.
- A real end-to-end create or update is visible in Supabase after a fresh reload.
- The application no longer emits the original schema or sync error.
- Any remaining issue is documented with the exact failing operation and next owner.

## Safety

- Do not expose service-role keys, passwords, access tokens, or full environment files.
- Do not disable RLS globally or replace a failed write with local-only state.
- Preserve unrelated user changes and avoid destructive database commands unless explicitly authorized.
