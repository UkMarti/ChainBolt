import { TriggerPlugin, ActionPlugin } from './types';

export class PluginRegistry {
  private triggers = new Map<string, TriggerPlugin>();
  private actions = new Map<string, ActionPlugin>();

  registerTrigger(plugin: TriggerPlugin): this {
    if (this.triggers.has(plugin.type)) {
      throw new Error("Trigger type '" + plugin.type + "' already registered");
    }
    this.triggers.set(plugin.type, plugin);
    return this;
  }

  registerAction(plugin: ActionPlugin): this {
    if (this.actions.has(plugin.type)) {
      throw new Error("Action type '" + plugin.type + "' already registered");
    }
    this.actions.set(plugin.type, plugin);
    return this;
  }

  getTrigger(type: string): TriggerPlugin {
    const plugin = this.triggers.get(type);
    if (!plugin) throw new Error("UNKNOWN_TRIGGER: '" + type + "'. Available: " + [...this.triggers.keys()].join(', '));
    return plugin;
  }

  getAction(type: string): ActionPlugin {
    const plugin = this.actions.get(type);
    if (!plugin) throw new Error("UNKNOWN_ACTION: '" + type + "'. Available: " + [...this.actions.keys()].join(', '));
    return plugin;
  }

  listTriggers(): string[] { return [...this.triggers.keys()]; }
  listActions(): string[] { return [...this.actions.keys()]; }
}
