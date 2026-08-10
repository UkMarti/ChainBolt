# Contributing

This is v0.1.0. The core engine works. The chain integrations are mocked.

## Quick Wins (Good First Issues)

- **Real price feeds:** `checkPrice()` in `src/index.ts` currently logs mock data. Integrate ChainPulse RPC.
- **Real dust recovery:** `claim_dust` action logs "scanning" but doesn't scan. Port ClaimDust logic.
- **Real swap prep:** `swap` action is unimplemented. Add 1inch/0x quote fetching.
- **Cron parsing:** Currently fires every 60s regardless of cron expression. Add `node-cron`.
- **Tests:** We have zero. Any test PR is welcome.

## Before You PR

1. Open an issue describing what you want to add
2. Fork, branch, commit
3. Keep PRs under 200 lines
4. All PRs must pass `npm run build`

## Code Style

- TypeScript strict mode
- No `any` types
- Comments explain WHY, not WHAT
