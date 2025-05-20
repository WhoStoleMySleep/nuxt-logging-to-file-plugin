# Nuxt Logging to File Plugin

A Nuxt 3 module for logging `console.warn` and `console.error` messages to a server endpoint and saving them to files, no ssr.

**No SSR - ssr: false**

## Features

- Captures `console.warn` and `console.error` logs.
- Sends logs to a configurable API endpoint.
- Saves logs to files in a specified directory with locale-based date formatting.
- Supports custom API endpoints, locales, and log paths.
- ESM-compatible with TypeScript support.

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
  }
});
```

2. Trigger logs in your application:

```javascript
console.error('Test error');
console.warn('Test warning');
```

logs errors that were in the code

Logs are saved to `logs/DD.MM.YYYY.txt` (e.g., `logs/20.05.2025.txt`) with entries like:

```json
{"time":"12:27:00","type":"error","value":["Test error"]}
```

## Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiEndpoint` | string | `/api/logging` | API endpoint for logging requests. |
| `locale` | string | `ru` | Locale for timestamp formatting (e.g., `en`). |
| `logPath` | string | `./logs` | Directory to store log files. |

Example with custom configuration:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-logging-to-file-plugin'],
  logging: {
    apiEndpoint: '/custom/logging',
    locale: 'en',
    logPath: './custom_logs'
  }
});
```

## Requirements

- Node.js &gt;= 18 (ESM support required)
- Nuxt 3 &gt;= 3.17.3
- TypeScript &gt;= 5.4.5
- `"type": "module"` in `package.json`
- `moduleResolution: "nodenext"` in `tsconfig.json`

## Troubleshooting

- **Module not found**: Ensure `@nuxt/kit` and `@nuxt/schema` are installed and included in `tsconfig.json` under `types`.
- **No logs written**: Verify the `apiEndpoint` is correct and the server route is accessible. Test with:

  ```bash
  curl -X POST http://localhost:3000/api/logging -d '{"text":"{\"time\":\"12:00:00\",\"type\":\"error\",\"value\":[\"test\"]}"}}' -H "Content-Type: application/json"
  ```
- **TypeScript errors**: Use `.js` extensions for relative imports in ESM modules.

## Development

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/nuxt-logging-to-file-plugin.git
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
   ```

## License

MIT License

## Author

Naumenko Konstantin

## Repository

github.com/whostolemysleep/nuxt-logging-to-file-plugin