import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { PlatformUtils } from './platform-utils';

describe('PlatformUtils', () => {
  let service: PlatformUtils;
  let platformId: Object;

  describe('in browser environment', () => {
    beforeEach(() => {
      platformId = 'browser';
      TestBed.configureTestingModule({
        providers: [
          PlatformUtils,
          { provide: PLATFORM_ID, useValue: platformId }
        ]
      });
      service = TestBed.inject(PlatformUtils);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be in browser mode', () => {
      expect(service.isBrowser).toBe(true);
      expect(service.isServer).toBe(false);
    });

    it('should provide browser APIs', () => {
      expect(service.browserLocalStorage).toBeDefined();
      expect(service.browserSessionStorage).toBeDefined();
      expect(service.browserNavigator).toBeDefined();
      expect(service.browserLocation).toBeDefined();
    });

    it('should run code in browser context', () => {
      const result = service.runInBrowser(
        () => 'browser',
        () => 'server'
      );
      expect(result).toBe('browser');
    });
  });

  describe('in server environment', () => {
    beforeEach(() => {
      platformId = 'server';
      TestBed.configureTestingModule({
        providers: [
          PlatformUtils,
          { provide: PLATFORM_ID, useValue: platformId }
        ]
      });
      service = TestBed.inject(PlatformUtils);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be in server mode', () => {
      expect(service.isBrowser).toBe(false);
      expect(service.isServer).toBe(true);
    });

    it('should handle missing browser APIs gracefully', () => {
      // In server environment, these should be null or safe defaults
      expect(service.browserLocalStorage).toBeNull();
      expect(service.browserSessionStorage).toBeNull();
      expect(service.browserNavigator).toBeNull();
      expect(service.browserLocation).toBeNull();
    });

    it('should run fallback code in server context', () => {
      const result = service.runInBrowser(
        () => 'browser',
        () => 'server'
      );
      expect(result).toBe('server');
    });
  });

  describe('document and window access', () => {
    it('should provide safe access to document', () => {
      // Browser
      service = new PlatformUtils('browser' as any);
      expect(service.document).toBeDefined();

      // Server
      service = new PlatformUtils('server' as any);
      expect(service.document).toBeNull();
    });

    it('should provide safe access to window', () => {
      // Browser
      service = new PlatformUtils('browser' as any);
      expect(service.window).toBeDefined();

      // Server
      service = new PlatformUtils('server' as any);
      expect(service.window).toBeNull();
    });
  });
});
