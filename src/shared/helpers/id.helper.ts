import { uuidv7 } from 'uuidv7';

/**
 * Generates a unique identifier using UUIDv7.
 * @returns {string} A UUIDv7 string.
 */
export function generateId(): string {
  return uuidv7();
}
