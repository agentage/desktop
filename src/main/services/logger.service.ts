import { appendFile, mkdir } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.agentage');
const LOGS_DIR = join(CONFIG_DIR, 'logs');
const CHAT_LOGS_DIR = join(LOGS_DIR, 'chat');
const ERROR_LOGS_DIR = join(LOGS_DIR, 'errors');

const DEBUG_LOG = join(LOGS_DIR, 'debug.log');

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Initialize log directories
 */
export const initLogger = async (): Promise<void> => {
  await mkdir(LOGS_DIR, { recursive: true });
  await mkdir(CHAT_LOGS_DIR, { recursive: true });
  await mkdir(ERROR_LOGS_DIR, { recursive: true });
};

/**
 * Format log entry
 */
const formatLog = (level: LogLevel, message: string, meta?: unknown): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
};

/**
 * Write to log file
 */
const writeLog = async (filePath: string, entry: string): Promise<void> => {
  try {
    await appendFile(filePath, entry, 'utf-8');
  } catch {
    // Ignore errors (file system issues, permissions)
  }
};

/**
 * Get daily chat log file path
 */
const getChatLogPath = (): string => {
  const date = new Date().toISOString().split('T')[0];
  return join(CHAT_LOGS_DIR, `${date}.log`);
};

/**
 * Get daily error log file path
 */
const getErrorLogPath = (): string => {
  const date = new Date().toISOString().split('T')[0];
  return join(ERROR_LOGS_DIR, `${date}.log`);
};

/**
 * Log debug message
 */
export const logDebug = async (message: string, meta?: unknown): Promise<void> => {
  const entry = formatLog(LogLevel.DEBUG, message, meta);
  await writeLog(DEBUG_LOG, entry);
  console.debug(message, meta);
};

/**
 * Log info message
 */
export const logInfo = async (message: string, meta?: unknown): Promise<void> => {
  const entry = formatLog(LogLevel.INFO, message, meta);
  await writeLog(DEBUG_LOG, entry);
  console.info(message, meta);
};

/**
 * Log warning
 */
export const logWarn = async (message: string, meta?: unknown): Promise<void> => {
  const entry = formatLog(LogLevel.WARN, message, meta);
  await writeLog(DEBUG_LOG, entry);
  console.warn(message, meta);
};

/**
 * Log error
 */
export const logError = async (message: string, error?: unknown): Promise<void> => {
  const entry = formatLog(LogLevel.ERROR, message, error);
  await writeLog(DEBUG_LOG, entry);
  await writeLog(getErrorLogPath(), entry);
  console.error(message, error);
};

/**
 * Log chat event (for debugging conversations)
 */
export const logChatEvent = async (
  conversationId: string,
  requestId: string,
  event: string,
  meta?: unknown
): Promise<void> => {
  const message = `[${conversationId}] [${requestId}] ${event}`;
  const entry = formatLog(LogLevel.INFO, message, meta);
  await writeLog(getChatLogPath(), entry);
};
