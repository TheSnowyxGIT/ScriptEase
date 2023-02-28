import { spawn } from 'child_process';
import ExecResult from '../Result/ExecResult';
import MultipleResult from '../Result/MultipleResult';
import Result from '../Result/Result';
import { executor } from '../singletons';

interface ExecConfig {
  cwd?: string;
  redirection?: {
    stdout?: string;
    stderr?: string;
  };
  customEnv?: { [key: string]: string };
  crash?: boolean;
}

type NpxExecConfig = ExecConfig & { argsAlign?: 'LEFT' | 'RIGHT' };

interface NpxExecOption {
  option: string;
  value?: string;
}

async function _exec(command: string, config: ExecConfig): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    config.crash = config.crash === undefined ? true : config.crash;
    const customEnv = Object.assign({}, config.customEnv);
    if (config.redirection) {
      if (config.redirection.stdout) command += ` 2> ${config.redirection.stdout}`;
      if (config.redirection.stderr) command += ` > ${config.redirection.stderr}`;
    }
    const saveEnv = Object.assign(process.env);
    process.env = Object.assign(customEnv, { FORCE_COLOR: true, ...process.env });
    const pr = spawn(command, {
      shell: true,
      stdio: 'inherit',
      cwd: config.cwd,
    });
    pr.on('close', (code) => {
      process.env = saveEnv;
      if (code !== 0) {
        if (config.crash) {
          reject(new ExecResult(command, code || 0));
        }
      }
      resolve(new ExecResult(command, code || 0));
    });
    pr.on('error', (err) => {
      process.env = saveEnv;
      reject(err);
    });
  });
}

/**
 * Runs a single leaf with a given identifier and returns the result.
 */
export async function run(identifier: string): Promise<Result> {
  const data = await executor.run(identifier, {
    crash: true,
  });
  return data;
}

/**
 * Runs a single leaf with a given identifier and returns the result, without throwing an error if the leaf fails.
 */
export async function runCatch(identifier: string): Promise<Result> {
  const data = await executor.run(identifier, {
    crash: false,
  });
  return data;
}

/**
 * Runs multiple leaves with given identifiers, stopping on the first failure and returning the results of all leaves.
 */
export async function runAllStopOnFailure(identifiers: string[]): Promise<MultipleResult<Result>> {
  const results: Result[] = [];
  for (const identifier of identifiers) {
    const result = await runCatch(identifier);
    results.push(result);
    if (result.isKO()) {
      throw new MultipleResult(results);
    }
  }
  return new MultipleResult(results);
}

/**
 * Runs multiple leaves with given identifiers, stopping on the first failure and returning the results of all leaves up to that point.
 */
export async function runAllStopOnFailureCatch(identifiers: string[]): Promise<MultipleResult<Result>> {
  const results: Result[] = [];
  for (const identifier of identifiers) {
    const result = await runCatch(identifier);
    results.push(result);
    if (result.isKO()) {
      break;
    }
  }
  return new MultipleResult(results);
}

export async function runAllIgnoreFailure(identifiers: string[]): Promise<MultipleResult<Result>> {
  const results: Result[] = [];
  for (const identifier of identifiers) {
    results.push(await runCatch(identifier));
  }
  const multipleResult = new MultipleResult(results);
  if (multipleResult.isKO()) {
    throw multipleResult;
  }
  return multipleResult;
}

/**
 * Runs multiple leaves with given identifiers, ignoring failures and returning the results of all leaves.
 */
export async function runAllIgnoreFailureCatch(identifiers: string[]): Promise<MultipleResult<Result>> {
  const results: Result[] = [];
  for (const identifier of identifiers) {
    results.push(await runCatch(identifier));
  }
  const multipleResult = new MultipleResult(results);
  return multipleResult;
}

/**
 * Execute a command in the shell and return the result as an object.
 */
export async function exec(cmd: string, config: ExecConfig = {}): Promise<ExecResult> {
  return await _exec(cmd, config);
}

/**
 * Execute an `npx` command with the given arguments and options and return the result.
 */
export async function npxExec(
  cmd: string,
  args: string[] = [],
  options: NpxExecOption[] = [],
  config: NpxExecConfig = {},
): Promise<ExecResult> {
  config.argsAlign = config.argsAlign || 'RIGHT';

  const flattenOptions = options.map((option) => (option.value ? `${option.option} ${option.value}` : option.option));
  let fullCommand = '';
  if (config.argsAlign === 'LEFT') {
    fullCommand = `npx ${cmd} ${args.join(' ')} ${flattenOptions.join(' ')}`;
  } else {
    fullCommand = `npx ${cmd} ${flattenOptions.join(' ')} ${args.join(' ')}`;
  }
  return await _exec(fullCommand, config);
}
