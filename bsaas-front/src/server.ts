import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'zone.js/node';
import bootstrap from './main.server';

// Server configuration
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

// Create Express server
const app = express();

// Set up view engine
app.set('view engine', 'html');
app.set('views', browserDistFolder);

// Create CommonEngine for server-side rendering
const engine = new CommonEngine({
  enablePerformanceProfiler: false,
  bootstrap,
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    // Provide empty objects for REQUEST and RESPONSE tokens
    { provide: 'REQUEST', useValue: {} },
    { provide: 'RESPONSE', useValue: {} },
    // Mock browser APIs that might be accessed during SSR
    { provide: 'WINDOW', useValue: globalThis },
    { provide: 'DOCUMENT', useValue: { body: {}, addEventListener: () => {}, removeEventListener: () => {} } },
    { provide: 'LOCAL_STORAGE', useValue: {} },
    { provide: 'SESSION_STORAGE', useValue: {} },
    // Ensure we're in server mode for route extraction
    { provide: 'ROUTE_EXTRACTION', useValue: true },
    { provide: 'SSR', useValue: true },
    { provide: 'BROWSER', useValue: false },
    // Add platform location for server-side rendering
    { provide: 'PLATFORM_ID', useValue: 'server' },
    // Mock for Dd provider (DataDog or similar analytics/monitoring service)
    { 
      provide: 'Dd', 
      useValue: {
        // Mock methods that might be called during SSR
        setUser: () => {},
        track: () => {},
        pageView: () => {},
        error: (error: Error) => console.error('Analytics error:', error),
        // Add other methods as needed based on actual usage
      } as const
    },
    // Add error handler to prevent uncaught promise rejections
    { provide: 'ERROR_HANDLER', useValue: (error: any) => console.error('SSR Error:', error) },
  ],
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
// Serve static files with cache control
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
    setHeaders: (res, path) => {
      if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.woff2') || path.endsWith('.woff') || path.endsWith('.ttf')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
// Handle all requests with the Angular application
app.get('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;
  const fullUrl = `${protocol}://${headers.host}${originalUrl}`;

  console.log(`Rendering URL: ${fullUrl}`);

  const startTime = Date.now();

  engine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: fullUrl,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: 'REQUEST', useValue: req },
        { provide: 'RESPONSE', useValue: res },
        {
          provide: 'Dd',
          useValue: {
            setUser: () => {},
            track: () => {},
            pageView: () => {},
            error: (error: Error) => console.error('Analytics error:', error),
          } as const
        },
      ],
    })
    .then((html) => {
      console.log(`Rendered ${fullUrl} in ${Date.now() - startTime}ms`);
      res.send(html);
    })
    .catch((err) => {
      console.error('Error during server-side rendering:', err);
      next(err);
    });
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
const isMainModule = (module: any) => {
  return import.meta.url === `file://${process.argv[1]}`;
};

if (isMainModule(import.meta)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
