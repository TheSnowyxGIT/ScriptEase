import * as yargs from 'yargs';
import { checkDirectory, checkFile, extractFiles, fileRegex, getMatchingFiles } from './filesUtils';

export interface SEConfig {
  directories?: string[];
  files?: string[];
  identifiers?: string[];
}

export class ArgsHandler {
  private directory: string[] = [];
  private file: string[] = [];
  private identifier: string[] = [];

  public async parseArgs(): Promise<void> {
    const argv = await yargs.options({
      directory: {
        type: 'array',
      },
      file: {
        type: 'array',
      },
    }).argv;

    this.directory = argv.directory?.map((dir) => `${dir}`) || [];
    this.file = argv.file?.map((file) => `${file}`) || [];
    this.identifier = argv._.map((id) => `${id}`) || [];
  }

  public async getFiles(): Promise<string[]> {
    return extractFiles(this.directory, this.file);
  }

  public async getIdentifiers(): Promise<string[]> {
    return this.identifier;
  }
}

export async function getArgsConfig(): Promise<ArgsHandler> {
  const ah = new ArgsHandler();
  await ah.parseArgs();
  return ah;
}
