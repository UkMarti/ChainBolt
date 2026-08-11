import { EventEmitter } from 'events';
import { TriggerEvent } from './types';

export class ChainForgeEventBus extends EventEmitter {
  emitTrigger(event: TriggerEvent): void {
    this.emit('trigger:fire', event);
  }

  onTrigger(handler: (event: TriggerEvent) => void): () => void {
    this.on('trigger:fire', handler);
    return () => this.off('trigger:fire', handler);
  }

  emitActionComplete(strategyId: string, actionId: string, result: { success: boolean; error?: string }): void {
    this.emit('action:complete', { strategyId, actionId, ...result, timestamp: Date.now() });
  }
}
