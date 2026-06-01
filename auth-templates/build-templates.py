#!/usr/bin/env python3
"""
Generate + push all branded Supabase Auth email templates.

Single source of truth for the auth emails. Shares the exact emerald shell used
by the signup confirmation email so every auth email looks identical. Writes a
canonical .html copy of each next to this script, then PATCHes the Supabase Auth
config via the Management API.

Run:  python3 auth-templates/build-templates.py
Needs: SUPABASE_ACCESS_TOKEN in .env.local (local only, never committed).

Link flow invariant: every actionable email points at {{ .SiteURL }}/auth/confirm
?token_hash={{ .TokenHash }}&type=<type>[&next=<path>], which the /auth/confirm
route resolves via verifyOtp({ token_hash, type }) → redirect to `next`. Matches
src/app/auth/confirm/route.ts and the on-screen "click the link" copy.
"""
import json, os, sys, urllib.request

PROJECT_REF = "ckviuhczbifmroggxfto"
HERE = os.path.dirname(os.path.abspath(__file__))


def shell(heading: str, body_html: str, action_block: str, footer_note: str) -> str:
    """The shared branded card. action_block is the CTA (button+fallback) or code box."""
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;margin:0;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">\n'
        '  <tr><td align="center">\n'
        '    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">\n'
        '      <tr><td style="padding:28px 32px 0 32px;">\n'
        '        <table role="presentation" cellpadding="0" cellspacing="0"><tr>\n'
        '          <td style="vertical-align:middle;"><span style="display:inline-block;width:22px;height:22px;background-color:#059669;border-radius:6px;vertical-align:middle;"></span></td>\n'
        '          <td style="vertical-align:middle;padding-left:10px;"><span style="font-size:17px;font-weight:700;letter-spacing:-0.01em;color:#111827;vertical-align:middle;">CryptoContext</span></td>\n'
        '        </tr></table>\n'
        '      </td></tr>\n'
        '      <tr><td style="padding:24px 32px 0 32px;">\n'
        '        <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:#111827;">' + heading + '</h1>\n'
        '        <p style="margin:14px 0 0 0;font-size:15px;line-height:1.6;color:#4b5563;">' + body_html + '</p>\n'
        '      </td></tr>\n'
        + action_block +
        '      <tr><td style="padding:26px 32px 0 32px;"><div style="border-top:1px solid #f0f1f3;height:1px;line-height:1px;font-size:1px;">&nbsp;</div></td></tr>\n'
        '      <tr><td style="padding:18px 32px 30px 32px;">\n'
        '        <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">' + footer_note + '</p>\n'
        '        <p style="margin:14px 0 0 0;font-size:12px;font-weight:600;color:#6b7280;">Not your context, not your AI.</p>\n'
        '      </td></tr>\n'
        '    </table>\n'
        '  </td></tr>\n'
        '</table>\n'
    )


def cta(label: str, url: str) -> str:
    """Emerald button + paste-able fallback link."""
    return (
        '      <tr><td style="padding:26px 32px 0 32px;">\n'
        '        <table role="presentation" cellpadding="0" cellspacing="0"><tr>\n'
        '          <td style="background-color:#059669;border-radius:10px;">\n'
        '            <a href="' + url + '" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">' + label + '</a>\n'
        '          </td>\n'
        '        </tr></table>\n'
        '      </td></tr>\n'
        '      <tr><td style="padding:22px 32px 0 32px;">\n'
        '        <p style="margin:0;font-size:13px;line-height:1.5;color:#9ca3af;">Or paste this link into your browser:</p>\n'
        '        <p style="margin:6px 0 0 0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="' + url + '" style="color:#059669;text-decoration:underline;">' + url + '</a></p>\n'
        '      </td></tr>\n'
    )


def codebox(token_var: str) -> str:
    """Large monospace one-time code (for reauthentication)."""
    return (
        '      <tr><td style="padding:24px 32px 0 32px;">\n'
        '        <div style="background-color:#f4f5f7;border:1px solid #e5e7eb;border-radius:10px;padding:18px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:6px;color:#059669;">' + token_var + '</div>\n'
        '      </td></tr>\n'
    )


CONFIRM_BASE = "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}"

# name -> (subject, html). type/next baked into the link.
TEMPLATES = {
    "recovery": (
        "Reset your password",
        shell(
            "Reset your password",
            "We got a request to reset your CryptoContext password. Click below to choose a new one — this link expires in 1 hour.",
            cta("Reset password", CONFIRM_BASE + "&type=recovery&next=/reset-password"),
            "Didn't request this? You can safely ignore this email — your password won't change.",
        ),
    ),
    "magic_link": (
        "Your sign-in link",
        shell(
            "Sign in to CryptoContext",
            "Click below to sign in. This link expires shortly and can only be used once.",
            cta("Sign in", CONFIRM_BASE + "&type=magiclink&next=/dashboard"),
            "If you didn't try to sign in, you can safely ignore this email.",
        ),
    ),
    "email_change": (
        "Confirm your new email address",
        shell(
            "Confirm your new email",
            "Confirm <strong>{{ .NewEmail }}</strong> as the new email address for your CryptoContext account.",
            cta("Confirm new email", CONFIRM_BASE + "&type=email_change"),
            "If you didn't request this change, contact support and secure your account.",
        ),
    ),
    "invite": (
        "You're invited to CryptoContext",
        shell(
            "You're invited",
            "You've been invited to CryptoContext — one portfolio context your AI agents can actually read. Click below to set up your access.",
            cta("Accept invitation", CONFIRM_BASE + "&type=invite&next=/dashboard"),
            "Not expecting this? You can safely ignore this email.",
        ),
    ),
    "reauthentication": (
        "{{ .Token }} is your verification code",
        shell(
            "Your verification code",
            "Enter this code to confirm it's you. It expires shortly.",
            codebox("{{ .Token }}"),
            "If you didn't request this, you can safely ignore this email.",
        ),
    ),
}

# Map to Supabase config keys.
SUBJECT_KEY = {
    "recovery": "mailer_subjects_recovery",
    "magic_link": "mailer_subjects_magic_link",
    "email_change": "mailer_subjects_email_change",
    "invite": "mailer_subjects_invite",
    "reauthentication": "mailer_subjects_reauthentication",
}
CONTENT_KEY = {
    "recovery": "mailer_templates_recovery_content",
    "magic_link": "mailer_templates_magic_link_content",
    "email_change": "mailer_templates_email_change_content",
    "invite": "mailer_templates_invite_content",
    "reauthentication": "mailer_templates_reauthentication_content",
}


def read_token() -> str:
    env_path = os.path.join(HERE, "..", ".env.local")
    with open(env_path) as f:
        for line in f:
            if line.startswith("SUPABASE_ACCESS_TOKEN="):
                return line.split("=", 1)[1].strip()
    sys.exit("SUPABASE_ACCESS_TOKEN not found in .env.local")


def main():
    payload = {}
    for name, (subject, html) in TEMPLATES.items():
        with open(os.path.join(HERE, name.replace("_", "-") + ".html"), "w") as f:
            f.write(html)
        payload[SUBJECT_KEY[name]] = subject
        payload[CONTENT_KEY[name]] = html

    token = read_token()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth",
        data=json.dumps(payload).encode(),
        method="PATCH",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) cryptocontext-setup/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read())
        print("HTTP", resp.status, "— templates pushed:")
        for name in TEMPLATES:
            print(f"  {name:16} subject={d.get(SUBJECT_KEY[name])!r} content_set={bool(d.get(CONTENT_KEY[name]))}")
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:500])
        sys.exit(1)


if __name__ == "__main__":
    main()
