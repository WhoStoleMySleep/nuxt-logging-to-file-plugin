# Nuxt Logging to File Plugin

A Nuxt 3 module for logging `console.warn`, `console.error`, HTTP request errors, and server-side errors to a server endpoint and saving them to files. Supports both client-side and Server-Side Rendering (SSR) modes.

## Features

- Captures `console.warn` and `console.error` logs on the client.
- Tracks HTTP request errors (e.g., 404, 500, network failures) via `fetch` on the client.
- Logs server-side errors in SSR mode via Nitro middleware.
- Sends logs to a configurable API endpoint and saves them to files in a specified directory.
- Supports locale-based date formatting for log files (e.g., `logs/20.05.2025.txt`).
- Configurable API endpoint, locale, and log path.
- ESM-compatible with TypeScript support.
- Lightweight and optimized for minimal bundle size (~3-5 kB for `.js` files).

## Installation

Install the module via npm:

```bash
npm install nuxt-logging-to-file-plugin
```

## Usage

1. Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-logging-to-file-plugin'],
  logging: {
    apiEndpoint: '/api/logging',
    locale: 'ru',
    logPath: './logs'
  },
  ssr: true // or false, depending on your needs
});
```

2. Trigger logs in your application:

```javascript
// Console logs (client-side)
console.error('Test error');
console.warn('Test warning');

// HTTP request error (client-side)
fetch('https://example.com/nonexistent').catch(() => {});

// Server-side error (SSR mode)
throw new Error('Test server error'); // In a server route
```

Logs are saved to `logs/DD.MM.YYYY.txt` (e.g., `logs/20.05.2025.txt`) with entries like:

```json
{"time":"12:27:00","type":"error","value":["Test error"]}
{"time":"12:27:00","type":"http_error","value":[{"url":"https://example.com/nonexistent","method":"GET","status":404,"statusText":"Not Found","error":"Not found"}]}
{"time":"12:27:00","type":"server_error","value":[{"url":"/api/test","method":"GET","error":"Test server error"}]}
```

### HTTP Error Tracking
The module automatically logs HTTP request errors for all `fetch` calls on the client, including:
- Non-2xx status codes (e.g., 404, 500).
- Network errors (e.g., connection failures).

Example HTTP error log:
```json
{"time":"12:27:00","type":"http_error","value":[{"url":"https://example.com/api/nonexistent","method":"POST","status":404,"statusText":"Not Found","error":"Not found"}]}
```

### Server Error Tracking (SSR)
In SSR mode (`ssr: true`), the module captures server-side errors via Nitro middleware, logging details like URL, method, and error message.

Example server error log:
```json
{"time":"12:27:00","type":"server_error","value":[{"url":"/api/test","method":"GET","error":"Test server error"}]}
```

## Configuration Options

| Option        | Type   | Default       | Description                                      |
|---------------|--------|---------------|--------------------------------------------------|
| `apiEndpoint` | string | `/api/logging`| API endpoint for logging requests.               |
| `locale`      | string | `ru`          | Locale for timestamp formatting (e.g., `en`).    |
| `logPath`     | string | `./logs`      | Directory to store log files.                    |

Example with custom configuration:
```typescript
export default defineNuxtConfig({
  modules: ['nuxt-logging-to-file-plugin'],
  logging: {
    apiEndpoint: '/custom/logging',
    locale: 'en',
    logPath: './custom_logs'
  },
  ssr: true
});
```

## Requirements

- Node.js >= 18 (ESM support required)
- Nuxt 3 >= 3.17.3
- TypeScript >= 5.6.2
- `"type": "module"` in `package.json`
- `moduleResolution: "nodenext"` in `tsconfig.json`
- Peer dependencies: `@nuxt/kit@^3.17.3`, `@nuxt/schema@^3.17.3`, `h3@^1.12.0`

## Troubleshooting

- **Build errors (e.g., TypeScript issues)**:
    - Ensure `tsconfig.json` includes:
      ```json
      "types": ["@nuxt/kit", "@nuxt/schema", "@types/node"]
      ```
    - Run `npm install` to verify dependencies.
    - Check build logs:
      ```bash
      npm run build:js:tsc
      ls dist
      ```

- **Runtime error: "Cannot read properties of undefined (reading 'logging')"**:
    - Verify `nuxt.config.ts` includes the `logging` key.
    - Check console output for debug logs:
      ```bash
      pnpm dev
      ```
      Look for `Module setup - runtimeConfig.public.logging` and `Plugin - config.public`.
    - Clear Nuxt cache:
      ```bash
      rm -rf /path/to/test-project/.nuxt
      pnpm dev
      ```

- **No logs written**:
    - Test the API endpoint:
      ```bash
      curl -X POST http://localhost:3000/api/logging -d '{"text":"{\"time\":\"12:00:00\",\"type\":\"error\",\"value\":[\"test\"]}"}}' -H "Content-Type: application/json"
      ```
    - Ensure `logPath` is writable and `apiEndpoint` is correct.

- **Recursive HTTP error logs**:
    - Verify `lib/plugin.ts` skips logging for `apiEndpoint` requests to prevent recursion.
    - Check server logs for JSON parsing errors.

- **Missing server error logs in SSR**:
    - Ensure `lib/server/middleware/logErrors.ts` is included in the build:
      ```bash
      ls dist/server/middleware
      ```

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/WhoStoleMySleep/nuxt-logging-to-file-plugin.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the module:
   ```bash
   npm run build
   ```

4. Test locally in a Nuxt 3 project:
   ```bash
   npm link
   cd /path/to/test-project
   npm link nuxt-logging-to-file-plugin
   pnpm dev
   ```

5. Test logging functionality:
   ```vue
   <template>
     <div>
       <button @click="triggerError">Trigger Console Error</button>
       <button @click="triggerHttpError">Trigger HTTP Error</button>
       <button @click="triggerServerError">Trigger Server Error</button>
     </div>
   </template>
   <script setup>
   const triggerError = () => {
     console.error('Test error');
   };

   const triggerHttpError = async () => {
     try {
       await fetch('https://jsonplaceholder.typicode.com/nonexistent');
     } catch (error) {
       console.log('HTTP error:', error);
     }
   };

   const triggerServerError = async () => {
     try {
       await fetch('/api/test');
     } catch (error) {
       console.log('Server error:', error);
     }
   };
   </script>
   ```

   Add a test server route (`server/api/test.ts`):
   ```typescript
   import { defineEventHandler } from 'h3';

   export default defineEventHandler(() => {
     throw new Error('Test server error');
   });
   ```

## Future Scope
- **Log Format Customization**: Support configurable log formats (e.g., JSON, CSV, plain text) and log rotation policies.
- **External Log Aggregation**: Integrate with services like Elasticsearch or Logstash for centralized log management.
- **Batch Logging**: Implement batch processing to reduce API calls in high-traffic applications.

## License

MIT License

## Author

Naumenko Konstantin

## Repository

[https://github.com/WhoStoleMySleep/nuxt-logging-to-file-plugin](https://github.com/WhoStoleMySleep/nuxt-logging-to-file-plugin)