import Builder from './Builder';
import Executor from './Executor';
import SE_ROOT from './Tree/Root';

export const root = new SE_ROOT();
export const builder = new Builder(root);
export const executor = new Executor(root);
