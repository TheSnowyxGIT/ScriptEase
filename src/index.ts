import * as chalk from 'chalk';
import { program } from 'commander';
import * as findUp from 'findup-sync';
import { readFileSync } from 'fs';
import getRunCommand from './Commands/run';
import SE_ERROR from './errors/SeError';
import { logger } from './Logger/Logger';

doAll().catch((error) => {
  if (error instanceof SE_ERROR) {
    error.show();
  } else {
    console.log(error);
  }
  process.exit(1);
});

const commanderConfig = {
  // Visibly override write routines as example!
  writeErr: (str: string) => {
    str = str.replace('error:', chalk.red('ERROR:'));
    process.stdout.write(`${logger.prefix} ${str}`);
  },
  writeOut: (str: string) => process.stdout.write(`${logger.prefix}${str}`),
};

async function doAll() {
  const packageJsonPath = await findUp('package.json');
  const version = packageJsonPath ? JSON.parse(readFileSync(packageJsonPath, 'utf-8')).version : 'Unknown version';
  program.name('ScriptEase').description('CLI for running Javascript scripts').version(version);
  program.configureOutput(commanderConfig);

  const commands = [getRunCommand()];

  for (const command of commands) {
    command.configureOutput(commanderConfig);
    program.addCommand(command);
  }

  await program.parseAsync();
}
