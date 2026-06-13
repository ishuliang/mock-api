import { randomUUID } from 'node:crypto';

import { asRecord } from '../utils/object.ts';

export function applyTemplate(source: string, context: { query: Record<string, string>; body: unknown }): string {
  return source.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expression: string) => {
    const key = expression.trim();
    if (key === 'uuid') return randomUUID();
    if (key === 'timestamp') return String(Date.now());
    if (key === 'now') return new Date().toISOString();

    const randomIntMatch = /^randomInt\((\d+),\s*(\d+)\)$/.exec(key);
    if (randomIntMatch) {
      const min = Number(randomIntMatch[1]);
      const max = Number(randomIntMatch[2]);
      return String(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    if (key.startsWith('query.')) {
      return context.query[key.slice('query.'.length)] ?? '';
    }

    if (key.startsWith('body.')) {
      const body = asRecord(context.body);
      const bodyValue = body[key.slice('body.'.length)];
      return bodyValue == null ? '' : String(bodyValue);
    }

    return '';
  });
}
