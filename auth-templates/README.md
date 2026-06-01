# Auth email templates + branded sending

Canonical copies of the Supabase Auth email templates, plus the runbook to send
them from our own domain via Resend (removes Supabase's ~2–3/hour built-in cap;
Resend free tier = 100/day, 3000/mo).

## Files
- `confirm-signup.html` — the "Confirm signup" template (link flow → `/auth/confirm`).

These files are the source of truth; they're pushed to Supabase via the
Management API. Nothing reads them at runtime.

## Copy-flow invariant (keep in sync)
All three surfaces must agree on the **link flow** (no "enter a code"):
- `src/app/signup/page.tsx` → "We sent a confirmation link… click the link"
- `auth-templates/confirm-signup.html` → links to `/auth/confirm?token_hash=…&type=signup`
- `src/app/auth/confirm/route.ts` → reads `token_hash` + `type`, calls `verifyOtp`

## Push a template to Supabase (Management API)
Requires `SUPABASE_ACCESS_TOKEN` (PAT) in `.env.local` — local only, never commit.

```bash
TOKEN=$(grep '^SUPABASE_ACCESS_TOKEN=' .env.local | cut -d= -f2)
python3 -c "import json; print(json.dumps({
  'mailer_subjects_confirmation': 'Confirm your email',
  'mailer_templates_confirmation_content': open('auth-templates/confirm-signup.html').read(),
}))" | curl -s -X PATCH \
  "https://api.supabase.com/v1/projects/ckviuhczbifmroggxfto/config/auth" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data @-
```

## Branded sending via Resend — runbook
**Blocked on input:** a sending domain (e.g. `mail.<domain>`). `RESEND_API_KEY`
is already provisioned (env only).

1. **Add domain in Resend** (API): `POST https://api.resend.com/domains` `{ "name": "<domain>" }`
   → returns SPF / DKIM / DMARC DNS records.
2. **Add DNS records** at the registrar (founder action), then
   **verify**: `POST https://api.resend.com/domains/{id}/verify` → poll until `verified`.
3. **Point Supabase Auth at Resend SMTP** (Management API `PATCH …/config/auth`):
   - `smtp_host: smtp.resend.com`, `smtp_port: 465`, `smtp_user: resend`,
     `smtp_pass: <RESEND_API_KEY>`, `smtp_sender_name: CryptoContext`,
     `smtp_admin_email: noreply@<domain>`, `external_email_enabled: true`.
4. **Custom domain for links (recommended):** set `site_url` to the production
   domain so confirmation links aren't on `*.vercel.app`. Add the domain to the
   Vercel project + `uri_allow_list`.
5. **Verify end-to-end:** sign up a test address → branded email from our domain,
   link matches page copy, account activates.

## Other templates (follow the same pattern when ready)
Magic link, recovery (reset password), email change — same link-flow structure
and branding; not yet templated.
