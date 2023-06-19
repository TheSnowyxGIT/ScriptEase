import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import SE_InvalidTypeConfigError from '../errors/Config/SeInvalidTypeConfigError';
import SE_UnknownKeyConfigError from '../errors/Config/SeUnknownKeyConfigError';

/**
 * The name of the config file
 */
const CONFIG_FILE_NAME = 'seconfig.json';

/**
 * The pattern for the config file
 */
type Value = {
  type: string;
  children?: Value;
};
interface Pattern {
  [key: string]: Value;
}
const PATTERN: Pattern = {
  directories: {
    type: 'array',
    children: {
      type: 'string',
    },
  },
  files: {
    type: 'array',
    children: {
      type: 'string',
    },
  },
  require: {
    type: 'array',
    children: {
      type: 'string',
    },
  },
};

export interface SEConfig {
  directories?: string[];
  files?: string[];
  require?: string[];
}

/**
 * Class for handling the config file
 */
export class Config {
  private _path: string;
  /**
   * The config object
   */
  private config: { [key: string]: any } = {};

  /**
   * The pattern for the config object
   */
  private pattern: Pattern;

  /**
   * Constructor for the Config class
   * @param {string} configPath - The path to the config file
   * @param {any} pattern - The pattern for the config file
   */
  constructor(configPath: string, pattern: Pattern) {
    this._path = path.resolve(configPath);
    this.pattern = pattern;
  }

  public get(): SEConfig {
    return this.config;
  }

  public async load() {
    if (existsSync(this._path)) {
      this.config = JSON.parse(readFileSync(this._path, 'utf-8'));
    }
    this.checkConfig();
  }

  /**
   * Method for checking the config file against the pattern
   */
  private checkConfig() {
    for (const key in this.config) {
      // Check if the key exists in the pattern
      if (!Object.prototype.hasOwnProperty.call(this.pattern, key)) {
        throw new SE_UnknownKeyConfigError(key);
      }
      this.checkValue(this.config[key], this.pattern[key], key);
    }
  }

  /**
   * Method for checking the value of a key in the config file against the pattern
   */
  private checkValue(value: object, pattern: any, prefix: string) {
    if (pattern.type === 'array') {
      if (!Array.isArray(value)) {
        throw new SE_InvalidTypeConfigError(prefix, 'array', typeof value);
      }
      for (const index in value) {
        this.checkValue(value[index], pattern.children, `${prefix}[${index}]`);
      }
    } else {
      if (typeof value !== pattern.type) {
        throw new SE_InvalidTypeConfigError(prefix, pattern.type, typeof value);
      }
      if (pattern.type === 'object') {
        for (const key of Object.keys(value)) {
          if (!Object.prototype.hasOwnProperty.call(pattern.children, key)) {
            throw new SE_UnknownKeyConfigError(prefix);
          }
          this.checkValue(value[key], pattern.children[key], `${prefix}.${key}`);
        }
      }
    }
  }
}

/**
 * Function for getting the config object
 */
export async function getSEConfig(): Promise<SEConfig> {
  const config = new Config(path.resolve(CONFIG_FILE_NAME), PATTERN);
  await config.load();
  return config.get();
}
