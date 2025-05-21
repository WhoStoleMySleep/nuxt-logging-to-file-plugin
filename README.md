# Nuxt Logging to File Plugin

A Nuxt 3 module for logging `console.warn`, `console.error`, and HTTP request errors to a server endpoint and saving them to files. Designed for client-side use (no SSR).

**Note: SSR is not supported (`ssr: false` required).**

## Features

- Captures `console.warn` and `console.error` logs.
- Tracks HTTP request errors (e.g., 404, 500, network failures) via `fetch`.
- Sends logs to a configurable API endpoint.
- Saves logs to files in a specified directory with locale-based date formatting.
- Supports custom API endpoints, locales, and log paths.
- ESM-compatible with TypeScript support.
- Lightweight and optimized for minimal bundle size (~8.25 kB unpacked).

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
  ssr: false
});
```

2. Trigger logs in your application:

```javascript
// Console logs
console.error('Test error');
console.warn('Test warning');

// HTTP request error (e.g., failed API call)
fetch('https://example.com/nonexistent').catch(() => {});
```

Logs are saved to `logs/DD.MM.YYYY.txt` (e.g., `logs/20.05.2025.txt`) with entries like:

```json
{"time":"12:27:00","type":"error","value":["Test error"]}
{"time":"12:27:00","type":"http_error","value":[{"url":"https://example.com/nonexistent","method":"GET","status":404,"statusText":"Not Found","error":"Not found"}]}
```

### HTTP Error Tracking
The module automatically logs HTTP request errors for all `fetch` calls, including:
- Non-2xx status codes (e.g., 404, 500).
- Network errors (e.g., connection failures).

Example HTTP error log:
```json
{"time":"12:27:00","type":"http_error","value":[{"url":"https://example.com/api/nonexistent","method":"POST","status":404,"statusText":"Not Found","error":"Not found"}]}
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
  ssr: false
});
```

## Requirements

- Node.js >= 18 (ESM support required)
- Nuxt 3 >= 3.17.3
- TypeScript >= 5.4.5
- `"type": "module"` in `package.json`
- `moduleResolution: "nodenext"` in `tsconfig.json`

## Troubleshooting

- **Module not found**: Ensure `@nuxt/kit`, `@nuxt/schema`, and `h3` are installed as peer dependencies and included in `tsconfig.json` under `types`:
  ```json
  "types": ["@nuxt/kit", "@nuxt/schema", "@types/node"]
  ```

- **No logs written**: Verify the `apiEndpoint` is correct and the server route (`/api/logging`) is accessible. Test with:
  ```bash
  curl -X POST http://localhost:3000/api/logging -d '{"text":"{\"time\":\"12:00:00\",\"type\":\"error\",\"value\":[\"test\"]}"}}' -H "Content-Type: application/json"
  ```

- **Recursive HTTP error logs**: Ensure `lib/plugin.ts` skips logging for the `apiEndpoint` URL. Check for errors like `"\"[object Object]\" is not valid JSON"` in `/api/logging` responses.

- **TypeScript errors**: Use `.js` extensions for relative imports in ESM modules (e.g., `import { useSaveLogs } from './composables/useSaveLogs.js'`).

- **Build issues**: If only some `.js` files are generated, run:
  ```bash
  npm run build:js:tsc
  ls dist
  ```
  Check `esbuild` logs with `--log-level=debug`.

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

5. Test HTTP error logging:
   ```vue
   <template>
     <button @click="triggerHttpError">Trigger HTTP Error</button>
   </template>
   <script setup>
   const triggerHttpError = async () => {
     try {
       await fetch('https://jsonplaceholder.typicode.com/nonexistent');
     } catch (error) {
       console.log('HTTP error:', error);
     }
   };
   </script>
   ```

## Future Scope
- **Server-Side Rendering (SSR) Support**: Add compatibility with SSR for Nitro server routes, addressing current client-only limitations.
- **Log Format Customization**: Support configurable log formats (e.g., JSON, CSV, plain text) and log rotation policies.
- **External Log Aggregation**: Integrate with services like Elasticsearch or Logstash for centralized log management.
- **Batch Logging**: Implement batch processing to reduce API calls and improve performance in high-traffic applications.

## License

MIT License

## Author

Naumenko Konstantin

## Repository

[https://github.com/WhoStoleMySleep/nuxt-logging-to-file-plugin](https://github.com/WhoStoleMySleep/nuxt-logging-to-file-plugin)