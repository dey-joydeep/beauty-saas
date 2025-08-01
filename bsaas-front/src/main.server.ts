import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config as serverConfig } from './app/app.config.server';
import { MaterialSsrHandler, materialSsrHandlerFactory } from './app/core/ssr';
import { PLATFORM_ID, ApplicationRef, APP_INITIALIZER, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

// Platform server for server-side rendering
const bootstrap = async (): Promise<ApplicationRef> => {
  try {
    const platformId = 'server';
    
    // Create a new config with SSR providers
    const ssrConfig = {
      ...serverConfig,
      providers: [
        ...(serverConfig.providers || []),
        {
          provide: MaterialSsrHandler,
          useFactory: () => materialSsrHandlerFactory(platformId),
        },
        {
          provide: APP_INITIALIZER,
          useFactory: (handler: MaterialSsrHandler) => {
            return () => {
              // Initialize Material SSR in the DI context
              handler.initialize();
              
              // Any additional server-side initialization
              if (isPlatformServer(platformId)) {
                // Server-specific initialization
              }
            };
          },
          deps: [MaterialSsrHandler],
          multi: true
        }
      ]
    };

    // Bootstrap the application
    return await bootstrapApplication(AppComponent, ssrConfig);
  } catch (error) {
    console.error('❌ Error during server bootstrap:', error);
    throw error;
  }
};

// Export the bootstrap function as the default export for Angular SSR
export default bootstrap;
