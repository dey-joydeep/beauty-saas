// base
export * from './core/base/abstract-base.component';
export * from './core/base/base-service';

// interceptors
export * from './core/interceptors/error.interceptor';

// security
export * from './core/security/base-guard';

// shared services
export * from './core/services/loading.service';
export * from './core/services/notification.service';
export * from './core/services/error/error-handler.service';
export * from './core/services/error/error.service';
export * from './core/services/storage/storage.service';

// utils
export * from './core/utils/platform-utils';

// shared module
export * from './shared/shared.module';

// shared enums
export * from './shared/enums/enums';
export * from './shared/enums/user-role.enum';

// material module
export * from './shared/material/material.module';

// shared models
export * from './shared/models/date-range.model';
export * from './shared/models/day-of-week.enum';
export * from './shared/models/location.model';

// reusable components
export * from './shared/components/confirm-dialog/confirm-dialog.component';

// features (only if shared)
export * from './features/dashboard/services/dashboard-api.service';

// translate
export * from './core/translate/translate-server.loader';
export { TranslateBrowserLoader, translateBrowserLoaderFactory } from './core/translate/translate-ssr-loader';
