# Security

CryptoContext connects to your exchange accounts and wallets. That only works if you trust it, so this document explains exactly what the code does with your keys and data. None of this is marketing — every claim below maps to source you can read in this repo.

If you find a vulnerability, see [Reporting a vulnerability](#reporting-a-vulnerability) at the bottom. Please do not open a public issue for security problems.

## The short version

- **Read-only by design.** The app only ever calls read endpoints (balances, tickers, trade history). It never has code to place an order, transfer, or withdraw.
- **Your keys are encrypted at rest** with AES-256-GCM. The encryption key lives in an environment variable, never in the database.
- **Nothing is shared.** There is no analytics pipeline that ships your holdings anywhere. Your context is generated and stored for your account only, behind row-level security.
- **You can self-host.** If you'd rather not trust a hosted instance, run your own. You hold the encryption key and the database. This is the whole reason it's open source.
- **You can delete everything.** Disconnect a venue or delete your data at any time.

## What CryptoContext can and cannot do

### It cannot trade or withdraw

The exchange integration is a thin wrapper around [CCXT](https://github.com/ccxt/ccxt). The only exchange methods it ever calls are reads:

- `fetchBalance()` / `fetchTicker()` — your holdings and their USD value ([`src/lib/exchange.ts`](src/lib/exchange.ts))
- `fetchMyTrades()` / `fetchDeposits()` / `fetchWithdrawals()` — read-only history, to derive your trading patterns and fund flows ([`src/lib/exchange-history.ts`](src/lib/exchange-history.ts))

There is no code path that calls `createOrder`, `withdraw`, `transfer`, or any state-changing endpoint. You can confirm this yourself — the following grep returns nothing:

```bash
grep -rn "createOrder(\|\.withdraw(\|\.transfer(\|cancelOrder(" src/
```

### Defense in depth: use read-only API keys

Software promises are not enough on their own, so the real guard is **on the exchange side**: create API keys with **read-only / "view" permission only**, and do not enable trading, futures, or withdrawals on the key. Most exchanges let you scope this when you create the key, and many let you IP-allowlist it too.

If you give CryptoContext a key that can only read, then even a total compromise of the app cannot move your funds. We ask for read-only keys, the code only reads, and the exchange enforces it regardless of what any software does. That's three independent layers.

Wallet addresses are public data — pasting an address exposes nothing a block explorer doesn't already show.

## How your keys are stored

API keys, secrets, and passphrases are encrypted with **AES-256-GCM** before they touch the database ([`src/lib/crypto.ts`](src/lib/crypto.ts)):

- A fresh random 16-byte IV is generated for every encryption — no IV reuse.
- GCM produces an authentication tag, so tampered ciphertext fails to decrypt rather than silently returning garbage.
- The 256-bit key-encryption key (KEK) is read from the `ENCRYPTION_KEY` environment variable and is **never stored in the database**. An attacker with a dump of the database, but not the KEK, has only ciphertext.
- Plaintext keys exist only in memory for the duration of a request and are never written to logs.

## Access control

- **Authentication** is handled by Supabase Auth (JWT).
- **Authorization** uses PostgreSQL **row-level security** — every row is scoped to its owner, so one user's queries cannot reach another user's data even if application code has a bug.
- **MCP tokens** are random bearer tokens. Only a **SHA-256 hash** is stored; the raw token is shown to you once at creation and never persisted. A database dump does not reveal usable tokens.

## At the edges

- HTTPS only.
- IP-based rate limiting on sensitive endpoints.
- Input validation on exchange IDs, addresses, and tool arguments.
- Error sanitization: raw exchange/CCXT errors are logged server-side but never returned to the client (they can leak account hints). See [`src/lib/security.ts`](src/lib/security.ts).
- Dollar amounts are redacted from the generated context's permission-sensitive fields before they leave the server.

## Self-hosting: trust no one, including us

The strongest version of "is this safe?" is "I ran it myself." Clone the repo, supply your own Supabase project and your own `ENCRYPTION_KEY`, and deploy. Then:

- You hold the only copy of the KEK.
- Your keys live in your database.
- No third party — including this project's maintainer — has any access.

See [README.md](README.md) for setup.

## Threat model, honestly

What this design protects you from:

- A database leak (keys are ciphertext; tokens are hashes).
- A malicious or buggy app trying to move funds (read-only keys + read-only code).
- Cross-account data access (row-level security).

What it does **not** magically solve, and where you still carry responsibility:

- If you create an API key with **trade/withdraw permissions enabled**, no software can protect you — scope your keys read-only.
- If the host environment is fully compromised (attacker has both the database *and* the live `ENCRYPTION_KEY`), encryption at rest no longer helps. Self-hosting shrinks this surface to infrastructure you control.
- Wallet addresses are public; treat them as such.

## Reporting a vulnerability

If you believe you've found a security issue, please report it privately rather than opening a public issue:

- Open a [GitHub security advisory](https://github.com/0xrikt/crypto-context/security/advisories/new) on this repository, **or**
- Reach out via the contact listed on the GitHub profile [@0xrikt](https://github.com/0xrikt).

Please include steps to reproduce and the potential impact. I'll acknowledge as quickly as I reasonably can and keep you posted on a fix. Responsible disclosure is genuinely appreciated.
