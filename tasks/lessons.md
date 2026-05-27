# Lessons Learned

## 2026-05-27: Wallet Portfolio Fetch on Vercel Serverless

### Problem
Wallet data not appearing in portfolio context. Multiple cascading issues.

### Root Causes & Fixes

1. **`{ next: { revalidate: 300 } }` is invalid in Route Handlers**
   - Only works in Server Components. In Route Handlers it causes fetch to fail silently.
   - Fix: Use `{ cache: 'no-store', signal: AbortSignal.timeout(ms) }` instead.

2. **Viem's default public RPCs are unreliable from Vercel**
   - `http()` with no URL uses chain defaults (Cloudflare for Ethereum) which timeout from cloud IPs.
   - Ankr public RPCs now require API keys (changed since 2025).
   - Fix: Use explicit `PublicNode` RPC URLs (`https://ethereum-rpc.publicnode.com`, etc.) — free, no API key, ~1.5s response.

3. **Sequential fetches cause 504 on Vercel**
   - Exchange fetch + wallet fetch in sequential for-loops exceeds Vercel function timeout.
   - Even `maxDuration: 60` isn't enough if individual operations are slow.
   - Fix: Use `Promise.all` for all independent operations (exchange fetches, wallet fetches, getBalance + multicall).

4. **Dashboard should never block on slow API calls**
   - `await fetchPortfolio()` in `init()` prevents the entire dashboard from rendering.
   - Fix: Set `loading = false` before starting portfolio fetch. Fire-and-forget the fetch; portfolio section appears when data arrives.

5. **Always use per-source timeouts for aggregation endpoints**
   - A single slow/failing source shouldn't block the entire response.
   - Fix: Wrap each data source fetch in a `withTimeout` helper that returns null on timeout. Return partial results with error metadata.

### Pattern: Reliable External Data Fetching on Vercel Serverless
```
1. Use explicit RPC URLs (never rely on library defaults)
2. Set aggressive timeouts (5s for RPC, 5s for CoinGecko)
3. Parallelize all independent operations
4. Add per-source timeout wrappers
5. Return partial results on failure
6. Make UI non-blocking — show structure first, data later
```
