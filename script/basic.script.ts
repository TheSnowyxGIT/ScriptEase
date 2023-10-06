import { beforeEach, leaf } from '../dist/src/public/pubScriptEase';

beforeEach(() => {
  console.log('before each');
  throw new Error('test');
});

leaf('ping', () => {
  console.log('pong');
});
