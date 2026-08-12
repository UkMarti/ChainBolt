# ChainBolt SDK

The JSON runtime for crypto automation. Write strategies in JSON. Let AI generate them. Run them anywhere.

## Quick Start

```bash
npx chainbolt-sdk run strategy.json --dry-run
```

## Install

```bash
npm install chainbolt-sdk
```

## Usage

```typescript
import { ChainBoltEngine, CronTrigger, AlertAction } from "chainbolt-sdk";

const engine = new ChainBoltEngine({ mode: "once", dryRun: true })
  .registerTrigger(new CronTrigger())
  .registerAction(new AlertAction());

engine.loadStrategy({
  id: "demo",
  name: "Demo Strategy",
  version: "1.0.0",
  triggers: [{ id: "t1", type: "cron", config: { intervalMs: 5000 } }],
  actions: [{ id: "a1", type: "alert", config: { message: "Hello ChainBolt" } }]
});

await engine.start();
```

## CLI

```bash
# One-shot execution
npx chainbolt-sdk run strategy.json --dry-run

# Persistent daemon
npx chainbolt-sdk run strategy.json --watch --dry-run=false
```

## Plugin Architecture

Drop in custom triggers and actions without touching engine source code.

## AI Integration

The skills/chainbolt.md file is included. Point Claude or Cursor at it to generate strategies from English.

## Safety

- Non-custodial: Engine prepares transactions. Your wallet signs them.
- Dry-run default: Must explicitly disable to touch mainnet.
- Validation: Malformed strategies are rejected before execution.

## Roadmap

- v0.2.0: Plugin architecture, event bus, validation (LIVE)
- v0.3.0: Real WebSocket price feeds
- v0.4.0: Live swap execution
- v0.5.0: Backtesting engine

## License

MIT
