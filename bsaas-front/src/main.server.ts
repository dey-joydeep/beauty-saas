import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config as serverConfig } from './app/app.config.server';
import { MaterialSsrHandler } from './app/core/ssr';
import { PLATFORM_ID, inject, ApplicationRef } from '@angular/core';

// Platform server for server-side rendering
const bootstrap = async (): Promise<ApplicationRef> => {
  try {
    // Get the platform ID
    const platformId = inject(PLATFORM_ID);

    // Initialize Material SSR handler
    const materialSsrHandler = new MaterialSsrHandler(platformId);
    materialSsrHandler.initialize();

    // Bootstrap the application with the correct server config
    const appRef = await bootstrapApplication(AppComponent, serverConfig);

    // Return the application reference
    return appRef;
  } catch (error) {
    console.error('Error during server bootstrap:', error);
    // Re-throw the error to prevent silent failures
    throw error;
  }
};

// Export the bootstrap function as the default export for Angular SSR
export default bootstrap;
