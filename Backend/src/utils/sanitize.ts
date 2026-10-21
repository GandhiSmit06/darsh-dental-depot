/**
 * Security and sanitization utilities for Darsh Dental Depot
 * - Regex escaping (OWASP ReDoS mitigation)
 * - HTML / Script tag stripping (XSS mitigation)
 * - Deep object sanitization & prototype pollution prevention
 */

export function escapeRegex(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return val;
  return val
    // Strip script and iframe tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Strip inline event handlers like onerror=, onload=, onclick=
    .replace(/\bon\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '')
    // Strip javascript: pseudo-protocol
    .replace(/javascript\s*:[^"']*/gi, '')
    // Strip data: text/html base64 injection
    .replace(/data\s*:\s*text\/html[^"']*/gi, '');
}

export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }

  if (typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  // Skip instances of Date, Buffer, ObjectId, etc.
  if (
    input instanceof Date ||
    (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) ||
    (input as any)._bsontype // MongoDB ObjectId / Decimal128
  ) {
    return input;
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(input)) {
    // Prototype pollution defense
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleanObj[key] = sanitizeObject(val);
  }

  return cleanObj as T;
}
