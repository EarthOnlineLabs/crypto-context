# X / Twitter

This is your owned channel and it carries your real identity — so the voice is **you, building in public**, not a brand account. First person, plain, a little opinionated. The substance is the proof transcript; the format is just delivery.

Two options below. Pick based on energy, not obligation. The best launches sometimes are *one paragraph* — if the single post feels right, ship that and don't force a thread.

---

## Option A — the single post (lowest friction, often strongest)

Pair this with **one image**: a screenshot of transcript #1 (the "what's wrong with my portfolio?" answer), or the contrast table from [transcripts.md](transcripts.md).

```
Your AI gives generic crypto advice because it can't see your bags.

Your money's split across exchanges and wallets — no model sees the whole
picture, so you get textbook answers aimed at nobody.

So I built CryptoContext: connect your exchanges (read-only) + wallets,
and any AI agent can query your real portfolio over MCP. Holdings,
concentration, how you actually trade — unified.

Ask "what's wrong with my portfolio?" and it finally answers about YOURS.

Open source. Read-only. Runs for $0. Not your context, not your AI. 👇
[link]
```

That's it. If you only do one thing, do this.

---

## Option B — the thread (for when you want to make the full case)

**1/**
```
Your AI gives generic crypto advice because it can't see your bags.

Ask any model "what should I do with my portfolio?" and it has to either
make you type everything out, or guess. So you get advice written for a
person who doesn't exist.

I got tired of it and built the missing piece. 🧵
```

**2/** *(attach screenshot of transcript #1)*
```
Here's the difference.

Same question — "be honest, what's wrong with my portfolio?"

ChatGPT today: "happy to help! share your holdings, allocation, goals…"

My agent, with context connected: ↓

It knows my 70/30 split, my last 14 trades, my fee drag, my DCA. Specific.
```

**3/**
```
It's called CryptoContext. An MCP server that unifies your whole crypto
footprint — every exchange, every wallet — plus HOW you trade (DCA cadence,
buy/sell ratio, fund flows) into one context any AI agent can query.

Holdings are table stakes. The behavior is what makes advice about *you*.
```

**4/**
```
Why it has to see everything:

A context layer that sees one exchange is worse than useless — it gives
your agent false confidence about a partial picture.

The whole value is unification. Binance + Bybit + Coinbase + your wallets,
one complete view. Your AI finally sees all of it at once.
```

**5/**
```
The part I'm most opinionated about: the context is computed, not inferred.

Plain deterministic rules over your data. No LLM in the loop to build it.

→ reproducible
→ private (no model ingests your positions to make the context)
→ $0 to generate

The agent you point at it does the thinking.
```

**6/**
```
The obvious objection to anything touching exchange keys: "why would I
trust you?"

Right answer: don't.

It's open source — read every line.
Read-only keys — the code has no createOrder/withdraw, one grep proves it.
Or self-host and hold your own encryption key. No one, including me, sees it.
```

**7/**
```
Crypto already has the phrase for this: not your keys, not your coins.

Context is the same now. In an agent world, whoever owns your context owns
the relationship — and you get locked in by gravity, not contract.

So it's yours. MCP-native, point it at any agent. Not your context, not your AI.
```

**8/** *(the CTA)*
```
Open source, runs for $0, one line to connect Claude / Cursor / any MCP agent:

claude mcp add --transport http crypto-ctx https://cryptocontext.aiself.site/api/mcp \
  --header "Authorization: Bearer YOUR_TOKEN"

Repo + live demo: [link]

Built it solo. Tear it apart — I want the feedback. 🙏
```

---

## Voice notes

- Keep your real voice. If a line sounds like a brand, cut it.
- **The screenshot in tweet 2 is doing the heavy lifting** — make it clean. Use a real session shot if you can grab one; else the landing-page transcript card.
- Don't thread more than ~8. Engagement decays; the case is made by 7.
- Reply to your own thread over the next days with the *other* transcripts (#2 cold-wallet, #3 counterparty risk, #4 trading review) as standalone follow-ups. Each is a fresh hook pointing at the same repo.
- Quote-tweet / tag thoughtfully: MCP and AI-dev accounts are the wedge (the people who get "context layer" instantly), more than generic crypto CT. Don't mass-tag — it reads as spam.
- Pin the post (single or thread head) after launch.
