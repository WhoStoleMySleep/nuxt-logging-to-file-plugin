# Nuxt Logging Module

A Nuxt 3 module for logging console warnings and errors to a server and saving them to files.

## Installation

```bash
npm install nuxt-logging-plugin
```

## Usage

1. Add the module to your nuxt.config.ts:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-logging-plugin'],
  logging: {
    apiEndpoint: '/api/logging', // Optional: default is /api/logging
    locale: 'en', // Optional: default is 'ru'
    logPath: './logs', // Optional: default is ./logs
  },
});
```

2. The module automatically sets up:
   * A plugin to intercept console.warn and console.error.
   * A server route to save logs to files.

## Configuration Options
   * **apiEndpoint**: The API endpoint for logging (default: **/api/logging**).
   * **locale**: The locale for formatting timestamps (default: **ru**).
   * **logPath**: The directory to store log files (default: **./logs**).

## Log File Storage
Logs are saved in the specified **logPath** directory with filenames in the format **DD.MM.YYYY.txt** (based on the locale).

## Example 

```ts
console.error('Something went wrong!');
// This will log to the server and save to logs/DD.MM.YYYY.txt
```