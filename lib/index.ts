import { defineNuxtModule, addPlugin, createResolver, addServerHandler } from '@nuxt/kit';

export interface ModuleOptions {
  apiEndpoint?: string;
  locale?: string;
  logPath?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-logging-to-file-plugin',
    configKey: 'logging',
  },
  defaults: {
    apiEndpoint: '/api/logging',
    locale: 'ru',
    logPath: './logs',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Initialize runtimeConfig.public if undefined
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};

    // Safely merge logging options into runtimeConfig.public
    nuxt.options.runtimeConfig.public.logging = {
      ...(typeof nuxt.options.runtimeConfig.public.logging === 'object' && nuxt.options.runtimeConfig.public.logging !== null
        ? nuxt.options.runtimeConfig.public.logging
        : {}),
      apiEndpoint: options.apiEndpoint || '/api/logging',
      locale: options.locale || 'ru',
      logPath: options.logPath || './logs',
    };

    // Debug logging to verify config
    console.log('Module setup - runtimeConfig.public.logging:', nuxt.options.runtimeConfig.public.logging);

    // Register the plugin for client-side logic
    addPlugin(resolver.resolve('./plugin'));

    // Register the server API route for logging
    addServerHandler({
      route: options.apiEndpoint,
      handler: resolver.resolve('./server/api/logging'),
    });

    // Add server middleware for capturing Nitro server errors (SSR support)
    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./server/middleware/logErrors'),
    });
  },
});