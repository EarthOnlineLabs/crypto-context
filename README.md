# CryptoContext

Your portfolio context, everywhere. A personal crypto context layer that connects your exchange positions to any AI agent via MCP protocol.

**Live**: https://app-rho-jet-70.vercel.app

## What it does

1. **Connect** your exchanges with read-only API keys (10 major CEXs supported)
2. **Context is auto-generated** — portfolio, allocation, concentration structured into clean markdown
3. **AI agents query via MCP** — add one line to Claude Code or Cursor, and your AI already knows what you hold

## Supported Exchanges (10)

Binance, OKX, Bybit, Coinbase, Kraken, Bitget, KuCoin, Gate.io, HTX, MEXC

OKX / Bitget / KuCoin require a passphrase.

## MCP Setup

```bash
claude mcp add --transport http crypto-ctx \
  https://app-rho-jet-70.vercel.app/api/mcp \
  --header "Authorization: Bearer YOUR_TOKEN"
```

Or in MCP config:

```json
{
  "mcpServers": {
    "crypto-context": {
      "url": "https://app-rho-jet-70.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

Works with Claude Code, Cursor, and any MCP-compatible agent.

## Tech Stack

| Component | Solution | Cost |
|-----------|----------|------|
| Frontend + API | Next.js 16 (App Router, Tailwind v4) | Free (Vercel) |
| Database + Auth | Supabase (PostgreSQL + RLS) | Free |
| Exchange Data | CCXT v4.5 (open source) | Free |
| MCP Protocol | HTTP Transport, JSON-RPC 2.0 | - |
| API Key Encryption | AES-256-GCM, KEK in env var | - |

**Total: $0/month**

## Security

| Layer | Measures |
|-------|----------|
| Transport | HTTPS only (Vercel enforced) |
| Storage | AES-256-GCM encrypted API key/secret/passphrase, KEK in env var |
| Auth | Supabase Auth (JWT), MCP uses SHA-256 hashed Bearer token |
| Authorization | PostgreSQL RLS — users can only access their own data |
| Protection | IP rate limiting, 7 security headers, input validation, error sanitization |
| Permissions | Read-only API keys only — cannot trade or withdraw |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login
│   ├── signup/page.tsx       # Signup
│   ├── dashboard/page.tsx    # Dashboard (connections, portfolio, MCP tokens)
│   ├── auth/confirm/         # Email confirmation callback
│   └── api/
│       ├── auth/             # login, logout, signup
│       ├── exchange/
│       │   ├── connect/      # POST connect exchange
│       │   ├── disconnect/   # POST disconnect exchange
│       │   └── portfolio/    # GET fetch portfolio
│       └── mcp/
│           ├── route.ts      # MCP JSON-RPC endpoint
│           └── tokens/       # MCP token management
├── lib/
│   ├── exchange.ts           # CCXT wrapper (10 exchanges)
│   ├── store.ts              # Supabase data layer
│   ├── crypto.ts             # AES-256-GCM encryption
│   ├── security.ts           # Rate limiting, validation, error sanitization, security headers
│   ├── context.ts            # Portfolio markdown generation
│   └── supabase/             # Supabase clients (server.ts, client.ts)
└── middleware.ts             # Auth + security headers middleware
```

## Local Development

```bash
cp .env.example .env.local
# Fill in Supabase URL/Key, ENCRYPTION_KEY (64 hex chars), SERVICE_ROLE_KEY
npm install
npm run dev
```

## Environment Variables

| Variable | Purpose | Format |
|----------|---------|--------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | `https://xxx.supabase.co` |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | JWT string |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role (for MCP endpoint) | JWT string |
| ENCRYPTION_KEY | AES-256-GCM key | **Exactly 64 hex chars** (no newline or whitespace) |

## MCP API

### Discovery (GET /api/mcp)

Returns server info and available tools.

### Tools (POST /api/mcp)

| Tool | Description |
|------|-------------|
| `get_portfolio` | Current holdings with USD values and allocation %. Optional: filter by asset. |
| `get_context` | Relevant context for a query (portfolio + analysis) |

Auth: `Authorization: Bearer <mcp_token>`

## License

MIT
