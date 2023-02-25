import { getFiles, getIdentifiers } from './config/OptionMerger';
import SE_ERROR from './errors/SeError';
import SE_ExecutionError from './errors/SeExecutionError';
import SE_InvalidArgsError from './errors/SeInvalidArgsError';
import Loader from './Loader';
import { logger } from './Logger/Logger';
import Result, { STATE } from './Results/Result';
import { builder, executor, root } from './singletons';
import NodeManager from './Tree/NodeManager';

doAll().catch((error) => {
  if (error instanceof SE_ERROR) {
    error.show();
    process.exit(1);
  } else {
    throw error;
  }
});

async function doAll() {
  const files = await getFiles();
  const loader = new Loader({ files }, builder);
  await loader.load();

  const hasLeaves = (await NodeManager.getLeavesCount(root)) > 0;
  if (hasLeaves) {
    const identifiers = await getIdentifiers();

    if (identifiers.length > 1) {
      throw new SE_InvalidArgsError('only one identifier at the same time is supported for now.');
    } else if (identifiers.length !== 0) {
      const result = await executor.run(identifiers[0], { crash: false });
      Result.showResult(result);
      if (result.getState() === STATE.NOVALID) {
        throw new SE_ExecutionError(identifiers[0]);
      }
    }
  } else {
    logger.warn('No scripts to execute.');
  }
}
