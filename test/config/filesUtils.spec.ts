import { checkDirectory, checkFile, getMatchingFiles } from '../../src/config/filesUtils';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { expect } from 'chai';
import SE_InvalidArgsError from '../../src/errors/SeInvalidArgsError';
import { randomBytes } from 'crypto';
import { after } from 'mocha';

describe('checkDirectory', () => {
  const testDir = randomBytes(20).toString('hex');

  it('should not throw an error for an existing directory', () => {
    try { fs.mkdirSync(testDir); } catch(e) {};
    expect(() => checkDirectory(testDir)).to.not.throw();
    fsExtra.rmSync(testDir, {force: true, recursive: true});
  });

  it('should throw an error for a non-existent directory', () => {
    const dir = 'non-existent-dir';
    expect(() => checkDirectory(dir)).to.throws();
  });
});

describe('checkFile', () => {
  const testDir = randomBytes(20).toString('hex');

  beforeEach(() => {
    try { fs.mkdirSync(testDir); } catch(e) {};
  });

  afterEach(() => {
    fsExtra.rmSync(testDir, {force: true, recursive: true});
  });


  it('should not throw an error for an existing file with a valid name', () => {
    fs.writeFileSync(`${testDir}/file.script.js`, '');
    expect(() => checkFile(`${testDir}/file.script.js`)).to.not.throw();
  });

  it('should throw an error for a non-existent file', () => {
    expect(() => checkFile('non-existent-file')).to.throw();
  });

  it('should throw an error for a file with an invalid name', () => {
    fs.writeFileSync(`${testDir}/file.js`, '');
    expect(() => checkFile(`${testDir}/file.js`)).to.throw();
  });
});

describe('getMatchingFiles', () => {
  const testDir = randomBytes(20).toString('hex');

  beforeEach(() => {
    // Create test directory and files
    try { fs.mkdirSync(testDir); } catch(e) {};
    try { fs.writeFileSync(`${testDir}/file1.script.js`, ``); } catch(e) {};
    try { fs.writeFileSync(`${testDir}/file2.js`, ``); } catch(e) {};
    try { fs.mkdirSync(`${testDir}/subdir`); } catch(e) {};
    try { fs.writeFileSync(`${testDir}/subdir/file3.script.js`, ``); } catch(e) {};
    try { fs.writeFileSync(`${testDir}/subdir/file4.js`, ``); } catch(e) {};
  });

  afterEach(() => {
    // Remove test directory and files
    try { fs.unlinkSync(`${testDir}/subdir/file4.js`); } catch(e) {};
    try { fs.unlinkSync(`${testDir}/subdir/file3.script.js`); } catch(e) {};
    try { fs.rmdirSync(`${testDir}/subdir`); } catch(e) {};
    try { fs.unlinkSync(`${testDir}/file2.js`); } catch(e) {};
    try { fs.unlinkSync(`${testDir}/file1.script.js`); } catch(e) {};
    try { fs.rmdirSync(`${testDir}`); } catch(e) {};
  });

  it(`should return an array of files that match the regex`, () => {
    const regex = /\.script\.js$/;
    const files = getMatchingFiles(`${testDir}`, regex);
    expect(files).to.have.lengthOf(2);
    expect(files).to.include(path.join(`${testDir}`, `file1.script.js`));
    expect(files).to.include(path.join(`${testDir}`, `subdir`, `file3.script.js`));
  });

  it(`should return an empty array if no files match the regex`, () => {
    const regex = /\.test\.js$/;
    const files = getMatchingFiles(`${testDir}`, regex);
    expect(files).to.be.empty;
  });

  it(`should return an empty array if the provided directory does not exist`, () => {
    const regex = /\.script\.js$/;
    const files = getMatchingFiles(`non-existent-dir`, regex);
    expect(files).to.be.empty;
  });
});

