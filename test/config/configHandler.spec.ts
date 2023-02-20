import * as chai from 'chai';
import * as path from 'path';
import {Config} from '../../src/config/ConfigHandler';
import SE_InvalidTypeConfigError from '../../src/errors/Config/SeInvalidTypeConfigError';
import SE_UnknownKeyConfigError from '../../src/errors/Config/SeUnknownKeyConfigError';
import * as chaiAsPromised from 'chai-as-promised';
 
chai.use(chaiAsPromised);

describe('Config', () => {
    let configPath: string;
    let pattern: any;
	const samplesDir = 'test/data/configExamples/';

    beforeEach(() => {
        pattern = {
            key1: { type: 'string' },
            key2: { type: 'number' },
            key3: {
                type: 'object',
                children: {
                    subkey1: { type: 'boolean' },
                    subkey2: { type: 'string' }
                }
            }
        }
    });

    it('should throw an error if a key in the config is unknown', async () => {
        configPath = path.join(samplesDir, 'invalid-config.json');
        const config = new Config(configPath, pattern);
        await chai.expect(config.load()).to.be.rejected;
    });

    it('should throw an error if a value in the config is of the wrong type', async () => {
        configPath = path.join(samplesDir, 'invalid-type-config.json');
        const config = new Config(configPath, pattern);
       await chai.expect(config.load()).to.be.rejected;
    });

    it('should throw an error if a subkey in the config is unknown', async () => {
        configPath = path.join(samplesDir, 'invalid-subkey-config.json');
        const config = new Config(configPath, pattern);
        await chai.expect(config.load()).to.rejected;
    });

    it('should not throw an error if config is valid', async () => {
        configPath = path.join(samplesDir, 'valid-config.json');
        const config = new Config(configPath, pattern);
        await chai.expect(config.load()).to.be.not.rejected;
    });

	it('should throw an error if a value in a subkey is of the wrong type', async () => {
        configPath = path.join(samplesDir, 'invalid-subkey-type-config.json');
        const config = new Config(configPath, pattern);
		await chai.expect(config.load()).to.be.rejected;
	});

    it('should throw an error if a value in an array is of the wrong type', async () => {
        pattern = {
            key1: { type: 'string' },
            key2: { type: 'number' },
            key3: {
                type: 'array',
                children: {
                    type: 'number' 
                }
            }
        }
        configPath = path.join(samplesDir, 'invalid-array-config.json');
        const config = new Config(configPath, pattern);
       await chai.expect(config.load()).to.be.rejected;
    });

    it('should not throw an error if array is valid', async () => {
        pattern = {
            key1: { type: 'string' },
            key2: { type: 'number' },
            key3: {
                type: 'array',
                children: {
                    type: 'number' 
                }
            }
        }
        configPath = path.join(samplesDir, 'valid-array-config.json');
        const config = new Config(configPath, pattern);
        await chai.expect(config.load()).to.be.not.rejected;
    });

    it('should throw an error if an object in an array is of the wrong type', async () => {
        pattern = {
            key1: { type: 'string' },
            key2: { type: 'number' },
            key3: {
                type: 'array',
                children: {
                    type: 'object',
                    children: {
                        subkey1: { type: 'number' },
                        subkey2: { type: 'string' }
                    }
                }
            }
        }
        configPath = path.join(samplesDir, 'invalid-array-of-objects-config.json');
        const config = new Config(configPath, pattern);
       await chai.expect(config.load()).to.be.rejected;
    });
    
    it('should not throw an error if array of objects is valid', async () => {
        pattern = {
            key1: { type: 'string' },
            key2: { type: 'number' },
            key3: {
                type: 'array',
                children: {
                    type: 'object',
                    children: {
                        subkey1: { type: 'number' },
                        subkey2: { type: 'string' }
                    }
                }
            }
        }
        configPath = path.join(samplesDir, 'valid-array-of-objects-config.json');
        const config = new Config(configPath, pattern);
        await chai.expect(config.load()).to.be.not.rejected;
    });
	
});
