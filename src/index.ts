import { getFiles, getIdentifiers } from './config/OptionMerger';
import SE_ERROR from './errors/SeError';
import Loader from './Loader';
import { builder, executor, root } from './singletons';

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

  const identifiers = await getIdentifiers();

  for (const identifier of identifiers) {
    await executor.run(identifier);
  }
}
