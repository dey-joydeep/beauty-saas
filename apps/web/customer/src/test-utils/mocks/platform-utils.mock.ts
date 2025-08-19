import { IPlatformUtils } from '@frontend-shared/core/utils/platform-utils';

/**
 * Creates a mock implementation of IPlatformUtils for testing
 * @param overrides Optional overrides for the default mock values
 */
export function createPlatformUtilsMock(overrides: Partial<IPlatformUtils> = {}): IPlatformUtils {
  const defaultGeolocation = {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }),
  };

  const mock: IPlatformUtils = {
    isBrowser: true,
    isServer: false,
    browserLocalStorage: null,
    browserSessionStorage: null,
    browserNavigator: {
      geolocation: defaultGeolocation,
    } as any,
    browserLocation: null,
    document: typeof document !== 'undefined' ? document : null,
    window: typeof window !== 'undefined' ? window : null,
    runInBrowser: jest.fn(<T, F = undefined>(fn: () => T, fallback?: () => F) => {
      return mock.isBrowser ? fn() : fallback ? fallback() : undefined;
    }),
    ...overrides,
  };

  return mock;
}

/**
 * Creates a server-side mock implementation of IPlatformUtils
 */
export function createServerPlatformUtilsMock(): IPlatformUtils {
  return createPlatformUtilsMock({
    isBrowser: false,
    isServer: true,
    browserNavigator: null,
    document: null,
    window: null,
  });
}

/**
 * Creates a browser mock implementation of IPlatformUtils
 */
export function createBrowserPlatformUtilsMock(): IPlatformUtils {
  return createPlatformUtilsMock({
    isBrowser: true,
    isServer: false,
  });
}
