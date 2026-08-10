/**
 * ChainForge SDK
 * Turn JSON configs into executable crypto automation.
 */

export interface EngineConfig {
  rpcEndpoints: Record<string, string>;
  webhookUrl?: string;
  dryRun?: boolean;
}

export interface StrategyConfig {
  name: string;
  version: string;
  triggers: Trigger[];
  actions: Action[];
  chains: string[];
  metadata?: {
    author?: string;
    description?: string;
    tags?: string[];
  };
}

export type Trigger =
  | { type: 'price'; token: string; condition: 'above' | 'below'; value: number; chain: string; source?: string }
  | { type: 'whale_move'; address: string; minValueUSD: number; chain: string }
  | { type: 'dust_threshold'; chain: string; minValueUSD: number }
  | { type: 'cron'; schedule: string }
  | { type: 'event'; contract: string; signature: string; chain: string };

export type Action =
  | { type: 'swap'; from: string; to: string; amount: number | 'percentage'; chain: string; slippage?: number }
  | { type: 'bridge'; token: string; fromChain: string; toChain: string; amount: number }
  | { type: 'claim_dust'; chains: string[] }
  | { type: 'alert'; message: string; severity: 'info' | 'warn' | 'critical' }
  | { type: 'generate_tax_report'; year: number; jurisdiction: string }
  | { type: 'webhook'; url: string; payload: Record<string, any> };

export interface ExecutionContext {
  trigger: Trigger;
  strategy: StrategyConfig;
  timestamp: number;
  data: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  actions: Action[];
  txHashes?: string[];
  errors?: string[];
  logs: string[];
}

export class ChainForgeEngine {
  private config: EngineConfig;
  private strategies: Map<string, StrategyConfig> = new Map();
  private running = false;
  private intervals: ReturnType<typeof setInterval>[] = [];

  constructor(config: EngineConfig) {
    this.config = config;
  }

  loadStrategy(id: string, config: StrategyConfig): void {
    this.strategies.set(id, config);
    console.log(`[ChainForge] Loaded strategy: ${config.name} (${id})`);
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    console.log('[ChainForge] Engine started. Watching strategies...');

    for (const [id, strategy] of this.strategies) {
      for (const trigger of strategy.triggers) {
        if (trigger.type === 'cron') {
          const interval = setInterval(() => this.evaluate(id), 60000);
          this.intervals.push(interval);
        }
        if (trigger.type === 'price') {
          const interval = setInterval(() => this.checkPrice(id, trigger), 30000);
          this.intervals.push(interval);
        }
      }
    }
  }

  stop(): void {
    this.running = false;
    this.intervals.forEach(clearInterval);
    console.log('[ChainForge] Engine stopped.');
  }

  private async evaluate(strategyId: string): Promise<void> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    console.log(`[ChainForge] Evaluating: ${strategy.name}`);
    
    const mockContext: ExecutionContext = {
      trigger: strategy.triggers[0],
      strategy,
      timestamp: Date.now(),
      data: { price: 0, block: 0 }
    };

    const result = await this.executeActions(strategy.actions, mockContext);
    console.log(`[ChainForge] Result: ${result.success ? 'SUCCESS' : 'FAIL'}`, result.logs);
  }

  private async checkPrice(strategyId: string, trigger: Extract<Trigger, { type: 'price' }>): Promise<void> {
    console.log(`[ChainForge] Checking price for ${trigger.token} on ${trigger.chain}`);
  }

  private async executeActions(actions: Action[], ctx: ExecutionContext): Promise<ExecutionResult> {
    const result: ExecutionResult = { success: true, actions, logs: [] };

    for (const action of actions) {
      try {
        if (this.config.dryRun) {
          result.logs.push(`[DRY RUN] Would execute: ${JSON.stringify(action)}`);
          continue;
        }

        switch (action.type) {
          case 'alert':
            result.logs.push(`[ALERT] ${action.severity}: ${action.message}`);
            if (this.config.webhookUrl) {
              await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, context: ctx })
              });
            }
            break;
          case 'claim_dust':
            result.logs.push(`[DUST] Scanning chains: ${action.chains.join(', ')}`);
            break;
          case 'generate_tax_report':
            result.logs.push(`[TAX] Generating report for ${action.jurisdiction} ${action.year}`);
            break;
          case 'webhook':
            await fetch(action.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload)
            });
            result.logs.push(`[WEBHOOK] Sent to ${action.url}`);
            break;
          default:
            result.logs.push(`[EXEC] ${action.type} not yet implemented in open-source core`);
        }
      } catch (err) {
        result.success = false;
        result.errors = result.errors || [];
        result.errors.push(String(err));
      }
    }

    return result;
  }
}

// CLI entrypoint
if (require.main === module) {
  const engine = new ChainForgeEngine({
    rpcEndpoints: {
      ethereum: process.env.ETH_RPC || 'https://eth.llamarpc.com',
      solana: process.env.SOL_RPC || 'https://api.mainnet-beta.solana.com',
      base: process.env.BASE_RPC || 'https://base.llamarpc.com'
    },
    dryRun: true
  });

  const fs = require('fs');
  const strategyFile = process.env.STRATEGY_FILE || './strategy.json';
  
  if (fs.existsSync(strategyFile)) {
    const config = JSON.parse(fs.readFileSync(strategyFile, 'utf8'));
    engine.loadStrategy('main', config);
    engine.start();
  } else {
    console.log('[ChainForge] No strategy.json found. Create one to begin.');
  }
}
