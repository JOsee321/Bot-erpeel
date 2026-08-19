/**
 * Simple Human-Readable Console Logger
 */
export const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg, err = '') => {
    if (err && err.message) {
      console.error(`[ERROR] ${msg}: ${err.message}`);
    } else if (err) {
      console.error(`[ERROR] ${msg}`, err);
    } else {
      console.error(`[ERROR] ${msg}`);
    }
  },
  cmd: (cmdName, from, chatType) => console.log(`[CMD] ${cmdName} dari ${from} (${chatType})`),
  cron: (msg) => console.log(`[CRON] ${msg}`),
};

export default logger;
