/**
 * Ledrix — Structured Logger.
 *
 * Production માં JSON logs (Vercel/Logflare friendly).
 * Development માં readable logs.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDev) {
      const colorMap: Record<LogLevel, string> = {
        debug: "\x1b[36m",
        info: "\x1b[32m",
        warn: "\x1b[33m",
        error: "\x1b[31m",
      };
      const reset = "\x1b[0m";
      const color = colorMap[level];

      console[level === "debug" ? "log" : level](
        `${color}[${level.toUpperCase()}]${reset} ${message}`,
        context ?? ""
      );
    } else {
      // Production: JSON for log aggregators
      console[level === "debug" ? "log" : level](JSON.stringify(payload));
    }
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  }
}

export const logger = new Logger();