import * as chalk from 'chalk';
import SE_BuildError from './SeBuildError';

export default class SE_MoveHeadBuildError extends SE_BuildError {
  public name: string = 'SE_MoveHeadBuildError';

  constructor(message: string) {
    super(message);
  }
}
