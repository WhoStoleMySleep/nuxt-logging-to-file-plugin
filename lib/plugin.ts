import { defineNuxtPlugin, useRuntimeConfig, NuxtApp } from '#app';
import { useSaveLogs } from './composables/useSaveLogs.js';

interface LogData {
  time: string;
  type: 'warn' | 'error';
  value: any[];
}

interface LoggingOptions {
  apiEndpoint: string;
  locale: string;
}

const createTimestamp = (locale: string): string =>
  new Date().toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

const createLogMethod = (
  type: 'warn' | 'error',
  originalMethod: (...args: any[]) => void,
  options: LoggingOptions
) => {
  return async function (...args: any[]) {
    originalMethod(...args);
    try {
      await useSaveLogs(
        {
          time: createTimestamp(options.locale),
          type,
          value: args,
        },
        options.apiEndpoint
      );
    } catch (error) {
      console.error(`Failed to save ${type} log:`, error);
    }
  };
};

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const config = nuxtApp.runWithContext(() => useRuntimeConfig());

  if (!config.public.logging) {
    throw new Error('Logging configuration is missing in runtimeConfig.public');
  }

  const options: LoggingOptions = {
    apiEndpoint: config.public.logging.apiEndpoint || '/api/logging',
    locale: config.public.logging.locale || 'ru',
  };

  if (!options.apiEndpoint.startsWith('/')) {
    throw new Error('apiEndpoint must start with a forward slash');
  }

  const defaultWarn = console.warn.bind(console);
  const defaultError = console.error.bind(console);

  console.warn = createLogMethod('warn', defaultWarn, options);
  console.error = createLogMethod('error', defaultError, options);

  return {
    provide: {
      logging: {
        options,
        log: async (data: LogData) => {
          try {
            await useSaveLogs(data, options.apiEndpoint);
          } catch (error) {
            console.error('Failed to save custom log:', error);
          }
        },
      },
    },
  };
});