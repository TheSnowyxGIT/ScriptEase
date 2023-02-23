import { getFiles, getIdentifiers } from './config/OptionMerger';
import SE_ERROR from './errors/SeError';
import Loader from './Loader';
import { logger } from './Logger/Looger';
import { builder, executor } from './singletons';

doAll().catch((error) => {
  if (error instanceof SE_ERROR) {
    error.show();
    process.exit(1);
  } else {
    throw error;
  }
});

async function doAll() {
  logger.info('Starting ScriptEase.');

  const files = await getFiles();
  const loader = new Loader({ files }, builder);
  await loader.load();

  const identifiers = await getIdentifiers();

  for (const identifier of identifiers) {
    await executor.run(identifier);
  }

  logger.info('Close ScriptEase.');
}
