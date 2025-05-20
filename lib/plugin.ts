import { defineNuxtPlugin, useRuntimeConfig, NuxtApp } from '#app'; // Add NuxtApp import
import { useSaveLogs } from './composables/useSaveLogs.js';

export default defineNuxtPlugin((nuxtApp: NuxtApp) => { // Type nuxtApp
  const config = nuxtApp.runWithContext(() => useRuntimeConfig());
  const options = {
    apiEndpoint: config.public.logging?.apiEndpoint || '/api/logging',
    locale: config.public.logging?.locale || 'ru'
  };

  const defaultWarn = console.warn.bind(console);
  const defaultError = console.error.bind(console);

  console.warn = function (...args: any[]) {
    defaultWarn.apply(console, args);
    useSaveLogs(
      {
        time: new Date().toLocaleTimeString(options.locale, {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        }),
        type: 'warn',
        value: args
      },
      options.apiEndpoint
    );
  };

  console.error = function (...args: any[]) {
    defaultError.apply(console, args);
    useSaveLogs(
      {
        time: new Date().toLocaleTimeString(options.locale, {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        }),
        type: 'error',
        value: args
      },
      options.apiEndpoint
    );
  };
});