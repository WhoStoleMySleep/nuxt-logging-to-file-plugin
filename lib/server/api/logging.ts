import { defineEventHandler, readBody } from 'h3';
import { mkdir, appendFile } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  let text;
  try {
    const body = await readBody(event);
    text = body?.text;
    if (!text) {
      console.warn('Missing text in request body:', body);
      return { error: 'Text is required' };
    }

    let logData;
    try {
      logData = JSON.parse(text);
    } catch (parseError) {
      console.error('Invalid JSON in log text:', text, parseError);
      return { error: 'Invalid JSON in log text', details: parseError instanceof Error ? parseError.message : 'Unknown parse error' };
    }

    const logPath = process.env.NUXT_PUBLIC_LOGGING_LOG_PATH || './logs';
    const locale = process.env.NUXT_PUBLIC_LOGGING_LOCALE || 'ru';
    const date = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'numeric', year: 'numeric' });
    const logFile = join(logPath, `${date}.txt`);

    await mkdir(logPath, { recursive: true });
    await appendFile(logFile, `${text}\n`);
    return { path: logFile, result: text };
  } catch (error) {
    console.error('Logging error:', error, 'Input text:', text);
    return { error: 'Failed to write log', details: error instanceof Error ? error.message : 'Unknown error' };
  }
});