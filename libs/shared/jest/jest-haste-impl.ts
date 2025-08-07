// Custom Haste implementation to handle module name collisions
// This is used by Jest to generate unique module names

import { basename, dirname } from 'path';

// Create a custom Haste resolver to handle module name collisions
const getHasteName = (filePath: string): string | undefined => {
  const fileName = basename(filePath, '.js');
  const parentDir = basename(dirname(filePath));
  return `${parentDir}__${fileName}`.replace(/\W+/g, '_');
};

export = {
  getHasteName,
};
