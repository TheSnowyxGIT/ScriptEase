import * as chalk from 'chalk';
import SE_ERROR from './SeError';

export default class SE_DuplicatedLeavesError extends SE_ERROR {
  public name = 'SE_DuplicatedLeavesError';
  private duplicatedLeaves: {
    identifier: string;
    occurences: number;
  }[];

  constructor(
    duplicatedLeaves: {
      identifier: string;
      occurences: number;
    }[],
  ) {
    super();
    this.duplicatedLeaves = duplicatedLeaves;
  }

  toString() {
    let text = chalk.gray('You cannot have duplicated leaves. Duplicated leaves : \n');
    for (const duplicatedLeaf of this.duplicatedLeaves) {
      text += chalk.red("\t*\t'") + chalk.white(duplicatedLeaf.identifier) + chalk.gray("' ");
      text += chalk.gray('( occurences: ') + chalk.white(`${duplicatedLeaf.occurences}`) + chalk.grey(')\n');
    }
    return text;
  }
}
