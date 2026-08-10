# chainforge

## Description
Generate and deploy crypto automation strategies using the ChainForge SDK.

## System Requirements
- Node.js 18+
- npm install chainforge-sdk

## Tools

### generate_strategy
Convert natural language into a ChainForge JSON config.
- description (string)
- chains (string[])

### simulate_strategy
Run a dry-run simulation.
- config (object)
- days (number, default 30)

### deploy_strategy
Deploy to a live engine.
- config (object)
- engine_url (string, default http://localhost:3000)

## Examples

### Whale Following
User: "Monitor wallet 0x1234 on Ethereum. If they buy 100+ ETH, alert me and swap 10% of my USDC to ETH."
```json
{
  "name": "Whale Follower",
  "version": "1.0.0",
  "chains": ["ethereum"],
  "triggers": [{"type":"whale_move","address":"0x1234","minValueUSD":200000,"chain":"ethereum"}],
  "actions": [
    {"type":"alert","message":"Whale bought 100+ ETH","severity":"critical"},
    {"type":"swap","from":"USDC","to":"ETH","amount":"percentage","chain":"ethereum","slippage":0.5}
  ]
}
```

### Dust Cleanup
User: "Every Sunday, scan Solana and Base for dust. Claim it and alert me."
```json
{
  "name": "Weekly Dust Sweeper",
  "version": "1.0.0",
  "chains": ["solana","base"],
  "triggers": [{"type":"cron","schedule":"0 0 * * 0"}],
  "actions": [
    {"type":"claim_dust","chains":["solana","base"]},
    {"type":"alert","message":"Dust cleanup done","severity":"info"}
  ]
}
```

## Notes
- Dry-run mode by default. Set DRY_RUN=false for live.
- Non-custodial: prepares transactions, wallet signs them.
