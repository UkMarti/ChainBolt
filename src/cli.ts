#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import { ChainForgeEngine, CronTrigger, ManualTrigger, AlertAction, WebhookAction } from './index';

const program = new Command();

program
  .name('chainforge')
  .description('Run crypto strategies from JSON configs')
  .version('0.2.0');

program
  .command('run <file>')
  .option('--dry-run', 'Simulate execution without sending transactions', true)
  .option('--watch', 'Run in persistent watch mode', false)
  .option('--verbose', 'Log full execution context')
  .action(async (file, options) => {
    try {
      const config = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const mode = options.watch ? 'watch' : 'once';

      const engine = new ChainForgeEngine({ mode, dryRun: options.dryRun })
        .registerTrigger(new CronTrigger())
        .registerTrigger(new ManualTrigger())
        .registerAction(new AlertAction())
        .registerAction(new WebhookAction());

      engine.loadStrategy(config);

      if (options.verbose) {
        engine.eventBus.on('action:complete', (r: any) => console.log('[EVENT]', r));
      }

      console.log('[ChainForge] Mode: ' + mode + ' | Dry-run: ' + options.dryRun);
      await engine.start();
    } catch (err) {
      const error = err as Error;
      console.error('[ERROR]', error.message);
      process.exit(1);
    }
  });

program.parse();
