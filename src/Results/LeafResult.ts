import * as chalk from 'chalk';
import SE_LEAF from '../Tree/Leaf';
import Result from './Result';

export default abstract class LeafResult extends Result {
  protected _leaf: SE_LEAF;

  constructor(leaf: SE_LEAF) {
    super();
    this._leaf = leaf;
    this.name = chalk.magenta(`leaf[${leaf.fullIdentifier}]`);
  }
}
