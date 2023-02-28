import * as chalk from 'chalk';
import { logger } from '../Logger/Logger';

export default abstract class SE_ERROR {
  public abstract name: string;
  public abstract toString(): string;

  public show() {
    let text = logger.prefix + chalk.red(`${'ERROR'}: `);
    text += this.toString();
    console.error(text);
  }
}
