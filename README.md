# CryptoContext

Your portfolio context, everywhere. A personal crypto context layer that connects your exchange positions to any AI agent via MCP protocol.

**Live**: https://app-rho-jet-70.vercel.app

## What it does

1. **Connect** your exchanges (Binance, OKX, Bybit, Coinbase) with read-only API keys
2. **Context is auto-generated** — portfolio, allocation, concentration structured into clean markdown
3. **AI agents query via MCP** — add one line to Claude Code or Cursor, and your AI already knows what you hold

## MCP Setup

```bash
claude mcp add --transport http crypto-ctx \
  https://app-rho-jet-70.vercel.app/api/mcp \
  --header "Authorization: Bearer YOUR_TOKEN"
```

Works with Claude Code, Cursor, and any MCP-compatible agent.

## Tech Stack

| Component | Solution | Cost |
|-----------|----------|------|
| Frontend + API | Next.js 16 (App Router) | Free (Vercel) |
| Database + Auth | Supabase (PostgreSQL + RLS) | Free |
| Exchange Data | CCXT (open source) | Free |
| MCP Protocol | HTTP Transport, JSON-RPC 2.0 | - |
| API Key Encryption | AES-256-GCM | - |

**Total: $0/month**

## Security

- Read-only API keys only — cannot trade or withdraw
- Keys encrypted with AES-256-GCM before storage
- MCP tokens hashed with SHA-256 (never stored in plaintext)
- Row Level Security on all database tables
- All data transmitted over TLS

## Local Development

```bash
cp .env.example .env.local
# Fill in your Supabase credentials and encryption key
npm install
npm run dev
```

## MCP API

### Discovery (GET /api/mcp)

Returns server info and available tools.

### Tools (POST /api/mcp)

| Tool | Description |
|------|-------------|
| `get_portfolio` | Current holdings with USD values and allocation % |
| `get_context` | Relevant context for a query (portfolio + analysis) |

Auth: `Authorization: Bearer <mcp_token>`

## License

MIT
