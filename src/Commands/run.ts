/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command, Option } from 'commander';
import Loader from '../Loader';
import { logger } from '../Logger/Logger';
import moduleLoader from '../ModuleLoader';
import Result from '../Result/Result';
import NodeManager from '../Tree/NodeManager';
import { getSEConfig } from '../config/ConfigHandler';
import { extractFiles } from '../config/filesUtils';
import SE_ExecutionError from '../errors/SeExecutionError';
import SE_InvalidArgsError from '../errors/SeInvalidArgsError';
import { builder, executor, root } from '../singletons';

interface RunMergedOptions {
  files: string[];
  require: string[];
}

async function mergeRunOptions(argsOptions: any): Promise<RunMergedOptions> {
  const seConfig = await getSEConfig();

  const directories = (seConfig.directories || []).concat(argsOptions.directory ? [argsOptions.directory] : []);
  const files = (seConfig.files || []).concat(argsOptions.file ? [argsOptions.file] : []);
  const extractedFiles = extractFiles(directories, files);

  return {
    files: extractedFiles,
    require: [...new Set<string>([...(seConfig.require || []), ...(argsOptions.require || [])])],
  };
}

export default function getRunCommand() {
  const runCommand = new Command('run');
  runCommand.description('Run a script');
  runCommand.argument('<script>', 'script name');
  runCommand.addOption(new Option('-d, --directory <directory>', 'Set directory'));
  runCommand.addOption(new Option('-f, --file <file>', 'Set file script'));
  runCommand.addOption(new Option('-r, --require <module...>', 'Require module'));
  runCommand.action(async (identifier, options) => {
    const mergedOptions = await mergeRunOptions(options);

    moduleLoader.loadAll(mergedOptions.require);

    const loader = new Loader({ files: mergedOptions.files }, builder);
    await loader.load();
    const hasLeaves = (await NodeManager.getLeavesCount(root)) > 0;
    if (hasLeaves) {
      const identifiers = [identifier];

      if (identifiers.length > 1) {
        throw new SE_InvalidArgsError('only one identifier at the same time is supported for now.');
      } else if (identifiers.length !== 0) {
        let result: Result;
        try {
          result = await executor.run(identifiers[0], { crash: true });
        } catch (error) {
          if (error instanceof Result) {
            throw new SE_ExecutionError(identifiers[0], error);
          } else {
            throw error;
          }
        }
        if (result.isKO()) {
          throw new SE_ExecutionError(identifiers[0], result);
        }
      }
    } else {
      logger.warn('No scripts to execute.');
    }
  });
  return runCommand;
}
