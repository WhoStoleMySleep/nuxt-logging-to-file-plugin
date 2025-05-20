import { defineNuxtModule, addPlugin, createResolver, addServerHandler } from '@nuxt/kit';

export interface ModuleOptions {
  apiEndpoint: string;
  locale: string;
  logPath: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-logging',
    configKey: 'logging'
  },
  defaults: {
    apiEndpoint: '/api/logging',
    locale: 'ru',
    logPath: './logs'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Register plugin
    addPlugin(resolver.resolve('./plugin.js'));

    // Register server handler
    addServerHandler({
      route: options.apiEndpoint,
      handler: resolver.resolve('./server/api/logging.js')
    });

    // Set runtimeConfig for client-side
    nuxt.options.runtimeConfig.public.logging = {
      ...options,
      apiEndpoint: options.apiEndpoint,
      locale: options.locale,
      logPath: options.logPath
    };

    // Set environment variables for server-side
    process.env.NUXT_PUBLIC_LOGGING_LOG_PATH = options.logPath;
    process.env.NUXT_PUBLIC_LOGGING_LOCALE = options.locale;
  }
});