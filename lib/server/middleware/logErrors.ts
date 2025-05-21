import { defineEventHandler } from 'h3';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  try {
    event.node.res.on('error', async (error) => {
      const url = event.node.req.url || 'unknown';
      const logPath = process.env.NUXT_PUBLIC_LOGGING_LOG_PATH || './logs';
      const locale = process.env.NUXT_PUBLIC_LOGGING_LOCALE || 'ru';
      const date = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'numeric', year: 'numeric' });
      const logFile = join(logPath, `${date}.txt`);

      const logData = {
        time: new Date().toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' }),
        type: 'server_error',
        value: [{
          url,
          method: event.method,
          error: error.message || 'Unknown server error',
        }],
      };

      try {
        await mkdir(logPath, { recursive: true });
        await appendFile(logFile, `${JSON.stringify(logData)}\n`);
      } catch (writeError) {
        console.error('Failed to write server error log:', writeError);
      }
    });
  } catch (error) {
    console.error('Error setting up server error logging:', error);
  }
});