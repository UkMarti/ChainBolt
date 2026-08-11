const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.description = 'The JSON runtime for crypto automation. Plugin-first, event-driven, AI-native strategy execution.';
pkg.keywords = ['crypto','trading','automation','web3','defi','ai','strategy','plugin','event-driven'];
pkg.homepage = 'https://github.com/ukmarti/chainforge-sdk';
pkg.repository = {type:'git',url:'https://github.com/ukmarti/chainforge-sdk.git'};
pkg.bugs = {url:'https://github.com/ukmarti/chainforge-sdk/issues'};
pkg.author = 'ukmarti';
pkg.license = 'MIT';
pkg.files = ['dist','src','skills','strategy.json','README.md','CONTRIBUTING.md','ROADMAP.md'];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

const readme = `# ChainForge SDK

The JSON runtime for crypto automation. Write strategies in JSON. Let AI generate them. Run them anywhere.

## Quick Start

` + '```bash' + `
npx chainforge run strategy.json --dry-run
` + '```' + `

## Install

` + '```bash' + `
npm install chainforge-sdk
` + '```' + `

## Usage

` + '```typescript' + `
import { ChainForgeEngine, CronTrigger, AlertAction } from "chainforge-sdk";

const engine = new ChainForgeEngine({ mode: "once", dryRun: true })
  .registerTrigger(new CronTrigger())
  .registerAction(new AlertAction());

engine.loadStrategy({
  id: "demo",
  name: "Demo Strategy",
  version: "1.0.0",
  triggers: [{ id: "t1", type: "cron", config: { intervalMs: 5000 } }],
  actions: [{ id: "a1", type: "alert", config: { message: "Hello ChainForge" } }]
});

await engine.start();
` + '```' + `

## CLI

` + '```bash' + `
# One-shot execution
npx chainforge run strategy.json --dry-run

# Persistent daemon
npx chainforge run strategy.json --watch --dry-run=false
` + '```' + `

## Plugin Architecture

Drop in custom triggers and actions without touching engine source code.

## AI Integration

The skills/chainforge.md file is included. Point Claude or Cursor at it to generate strategies from English.

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
`;

fs.writeFileSync('README.md', readme);
console.log('Done');
