import { PluginRegistry } from './registry';
import { ChainForgeEventBus } from './event-bus';
import { validateStrategy, ValidatedStrategy } from './validator';
import { TriggerPlugin, ActionPlugin, TriggerEvent, ActionContext } from './types';

export type ExecutionMode = 'once' | 'watch';

export interface EngineOptions {
  mode?: ExecutionMode;
  dryRun?: boolean;
}

export class ChainForgeEngine {
  private registry = new PluginRegistry();
  private bus = new ChainForgeEventBus();
  private strategies = new Map<string, ValidatedStrategy>();
  private subscriptions = new Map<string, Array<() => void>>();
  private running = false;
  private mode: ExecutionMode;
  private dryRun: boolean;
  private busUnsub?: () => void;

  constructor(options: EngineOptions = {}) {
    this.mode = options.mode ?? 'watch';
    this.dryRun = options.dryRun ?? true;
  }

  registerTrigger(plugin: TriggerPlugin): this {
    this.registry.registerTrigger(plugin);
    return this;
  }

  registerAction(plugin: ActionPlugin): this {
    this.registry.registerAction(plugin);
    return this;
  }

  get eventBus(): ChainForgeEventBus {
    return this.bus;
  }

  loadStrategy(raw: unknown): ValidatedStrategy {
    const strategy = validateStrategy(raw);
    this.strategies.set(strategy.id, strategy);
    return strategy;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.busUnsub = this.bus.onTrigger(this.handleTrigger.bind(this));
    if (this.mode === 'watch') {
      await this.startWatchMode();
    } else {
      await this.runOnceMode();
    }
  }

  stop(): void {
    for (const subs of this.subscriptions.values()) {
      subs.forEach(unsub => { try { unsub(); } catch {} });
    }
    this.subscriptions.clear();
    this.busUnsub?.();
    this.running = false;
  }

  private async startWatchMode(): Promise<void> {
    for (const [id, strategy] of this.strategies) {
      const subs: Array<() => void> = [];
      for (const trigger of strategy.triggers) {
        const plugin = this.registry.getTrigger(trigger.type);
        if (!plugin.subscribe) {
          throw new Error("Trigger '" + trigger.type + "' does not support watch mode");
        }
        const unsub = plugin.subscribe(trigger.config, (ctx) => {
          this.bus.emitTrigger({
            strategyId: id,
            triggerId: trigger.id,
            triggerType: trigger.type,
            data: ctx.data,
            timestamp: Date.now(),
          });
        });
        subs.push(unsub);
      }
      this.subscriptions.set(id, subs);
    }
  }

  private async runOnceMode(): Promise<void> {
    for (const [id, strategy] of this.strategies) {
      for (const trigger of strategy.triggers) {
        const plugin = this.registry.getTrigger(trigger.type);
        if (!plugin.execute) {
          throw new Error("Trigger '" + trigger.type + "' does not support once mode");
        }
        const ctx = await plugin.execute(trigger.config);
        if (ctx) {
          this.bus.emitTrigger({
            strategyId: id,
            triggerId: trigger.id,
            triggerType: trigger.type,
            data: ctx.data,
            timestamp: Date.now(),
          });
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    this.stop();
  }

  private async handleTrigger(event: TriggerEvent): Promise<void> {
    const strategy = this.strategies.get(event.strategyId);
    if (!strategy) return;
    for (const action of strategy.actions) {
      try {
        const plugin = this.registry.getAction(action.type);
        const ctx: ActionContext = { ...event, strategy };
        if (this.dryRun) {
          console.log("[DRY-RUN] Action '" + action.id + "' (" + action.type + ") would execute");
          this.bus.emitActionComplete(strategy.id, action.id, { success: true });
          continue;
        }
        const result = await plugin.execute(ctx, action.config);
        this.bus.emitActionComplete(strategy.id, action.id, result);
        if (!result.success) {
          console.error("[ChainForge] Action '" + action.id + "' failed: " + (result.error || 'Unknown error'));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[ChainForge] Action '" + action.id + "' CRASHED: " + message);
        this.bus.emitActionComplete(strategy.id, action.id, { success: false, error: message });
      }
    }
  }
}
