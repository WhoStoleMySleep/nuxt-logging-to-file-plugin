import { defineNuxtPlugin, useRuntimeConfig, NuxtApp } from '#app';
import { useSaveLogs } from './composables/useSaveLogs.js';

interface LogData {
  time: string;
  type: 'warn' | 'error' | 'http_error';
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
  const defaultFetch = globalThis.fetch.bind(globalThis);

  console.warn = createLogMethod('warn', defaultWarn, options);
  console.error = createLogMethod('error', defaultError, options);

  globalThis.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : args[0].url || 'unknown';
    const method = args[1]?.method || 'GET';

    // Skip logging for requests to the logging endpoint to prevent recursion
    const normalizedUrl = url.replace(/^https?:\/\/[^/]+/, '');
    if (normalizedUrl.startsWith(options.apiEndpoint)) {
      return defaultFetch(...args);
    }

    try {
      const response = await defaultFetch(...args);
      if (!response.ok) {
        const errorData = {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          error: await response.text().catch(() => 'No response body'),
        };
        console.log('Logging http_error:', errorData); // Debug
        await useSaveLogs(
          {
            time: createTimestamp(options.locale),
            type: 'http_error',
            value: [errorData],
          },
          options.apiEndpoint
        );
      }
      return response;
    } catch (error) {
      const errorData = {
        url,
        method,
        error: error instanceof Error ? error.message : 'Unknown network error',
      };
      console.log('Logging network error:', errorData); // Debug
      await useSaveLogs(
        {
          time: createTimestamp(options.locale),
          type: 'http_error',
          value: [errorData],
        },
        options.apiEndpoint
      );
      throw error;
    }
  };

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