import * as chalk from 'chalk';
import { inspect } from 'util';
import SE_ERROR from '../errors/SeError';

export enum STATE {
  OK,
  KO,
}

export type stringOptions = { indent: number; maxNameLength?: number };

const indentSize = 3;

export default abstract class Result {
  // private variables
  private _error: unknown | null = null;
  private _payload: unknown | null = null;
  private _name = 'default';
  private _parent: Result | null = null;
  protected type = 'default';

  // abstract methods / variables
  protected abstract getState(): STATE;
  protected abstract stringSuite(indent: number): string;

  public isOK() {
    return this.getState() === STATE.OK;
  }

  public isKO() {
    return !this.isOK();
  }

  public show() {
    const rootResult = this.getRootParent();
    console.log(rootResult.toString({ indent: 0 }));
  }

  private _getErrorString(indent: number) {
    if (this._error instanceof Result) {
      return this._error.toString({ indent });
    } else if (this._error instanceof Error) {
      let text = this.indent(indent, chalk.red(`${this._error.name}: ${chalk.gray(this._error.message)}`));
      if (this._error.stack) {
        const lines = this._error.stack.split('\n');
        lines.shift();
        lines.forEach((line) => (text += '\n' + this.indent(indent, chalk.gray(line))));
      }
      return text;
    } else if (this._error instanceof SE_ERROR) {
      let text = this.indent(indent, chalk.red(`ERROR:`));
      const lines = this._error.toString().split('\n');
      if (lines.length > 1) {
        lines.forEach((line) => (text += '\n' + this.indent(indent, line)));
      } else {
        text += lines[0];
      }
      return text;
    } else {
      return this.indent(
        indent,
        chalk.red(`Thrown : ${chalk.gray(inspect(this._error, { depth: -1, maxStringLength: 30 }))}`),
      );
    }
  }

  public toString(options: stringOptions) {
    let name = this.getDisplayName();
    const padding = Math.max(0, (options.maxNameLength || 0) - name.length - indentSize);
    const paddingStr = ''.padEnd(padding, '-');
    name = chalk.magentaBright(name);
    let text = this.indent(options.indent, '');
    text += chalk.gray(`${name} ${paddingStr}-> ${this.getStateString()}`);
    if (this._payload !== null && this._payload !== undefined)
      text += chalk.gray(` (payload: ${inspect(this._payload, { depth: -1, maxStringLength: 30 })})`);
    const suite = this.stringSuite(options.indent + 1);
    text += suite.length > 0 ? `${suite}` : '';
    if (this._error !== null) {
      text += '\n' + this._getErrorString(options.indent + 1);
    }
    return text;
  }

  public getDisplayName(): string {
    const displayName = `'${this._name}'`;
    if (this.type !== 'default') {
      return `${displayName} as ${this.type}`;
    }
    return `${displayName}`;
  }

  public setError(error: unknown): void {
    this._error = error;
  }

  public setPayload(payload: unknown): void {
    this._payload = payload;
  }

  public setParent(parent: Result) {
    this._parent = parent;
  }

  public getRootParent(): Result {
    if (this._parent === null) {
      return this;
    }
    return this._parent.getRootParent();
  }

  /**
   * return the payload if exists, null otherwise
   */
  public getPayload(): unknown | null {
    return this._payload;
  }

  /**
   * return the error if exists
   */
  public getError(): unknown | null {
    return this._error;
  }

  public setName(name: string): void {
    this._name = name;
  }

  public getName(): string {
    return this._name;
  }

  protected indent(indent: number, text: string): string {
    let t = '';
    const pattern = chalk.gray('|'.padEnd(indentSize, ' '));
    for (let i = 0; i < indent; i++) {
      t += pattern;
    }
    t += text;
    return t;
  }

  protected getStateString(): string {
    const state = this.getState();
    if (state === STATE.OK) {
      return chalk.green('OK');
    }
    return chalk.red('KO');
  }
}
