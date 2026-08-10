# ChainForge SDK

> Turn JSON configs into executable crypto automation.
>
> Built from the ashes of ChainPulse, ClaimDust, and VDATax.

## Current Status (v0.1.0)

| Feature | Status |
|---------|--------|
| Strategy engine | Working |
| AI agent integration (SKILL.md) | Working |
| DRY RUN mode | Working |
| Real price feeds | Mock (v0.2.0) |
| Real swap execution | Mock (v0.2.0) |
| Real dust recovery | Mock (v0.2.0) |

## What is this?

A TypeScript SDK that lets you (or your AI agent) define crypto automation strategies as simple JSON files.

**Non-custodial.** It prepares transactions. Your wallet signs them.

**AI-native.** Drop `skills/chainforge.md` into Claude Code or Cursor.

## Quick Start

```bash
npm install chainforge-sdk
```

Create `strategy.json` and run `npx chainforge-sdk`.

## Why I Built This

I spent 3 years building crypto tools. ChainPulse. ClaimDust. VDATax. Total users: single digits. Total revenue: 0.

I burned out. I was building for traders who do not code. I should have built for developers who do.

So I ripped out the UIs, kept the engines, and wrapped them in JSON. Now any AI agent can generate a trading bot from plain English.

No SaaS. No lock-in. Just code.

## License

MIT
