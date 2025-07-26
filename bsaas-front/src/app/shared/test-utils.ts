/**
 * Test utility functions for Angular testing
 */

export function getProtectedProperty<T, K extends keyof T>(instance: T, property: K): T[K] {
  return (instance as any)[property];
}

export function setProtectedProperty<T, K extends keyof T>(
  instance: T,
  property: K,
  value: T[K]
): void {
  (instance as any)[property] = value;
}

/**
 * Creates a spy on the protected property getter/setter
 */
export function spyOnProtectedProperty<T, K extends keyof T>(
  instance: T,
  property: K,
  accessType: 'get' | 'set' = 'get'
): jasmine.Spy {
  const prototype = Object.getPrototypeOf(instance);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, property) ||
                    Object.getOwnPropertyDescriptor(instance as any, property);
  
  if (!descriptor) {
    throw new Error(`Property ${String(property)} does not exist on the object`);
  }

  if (accessType === 'get') {
    return spyOnProperty(instance, property as any, 'get').and.callThrough();
  } else {
    return spyOnProperty(instance, property as any, 'set').and.callThrough();
  }
}
