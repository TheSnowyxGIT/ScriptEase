import * as chalk from 'chalk';
import { inspect } from 'util';
import SE_LEAF from '../Tree/Leaf';
import LeafResult from './LeafResult';
import { showOptions, STATE } from './Result';

export default class PayloadLeafResult extends LeafResult {
  protected defaultName = 'PayloadLeafResult';
  private _payload: unknown;

  constructor(leaf: SE_LEAF, payload: unknown) {
    super(leaf);
    this._payload = payload;
  }

  public getState(): STATE {
    return STATE.VALID;
  }

  public getPayload(): unknown {
    return this._payload;
  }

  public show(option: showOptions): void {
    let text = this.getStartShow(option.maxNameLength);
    if (this._payload !== undefined)
      text += chalk.gray(` (payload: ${inspect(this._payload, { depth: -1, maxStringLength: 30 })})`);
    this.logIndent(option.indent, text);
  }
}
