import SE_InvalidConfigError from '../errors/Config/SeInvalidConfig';
import SE_InvalidArgsError from '../errors/SeInvalidArgsError';
import { ArgsHandler, getArgsConfig } from './ArgsHandler';
import { getSEConfig } from './ConfigHandler';
import { extractFiles } from './filesUtils';

export async function getFiles(): Promise<string[]> {
  const seConfig = await getSEConfig();
  seConfig.directories = seConfig.directories || [];
  seConfig.files = seConfig.files || [];
  try {
    const correctFiles = extractFiles(seConfig.directories, seConfig.files);
    return correctFiles;
  } catch (error) {
    if (error instanceof SE_InvalidArgsError) {
      throw new SE_InvalidConfigError(error.message);
    }
    throw error;
  }
}

export async function getIdentifiers(): Promise<string[]> {
  const ah = await getArgsConfig();
  return await ah.getIdentifiers();
}
