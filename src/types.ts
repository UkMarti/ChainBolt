export interface TriggerContext {
  strategyId: string;
  triggerId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface TriggerEvent extends TriggerContext {
  triggerType: string;
}

export interface ActionContext extends TriggerEvent {
  strategy: StrategyConfig;
}

export interface ActionResult {
  success: boolean;
  logs: string[];
  error?: string;
}

export interface TriggerPlugin {
  readonly type: string;
  subscribe?(config: unknown, onFire: (ctx: TriggerContext) => void): () => void;
  execute?(config: unknown): Promise<TriggerContext | null>;
}

export interface ActionPlugin {
  readonly type: string;
  execute(ctx: ActionContext, config: unknown): Promise<ActionResult>;
}

export interface StrategyConfig {
  id: string;
  name: string;
  version: string;
  triggers: Array<{ id: string; type: string; config: Record<string, unknown> }>;
  actions: Array<{ id: string; type: string; config: Record<string, unknown> }>;
  chains?: string[];
  metadata?: Record<string, unknown>;
}
