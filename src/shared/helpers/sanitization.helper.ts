import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export function sanitizeString(value: string): string {
  let sanitized = value.trim();

  sanitized = sanitized.normalize('NFC');

  return validator.escape(sanitized);
}

export function sanitizeHtml(html: string, config?: DOMPurify.Config): string {
  return DOMPurify.sanitize(html, config);
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>);
  }

  return value;
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    sanitized[key as keyof T] = sanitizeValue(value) as T[keyof T];
  }

  return sanitized;
}
