import SE_InvalidArgsError from '../errors/SeInvalidArgsError';
import * as fs from 'fs';
import * as path from 'path';

export const fileRegex: RegExp = /.+\.script\.(ts|js)$/;
export const fileRegexExample: string = '<filename>.script.(ts|js)';

export function checkDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    throw new SE_InvalidArgsError(`The directory '${dir}' do not exists`);
  }
}

export function checkFile(file: string) {
  if (!file.match(fileRegex)) {
    throw new SE_InvalidArgsError(`The file path '${file}' must follow this syntax : '${fileRegexExample}'`);
  }
  if (!fs.existsSync(file)) {
    throw new SE_InvalidArgsError(`The file path '${file}' do not exists`);
  }
}

export function getMatchingFiles(dir: string, regex: RegExp) {
  let queue: string[] = [dir];
  let files: string[] = [];

  while (queue.length > 0) {
    const currentDir = queue.shift() as string;
    if (!fs.existsSync(currentDir)) {
      continue;
    }
    const filesInDir = fs.readdirSync(currentDir);

    for (const file of filesInDir) {
      const filePath = path.join(currentDir, file);
      const fileStat = fs.lstatSync(filePath);

      if (fileStat.isDirectory()) {
        queue.push(filePath);
      } else if (fileStat.isFile() && regex.test(file)) {
        files.push(filePath);
      }
    }
  }
  return files;
}

export function extractFiles(directories: string[], files: string[]): string[] {
  let allFiles: Set<string> = new Set<string>();

  //  search for files recursively
  for (const dir of directories) {
    checkDirectory(dir);
    // get the matching files recursively in the directory
    const matchingfiles = getMatchingFiles(dir, fileRegex);

    // add the matching files to the set, this will automatically remove any duplicates
    matchingfiles.forEach((file) => allFiles.add(file));
  }

  // add specific files to the list
  files.forEach((file) => allFiles.add(file));

  // check if all files exists
  for (const file of files) {
    checkFile(file);
  }

  // make files absolute
  let filesArray = [...allFiles];
  filesArray = filesArray.map((file) => path.resolve(file));

  // convert the set to an array
  return filesArray;
}
