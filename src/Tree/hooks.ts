import SE_DuplicateHookBuildError from '../errors/Build/SeDuplicateHookBuildError';

export type Executable = () => Promise<void> | void;
export type ExecutableInfo = (identifier: string) => Promise<void> | void;

interface Hook<T> {
  exec: T;
}

export type OnceHook = Hook<Executable> & { called: boolean };
export type EachHook = Hook<ExecutableInfo>;
export type BeforeOncehook = OnceHook;
export type AfterOncehook = OnceHook;
export type BeforeEachhook = EachHook;
export type AfterEachhook = EachHook;

export interface Hookable {
  beforeOnce?: BeforeOncehook;
  afterOnce?: AfterOncehook;
  beforeEach?: BeforeEachhook;
  afterEach?: AfterEachhook;
}

export class HookHandler {
  private hookable: Hookable;

  constructor(hookable: Hookable) {
    this.hookable = hookable;
  }

  async runBeforeOnce() {
    if (this.hookable.beforeOnce && !this.hookable.beforeOnce.called) {
      await this.hookable.beforeOnce.exec();
      this.hookable.beforeOnce.called = true;
    }
  }

  async runAfterOnce() {
    if (this.hookable.afterOnce && !this.hookable.afterOnce.called) {
      await this.hookable.afterOnce.exec();
      this.hookable.afterOnce.called = true;
    }
  }

  async runBeforeEach(identifier: string) {
    if (this.hookable.beforeEach) {
      await this.hookable.beforeEach.exec(identifier);
    }
  }

  async runAfterEach(identifier: string) {
    if (this.hookable.afterEach) {
      await this.hookable.afterEach.exec(identifier);
    }
  }

  setBeforeOnce(beforeOnce: Executable) {
    if (this.hookable.beforeOnce) {
      throw new SE_DuplicateHookBuildError('beforeOnce');
    }
    this.hookable.beforeOnce = { exec: beforeOnce, called: false };
  }

  setAfterOnce(afterOnce: Executable) {
    if (this.hookable.afterOnce) {
      throw new SE_DuplicateHookBuildError('afterOnce');
    }
    this.hookable.afterOnce = { exec: afterOnce, called: false };
  }

  setBeforeEach(beforeEach: ExecutableInfo) {
    if (this.hookable.beforeEach) {
      throw new SE_DuplicateHookBuildError('beforeEach');
    }
    this.hookable.beforeEach = { exec: beforeEach };
  }

  setAfterEach(afterEach: ExecutableInfo) {
    if (this.hookable.afterEach) {
      throw new SE_DuplicateHookBuildError('afterEach');
    }
    this.hookable.afterEach = { exec: afterEach };
  }
}
