/**
 * Test utility functions for Angular testing with Jest
 */

declare const jest: any; // Jest types are globally available when @types/jest is installed

export function getProtectedProperty<T, K extends keyof T>(instance: T, property: K): T[K] {
  return (instance as any)[property];
}

export function setProtectedProperty<T, K extends keyof T>(instance: T, property: K, value: T[K]): void {
  (instance as any)[property] = value;
}

/**
 * Creates a spy on the protected property getter/setter
 */
export function spyOnProtectedProperty<T, K extends keyof T>(
  instance: T,
  property: K,
  accessType: 'get' | 'set' = 'get',
): jest.SpyInstance<T[K], []> {
  const prototype = Object.getPrototypeOf(instance);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, property) || Object.getOwnPropertyDescriptor(instance as any, property);

  if (!descriptor) {
    throw new Error(`Property ${String(property)} does not exist on the object`);
  }

  // Use Jest's spyOn with property access type
  return jest.spyOn(instance as any, property as any, accessType);
}
