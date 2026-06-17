# Not your context, not your AI

*The substance piece. This is the anchor every other channel links to — the thread, Show HN, the directory listings all point here for "the why." Publish it wherever you write (personal blog, Mirror, a GitHub Gist, or as a long X post). Keep the title; it's the whole thesis in four words.*

---

## The thing nobody owns yet

For two years the entire AI conversation has been about the model. Which one's smartest, which one's cheapest, who topped which benchmark. That race is real, but it's converging — the frontier models are getting good enough that, for most everyday questions, the bottleneck stops being the model's intelligence.

The bottleneck becomes what the model *knows about you.*

An incredibly smart assistant that knows nothing about your situation gives you a Wikipedia article. A mediocre one that knows your situation cold gives you advice you can act on. In a world where everyone has access to roughly the same frontier models, the differentiator isn't the brain. It's the context you can hand the brain.

And right now, almost nobody owns their own context. It's scattered across a hundred apps that each hold a sliver and have no incentive to let it leave.

## Crypto is where this hurts most

Pick the domain where your context is most fragmented and most valuable, and you've picked crypto.

Your financial life as a crypto user is spread across a Binance account, a Bybit account you opened for one trade, a Coinbase balance, an Ethereum wallet, an Arbitrum wallet, a cold wallet you touch twice a year. No single app sees all of it. *You* barely see all of it. So when you ask any AI "what should I do with my portfolio," it has two options: ask you to type everything out by hand (stale the moment you hit enter), or give you the generic answer it gives everyone.

That's why AI financial advice feels so hollow. It's not that the model is dumb. It's that the model is blind. It can't see your bags.

So you get told to "diversify" when you're already holding eleven things. You get told BTC "looks strong" with no idea that it's already 60% of your net worth. You get a textbook lecture aimed at a person who doesn't exist, because the one who *does* exist — you, with your specific concentration, your specific dry-powder problem, your specific habit of round-tripping memes — is invisible.

## The missing layer

The fix isn't a smarter model. It's a **context layer**: something that sits between your scattered financial reality and the agents you talk to, assembles the whole picture, and hands it over in a form an agent can actually reason with.

Three things make this layer worth building rather than bolting onto yet another app:

**It has to be comprehensive.** A context layer that sees one exchange is worse than useless — it gives the agent false confidence about a partial picture. The entire value is unification: every venue, every chain, *plus how you trade*, in one view. Holdings are table stakes; the behavior — your DCA cadence, your buy/sell ratio under stress, your fund flows — is the part that makes advice about *you* instead of about a generic investor.

**It has to be structured for machines, not humans.** A portfolio tracker is a dashboard you stare at and interpret yourself. That's the opposite of what an agent needs. An agent needs clean, queryable facts — concentration, allocation, risk flags, patterns — computed and handed over, not rendered as a chart for your eyeballs. Different artifact entirely.

**It should be computed, not hallucinated.** Every number in the context is generated deterministically — plain rules over your data. Holdings, concentration, trade stats: reproducible, nothing invented, free to generate. The one narrative piece — the investor profile — is written by an optional LLM that only ever reads those aggregated facts, never your keys or addresses, and the layer falls back to a rule-based profile without it. The intelligence happens in whatever agent you point at it. The context layer's job is to be correct, not clever.

## Why it has to be yours

Here's the part that matters most, and it's where crypto people already have the right instincts.

In an agent-driven world, whoever owns your context owns the relationship. If your financial context lives inside one company's assistant, you're locked in — not by a contract, but by gravity. Switching agents means starting over, re-explaining your entire life. So you don't switch. That's the moat every platform is racing to build: not a better model, but possession of *you.*

Crypto already has a phrase for this exact failure mode. *Not your keys, not your coins.* If you don't hold the keys, you don't really own the asset — you're trusting someone else's promise.

Context is about to be the same. **Not your context, not your AI.** If your context lives inside someone's walled garden, you don't own your AI relationship — you're renting it, and they hold the keys.

So the context layer should be open source, MCP-native, and yours. You hold it. You point it at any agent you choose — Claude today, Cursor tomorrow, whatever's best next year. Your context comes with you. No lock-in, by design. The one piece that's actually about *you* is the one piece you should never rent.

## What I built

CryptoContext is that layer for crypto. Connect your exchanges (read-only keys) and your wallets; it unifies them and generates structured context — holdings, concentration, trading patterns, fund flows — that any MCP-compatible agent can query. Ask your AI "be honest, what's wrong with my portfolio?" and for the first time it answers about *your* portfolio.

It's open source because you should be able to read exactly what touches your keys — not trust a promise. It's read-only because an assistant never needs to move your funds. It runs for $0 because the context is computed, not inferred. And it's MCP-native because the whole point is that it's yours to point anywhere.

The model race will keep going, and the models will keep getting better. But the question that decides whether your AI is actually useful isn't *how smart is it.* It's *can it see you.*

Give your AI agents eyes.

**→ [github.com/EarthOnlineLabs/crypto-context](https://github.com/EarthOnlineLabs/crypto-context)** · live demo and one-line MCP setup inside.

---

*I build in crypto and AI; this is the thing I wanted to exist and couldn't find, so I made it and open-sourced it. If the thesis resonates or you think I'm wrong, I'd genuinely like to hear it.*
