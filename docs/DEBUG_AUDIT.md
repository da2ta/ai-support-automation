# Debug Audit Log

## Project Health

- Frontend: PASS (TypeScript and production bundle build)
- Backend: PASS (16 automated tests)
- Database: MIGRATION REQUIRED (apply `004_allow_urgent_sentiment.sql`)
- Authentication: CONFIGURATION REQUIRED (Supabase URL, publishable key, and server-only service key)
- Gemini: PASS (fallback analyzer verified; a Gemini key is optional)
- Ticket Workflow: PASS (create, filter, update, re-analyze, and dashboard tests)
- Deployment: ACTION REQUIRED (upgrade Node.js to 20.19+ or 22.12+)

## Issues Found

1. **Fixed: valid Supabase sign-ins were rejected by the backend.** The server
   incorrectly used its service-role key as a JWT signing secret. It now asks
   Supabase Auth to validate the user's access token, which supports both
   legacy and current Supabase signing configurations.
2. **Fixed: ticket creation was public and privileged database credentials
   bypassed RLS.** All ticket endpoints now require a signed-in user and use a
   user-scoped Supabase client, so the existing role policies are enforced.
3. **Fixed: `Urgent` tickets failed database insertion.** The backend supports
   `Urgent`, but the database check constraint did not. Apply migration 004 to
   any existing project.
4. **Fixed: missing frontend Supabase values caused a startup crash / blank
   page.** The login page now renders an explicit configuration message.
5. **Fixed: health endpoint schema drift.** The backend now returns the fields
   consumed by the frontend status UI.
6. **Fixed: test suite was tied to a removed SQLAlchemy database layer.** It
   now exercises the current Supabase-backed API contract using an in-memory
   test double.

## Remaining Non-Blocking Warnings

- The frontend bundle is 878 kB minified and Vite reports a code-splitting
  warning. It does not prevent deployment.
- The checked-in Node.js runtime is 20.18.0; Vite 8 requests 20.19+.
- `npm run lint` remains blocked by a missing optional Oxc native binding in
  `node_modules`. Reinstall frontend dependencies after upgrading Node.js.
