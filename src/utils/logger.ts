/* eslint-disable no-console */
/**
 * Application Logger Utility
 * Provides structured, leveled logging for info, warn, error, and debug.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export interface LoggerOptions {
  level?: LogLevel;
}

export class Logger {
  private level: LogLevel;

  constructor(options: LoggerOptions = {}) {
    if (options.level) {
      this.level = options.level;
    } else if (process.env.LOG_LEVEL) {
      const envLevel = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
      this.level = LOG_LEVEL_PRIORITY[envLevel] !== undefined ? envLevel : 'info';
    } else if (process.env.NODE_ENV === 'test') {
      this.level = 'error';
    } else if (process.env.NODE_ENV === 'production') {
      this.level = 'info';
    } else {
      this.level = 'debug';
    }
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public getLevel(): LogLevel {
    return this.level;
  }

  private shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[targetLevel] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string): string {
    return `[${this.formatTimestamp()}] [${level.toUpperCase()}] ${message}`;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    if (args.length > 0) {
      console.debug(this.formatMessage('debug', message), ...args);
    } else {
      console.debug(this.formatMessage('debug', message));
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    if (args.length > 0) {
      console.info(this.formatMessage('info', message), ...args);
    } else {
      console.info(this.formatMessage('info', message));
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    if (args.length > 0) {
      console.warn(this.formatMessage('warn', message), ...args);
    } else {
      console.warn(this.formatMessage('warn', message));
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    if (args.length > 0) {
      console.error(this.formatMessage('error', message), ...args);
    } else {
      console.error(this.formatMessage('error', message));
    }
  }
}

// Export singleton logger instance for application-wide use
export const logger = new Logger();
