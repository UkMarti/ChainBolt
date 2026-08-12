#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
<<<<<<< Updated upstream
import { ChainBoltEngine, CronTrigger, ManualTrigger, AlertAction, WebhookAction } from './index';
=======
import { ChainForgeEngine, CronTrigger, ManualTrigger, AlertAction, WebhookAction } from './index';
import { ChainHookTrigger } from './plugins/chainhook';
>>>>>>> Stashed changes

const program = new Command();

program
  .name('chainbolt-sdk')
  .description('Run crypto strategies from JSON configs')
  .version('0.2.1');

program
  .command('run <file>')
  .option('--dry-run', 'Simulate execution without sending transactions')
.option('--no-dry-run', 'Execute actions for real (not simulated)')
  .option('--watch', 'Run in persistent watch mode', false)
  .option('--verbose', 'Log full execution context')
  .action(async (file, options) => {
    try {
      const config = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const mode = options.watch ? 'watch' : 'once';

<<<<<<< Updated upstream
      const engine = new ChainBoltEngine({ mode, dryRun: options.dryRun })
=======
      const engine = new ChainForgeEngine({ mode, dryRun: options.dryRun ?? true })
>>>>>>> Stashed changes
        .registerTrigger(new CronTrigger())
        .registerTrigger(new ManualTrigger())
        .registerTrigger(new ChainHookTrigger())
        .registerAction(new AlertAction())
        .registerAction(new WebhookAction());

      engine.loadStrategy(config);

      if (options.verbose) {
        engine.eventBus.on('action:complete', (r: any) => console.log('[EVENT]', r));
      }

      console.log('[ChainBolt] Mode: ' + mode + ' | Dry-run: ' + options.dryRun);
      await engine.start();
    } catch (err) {
      const error = err as Error;
      console.error('[ERROR]', error.message);
      process.exit(1);
    }
  });

program.parse();

