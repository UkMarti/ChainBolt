import { TriggerPlugin, ActionPlugin, TriggerContext, ActionContext, ActionResult } from '../types';

export class CronTrigger implements TriggerPlugin {
  readonly type = 'cron';
  subscribe(config: { intervalMs?: number }, onFire: (ctx: TriggerContext) => void): () => void {
    const ms = config.intervalMs ?? 60000;
    const id = setInterval(() => {
      onFire({ strategyId: '', triggerId: '', data: { tick: Date.now() }, timestamp: Date.now() });
    }, ms);
    return () => clearInterval(id);
  }
}

export class ManualTrigger implements TriggerPlugin {
  readonly type = 'manual';
  async execute(): Promise<TriggerContext> {
    return { strategyId: '', triggerId: '', data: {}, timestamp: Date.now() };
  }
}

export class AlertAction implements ActionPlugin {
  readonly type = 'alert';
  async execute(ctx: ActionContext, config: { message?: string }): Promise<ActionResult> {
    const msg = config.message || ('Trigger ' + ctx.triggerType + ' fired');
    console.log('[ALERT] ' + msg + ' ' + JSON.stringify(ctx.data));
    return { success: true, logs: [msg] };
  }
}

export class WebhookAction implements ActionPlugin {
  readonly type = 'webhook';
  async execute(ctx: ActionContext, config: { url: string }): Promise<ActionResult> {
    try {
      const res = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      return { success: res.ok, logs: ['Webhook ' + res.status] };
    } catch (err) {
      return { success: false, logs: [], error: err instanceof Error ? err.message : 'Webhook failed' };
    }
  }
}
