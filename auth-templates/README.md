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

## Branded sending via Resend — DONE (2026-06-01)
Live: Supabase Auth sends via Resend SMTP from **CryptoContext
<noreply@mail.earthonline.site>**, no rate cap (Resend free: 100/day, 3000/mo).
Verified end-to-end (Resend log: `delivered`).

Config of record:
- **Sending domain:** `mail.earthonline.site` — verified in Resend
  (domain id `abb2d4d5-f348-45a8-bb3d-398fb8165fb4`). DNS on Aliyun/HiChina:
  `resend._domainkey.mail` TXT (DKIM), `send.mail` MX→`feedback-smtp.us-east-1.amazonses.com`
  (pri 10), `send.mail` TXT (`v=spf1 include:amazonses.com ~all`).
- **Supabase SMTP** (`PATCH …/config/auth`): `smtp_host=smtp.resend.com`,
  **`smtp_port="465"` (string — the API rejects a number)**, `smtp_user=resend`,
  `smtp_pass=<RESEND_API_KEY>` (send-only key), `smtp_sender_name=CryptoContext`,
  `smtp_admin_email=noreply@mail.earthonline.site`, `external_email_enabled=true`.
- Keys (env only, never committed): `RESEND_API_KEY` (send-only → SMTP pass),
  `RESEND_ADMIN_API_KEY` (full-access → domain/log management).

Replay (rebuild from scratch): create domain via API → add the 3 DNS records →
`POST /domains/{id}/verify` → poll `GET /domains/{id}` until `verified` → PATCH
Supabase SMTP → trigger `POST /auth/v1/recover` and confirm in Resend's email log.

Not done (optional follow-up): links still point at `*.vercel.app` (`site_url`
unchanged — sender is branded, link host is not). Recovery / magic-link /
email-change templates are still the plain defaults; only **confirm-signup** is
branded. Same pattern applies when you want the rest.
