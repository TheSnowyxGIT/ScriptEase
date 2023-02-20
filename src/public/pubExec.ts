import Result from '../Result';
import { executor } from '../singletons';
import SE_BRANCH from '../Tree/Branch';
import SE_LEAF from '../Tree/Leaf';

export async function run(identifier: string) {
  const data = await executor.run(identifier);
  return data;
}
