import * as fs from 'fs/promises';
import path from 'path';
import { defineEventHandler, readBody } from 'h3';
export default defineEventHandler(async (event) => {
    const { text } = JSON.parse(await readBody(event));
    const logPath = process.env.NUXT_PUBLIC_LOGGING_LOG_PATH || './logs';
    const locale = process.env.NUXT_PUBLIC_LOGGING_LOCALE || 'ru';
    const project = path.resolve();
    const thisDate = new Date().toLocaleDateString(locale, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
    if (!text) {
        return { error: 'Text is required' };
    }
    try {
        const logDir = `${project}/${logPath}`;
        await fs.stat(logDir).catch(async () => {
            await fs.mkdir(logDir, { recursive: true });
        });
        const logFile = `${logDir}/${thisDate}.txt`;
        await fs.appendFile(logFile, `${text}\n`);
        return { path: logFile, result: text };
    }
    catch (error) {
        console.error('Logging error:', error);
        return { error: 'Failed to write log' };
    }
});
