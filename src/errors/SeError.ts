import * as chalk from 'chalk';

export default abstract class SE_ERROR {
  public abstract name: string;
  public abstract toString(): string;

  public show() {
    let text = chalk.red(`${this.name}: `);
    text += this.toString();
    console.error(text);
  }
}
