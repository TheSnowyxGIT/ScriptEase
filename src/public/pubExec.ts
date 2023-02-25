import { spawn } from 'child_process';
import { logger } from '../Logger/Logger';
import ExecResult from '../Results/ExecResult';
import Result from '../Results/Result';
import { executor } from '../singletons';

interface ExecConfig {
  cwd?: string;
  redirection?: {
    stdout?: string;
    stderr?: string;
  };
  customEnv?: { [key: string]: string };
}

type NpxExecConfig = ExecConfig & { argsAlign?: 'LEFT' | 'RIGHT' };

interface NpxExecOption {
  option: string;
  value?: string;
}

async function _exec(command: string, config: ExecConfig): Promise<number> {
  return new Promise((resolve, reject) => {
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
        logger.warn(`Execution exit with code ${code} : '${command}'`);
      }
      resolve(code || 0);
    });
    pr.on('error', (err) => {
      process.env = saveEnv;
      reject(err);
    });
  });
}

export async function run(identifier: string): Promise<Result> {
  const data = await executor.run(identifier, {
    crash: true,
  });
  return data;
}

export async function runCatch(identifier: string): Promise<Result> {
  const data = await executor.run(identifier, {
    crash: false,
  });
  return data;
}

export async function exec(cmd: string, config: ExecConfig = {}): Promise<ExecResult> {
  const code = await _exec(cmd, config);
  return new ExecResult(code);
}

export async function npxExec(
  cmd: string,
  args: string[],
  options: NpxExecOption[] = [],
  config: NpxExecConfig,
): Promise<ExecResult> {
  config.argsAlign = config.argsAlign || 'RIGHT';

  const flattenOptions = options.map((option) => (option.value ? `${option.option} ${option.value}` : option.option));
  let fullCommand = '';
  if (config.argsAlign === 'LEFT') {
    fullCommand = `npx ${cmd} ${args.join(' ')} ${flattenOptions.join(' ')}`;
  } else {
    fullCommand = `npx ${cmd} ${flattenOptions.join(' ')} ${args.join(' ')}`;
  }
  const code = await _exec(fullCommand, config);
  return new ExecResult(code);
}
