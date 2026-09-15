import { Logger, logger } from '../logger.js';

describe('Logger Utility', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should export a default singleton logger instance', () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  describe('Log Levels and Filtering', () => {
    it('should log all levels when level is debug', () => {
      const customLogger = new Logger({ level: 'debug' });

      customLogger.debug('debug msg');
      customLogger.info('info msg');
      customLogger.warn('warn msg');
      customLogger.error('error msg');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should filter out debug logs when level is info', () => {
      const customLogger = new Logger({ level: 'info' });

      customLogger.debug('debug msg');
      customLogger.info('info msg');
      customLogger.warn('warn msg');
      customLogger.error('error msg');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should filter out debug and info logs when level is warn', () => {
      const customLogger = new Logger({ level: 'warn' });

      customLogger.debug('debug msg');
      customLogger.info('info msg');
      customLogger.warn('warn msg');
      customLogger.error('error msg');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should only log errors when level is error', () => {
      const customLogger = new Logger({ level: 'error' });

      customLogger.debug('debug msg');
      customLogger.info('info msg');
      customLogger.warn('warn msg');
      customLogger.error('error msg');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should not log anything when level is silent', () => {
      const customLogger = new Logger({ level: 'silent' });

      customLogger.debug('debug msg');
      customLogger.info('info msg');
      customLogger.warn('warn msg');
      customLogger.error('error msg');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should allow dynamically updating log level', () => {
      const customLogger = new Logger({ level: 'error' });
      expect(customLogger.getLevel()).toBe('error');

      customLogger.info('should not log');
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      customLogger.setLevel('info');
      expect(customLogger.getLevel()).toBe('info');

      customLogger.info('should log now');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Formatting and Arguments', () => {
    it('should format message with timestamp and level prefix', () => {
      const customLogger = new Logger({ level: 'debug' });
      customLogger.info('Hello world');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T.*\] \[INFO\] Hello world$/)
      );
    });

    it('should pass additional metadata and arguments along with formatted message', () => {
      const customLogger = new Logger({ level: 'debug' });
      const meta = { userId: '123', action: 'test' };
      const err = new Error('Something broke');

      customLogger.error('Operation failed', err, meta);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T.*\] \[ERROR\] Operation failed$/),
        err,
        meta
      );
    });
  });
});
