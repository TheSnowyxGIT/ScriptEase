import * as chalk from 'chalk';

export enum STATE {
  VALID,
  NOVALID,
}
export type showOptions = { indent: number; maxNameLength?: number };

export default abstract class Result {
  public static showResult(result: Result) {
    console.log(chalk.white(`\nShow Execution State :`));
    result.show({ indent: 0 });
    console.log();
  }

  protected abstract defaultName;
  public abstract getState(): STATE;
  public abstract show(option: showOptions): void;

  private _name = '';
  public set name(name: string) {
    this._name = name;
  }
  public get name() {
    return this._name || this.defaultName;
  }

  public isOK(): boolean {
    return this.getState() === STATE.VALID;
  }

  public isKO(): boolean {
    return this.getState() === STATE.NOVALID;
  }

  protected getStartShow(maxNameLength = 0): string {
    const padding = Math.max(0, maxNameLength - this.name.length);
    const paddingStr = ''.padEnd(padding, '-');
    const name = `[${chalk.white(this.name)}]`;
    const text = chalk.gray(`${name}${paddingStr}-> ${this.getStateString()}`);
    return text;
  }

  protected logIndent(indent: number, text: string) {
    let t = ''.padStart(indent * 2, ' ');
    t += text;
    console.log(t);
  }

  protected getStateString(): string {
    const state = this.getState();
    if (state === STATE.VALID) {
      return chalk.green('OK');
    }
    return chalk.red('KO');
  }
}
