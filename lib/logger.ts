type LogContext = Record<string, unknown>;

const REDACT_KEYS = ['authorization', 'token', 'secret', 'signature'];

const sanitizeContext = (context?: LogContext): LogContext | undefined => {
  if (!context) return undefined;

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (REDACT_KEYS.some((redactKey) => key.toLowerCase().includes(redactKey))) {
        return [key, '[redacted]'];
      }
      return [key, value];
    })
  );
};

export const logInfo = (message: string, context?: LogContext) => {
  if (context) {
    console.info(message, sanitizeContext(context));
    return;
  }
  console.info(message);
};

export const logWarn = (message: string, context?: LogContext) => {
  if (context) {
    console.warn(message, sanitizeContext(context));
    return;
  }
  console.warn(message);
};

export const logError = (message: string, context?: LogContext) => {
  if (context) {
    console.error(message, sanitizeContext(context));
    return;
  }
  console.error(message);
};
