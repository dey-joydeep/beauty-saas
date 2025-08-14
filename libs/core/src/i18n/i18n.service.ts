import { Injectable } from '@nestjs/common';

@Injectable()
export class I18nService {
  // Basic implementation that can be expanded later
  translate(key: string, args?: Record<string, any>): string {
    // Simple implementation - just return the key for now
    // In a real implementation, this would look up translations
    return key;
  }
}
