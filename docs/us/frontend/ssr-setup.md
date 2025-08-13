# Server-Side Rendering (SSR) Setup

## Overview
This document explains how to enable and use Server-Side Rendering (SSR) in the Beauty SaaS frontend application.

## Current Status
- SSR is pre-configured but disabled by default
- The application currently runs in client-side rendering (CSR) mode
- All necessary SSR files and configurations are in place

## Enabling SSR

### 1. Add Build Scripts
Add these scripts to `package.json` in the project root:

```json
"scripts": {
  "dev:ssr": "nx serve-ssr bsaas-front",
  "serve:ssr": "node dist/apps/bsaas-front/server/server.mjs",
  "build:ssr": "nx build bsaas-front && nx build bsaas-front --configuration=production && nx server bsaas-front --configuration=production",
  "prerender": "nx prerender bsaas-front"
}
```

### 2. Build and Serve with SSR

#### Development Mode
```bash
npm run dev:ssr
```

#### Production Build
```bash
# Build the application with SSR
npm run build:ssr

# Start the SSR server
npm run serve:ssr
```

### 3. Prerendering (Optional)
For better performance, you can pre-render specific routes:
```bash
npm run prerender
```

## Key Files
- `apps/bsaas-front/src/main.server.ts` - Server entry point
- `apps/bsaas-front/src/app/app.config.server.ts` - Server configuration
- `apps/bsaas-front/tsconfig.server.json` - TypeScript config for server
- `apps/bsaas-front/server.ts` - Express server implementation

## Notes
- SSR requires Node.js server environment
- Ensure all browser-specific APIs are properly guarded
- Test thoroughly after enabling SSR as some client-side code may need adjustments
