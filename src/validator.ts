import { z } from 'zod';

const TriggerSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.string(), z.unknown()).default({}),
});

const ActionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const StrategyConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().default('1.0.0'),
  triggers: z.array(TriggerSchema).min(1, 'At least one trigger required'),
  actions: z.array(ActionSchema).min(1, 'At least one action required'),
  chains: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ValidatedStrategy = z.infer<typeof StrategyConfigSchema>;

export function validateStrategy(config: unknown): ValidatedStrategy {
  const result = StrategyConfigSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map(i => i.path.join('.') + ': ' + i.message)
      .join(' | ');
    throw new Error('STRATEGY_VALIDATION_FAILED: ' + issues);
  }
  return result.data;
}
