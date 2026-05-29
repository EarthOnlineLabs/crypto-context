# The proof: AI sessions that only work *with* your context

These are the core asset of the launch. Everything else (Show HN, the thread, the thesis post) points back to one idea: **with CryptoContext connected, your AI says things it physically could not say otherwise.** Not better-worded generic advice — answers that require knowing your actual holdings, concentration, trade history, and fund flows across every venue at once.

Each transcript below is **illustrative** (a realistic example portfolio, not a real user's data). Use them in posts, screenshots, and the README. Keep the "EXAMPLE" framing honest — never present a fabricated session as a real user's.

The shape that makes these land: **a blunt human question → the agent silently calls `get_context()` → an answer that is unmistakably about *this person*.** The contrast with what ChatGPT says to the same question (generic, hedged, textbook) is the whole pitch. A few of these pair each transcript with the "without context" version to make that contrast explicit.

---

## 1. "Be honest — what's wrong with my portfolio?"

*(The hero transcript. Cross-venue, conviction-vs-attention, dry powder, behavior.)*

> **You:** Be honest — what's wrong with my portfolio?
>
> **Claude** · *called `get_context()`*
>
> Three things stand out, and they're connected:
>
> **1. Your conviction and your attention are in different places.** BTC + ETH are 70% of your book — that's your thesis. But 11 of your last 14 trades were SOL, WIF and JUP. You're a long-term holder who keeps day-trading memes on the side, and the fees are adding up (~$430 in 90 days).
>
> **2. You have no dry powder.** Stablecoins are 3%. Your own history shows you buy the majors on 20%+ dips — but if one comes now, you have almost nothing to deploy without selling at a loss. That's the gap to fix.
>
> **3. The disciplined part:** your weekly ETH DCA is steady and your deposits are net-positive — you're in accumulation mode. Keep the DCA. Just route some of the meme-churn capital into a stable reserve instead.

**Why a generic AI can't say this:** every claim is grounded in *this* book — the 70/30 split, the 14 recent trades, the fee total, the DCA cadence, the 3% stables. Ask ChatGPT the same question cold and it asks *you* for all of that first.

---

## 2. "Should I buy more ETH here?"

*(Position sizing relative to YOUR book — and the venue you forgot about.)*

> **You:** ETH looks good here. Should I add?
>
> **Claude** · *called `get_context()`*
>
> Before you do — you're already heavier in ETH than you probably think. It's 38% across three places: your Binance spot, your Coinbase account, *and* the cold wallet you haven't synced a manual buy into. Most people forget the cold-wallet slice when they eyeball "how much ETH do I have."
>
> Your instinct isn't wrong — your last six ETH buys were all on red days, and that discipline has served you. But adding here would push ETH past 45% of the whole book, and your stable reserve is down to ~2%. So the real question isn't "is ETH good" — it's "do I want ETH to be nearly half my net worth with no cash to average down if it drops 30%?"
>
> If yes, size it small. If you're really just itching to act, rebalancing a bit of the meme bag into a stable reserve would do more for you right now than more ETH.

**Why it lands:** "the cold wallet you forgot" is the cross-venue blind spot made visceral. A tracker shows you the number; a context layer makes the agent *reason* about the number in the moment you're about to act.

---

## 3. "Am I overexposed to anything?"

*(Concentration + counterparty risk — the two kinds of "too much in one place.")*

> **You:** Am I overexposed to anything I should worry about?
>
> **Claude** · *called `get_context()`*
>
> Two different concentration problems, and they're easy to confuse:
>
> **Asset concentration:** one position is 61% of your book. If you have high conviction, that can be a choice rather than a mistake — but understand it *is* the portfolio. A bad week for that one asset is a bad week for everything.
>
> **Counterparty concentration (the one people miss):** 94% of your assets sit on a single exchange. That's not market risk — it's "the exchange freezes withdrawals" risk, and it's independent of whether your picks are good. FTX holders had great picks too.
>
> If you only fix one thing this month, it's the second one: move a meaningful slice to a wallet you control. Your conviction trade can stay; your counterparty exposure shouldn't be all-or-nothing on one venue.

**Why it lands:** counterparty concentration requires knowing *where* assets sit, not just *what* they are. No price feed or single-exchange view surfaces this. "FTX holders had great picks too" is the kind of line that gets screenshotted.

---

## 4. "Review how I've been trading the last 90 days."

*(Pure behavioral read — the dimension trackers don't have at all.)*

> **You:** Review how I've actually been trading the last 90 days. Don't be nice.
>
> **Claude** · *called `get_context()`*
>
> Okay, straight:
>
> - **You buy fear well.** Your buy/sell ratio jumps when the market's down — you added on three of the four worst weeks. That's a genuinely good instinct; most people freeze.
> - **But you round-trip.** ~40% of your trades are the same handful of memes bought and sold within days. Net P&L on that cluster is roughly flat, and you paid ~$430 in fees for the privilege. You're not investing there, you're paying for entertainment.
> - **Your funding is healthy.** Net deposits are positive and steady — you're not chasing losses with fresh money, which is the failure mode that actually wrecks people.
>
> One change with the highest leverage: keep the dip-buying, kill the meme round-trips, and the fee savings alone meaningfully change your year.

**Why a generic AI can't say this:** none of it is about holdings — it's about *patterns* derived from trade history and fund flows. This is the dimension a portfolio tracker structurally cannot show, because a tracker is a snapshot and this is a behavior.

---

## The contrast slide (use this in the thread / Show HN)

Same question, two AIs:

| | **ChatGPT (no context)** | **Your agent (CryptoContext connected)** |
|---|---|---|
| *"What's wrong with my portfolio?"* | "I'd be happy to help! Could you share your current holdings, allocation, and goals?" | "BTC + ETH are 70% of your book but 11 of your last 14 trades were memes. You have no dry powder. Your DCA is disciplined — keep it." |

That table *is* the launch. The left column is every AI today. The right column is every AI, once it can see your bags.

---

## Usage notes

- **Screenshots > text** for the thread: render these in an actual Claude/Cursor session if you can grab clean shots; otherwise the styled transcript card on the landing page is the canonical look.
- **One transcript per post** beats dumping all four — lead with #1 or the contrast table, link the rest.
- Keep amounts vague and labeled illustrative. The *shape* of the insight is the proof, not the dollar figures.
- When you eventually have a real (consented) user session that's this good, it beats all of these. Swap it in.
