import { resolve } from 'path';
import { logger } from './Logger/Logger';

export class ModuleLoader {
  load(modulePath: string): void {
    const parentDir = 'node_modules';
    try {
      require(resolve(parentDir, modulePath));
    } catch (error) {
      logger.error(`Cannot load module ${module}`);
      throw error;
    }
  }

  loadAll(modulePaths: string[]): void {
    for (const module of modulePaths) {
      this.load(module);
    }
  }
}

const moduleLoader = new ModuleLoader();
export default moduleLoader;
