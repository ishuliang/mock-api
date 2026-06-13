import type { IncomingMessage } from 'node:http';

import { HttpError } from '../errors.ts';

export async function readJson(req: IncomingMessage): Promise<unknown> {
  const text = await readText(req);
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

export function readText(req: IncomingMessage): Promise<string> {
  return new Promise((resolveText, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy(new HttpError(413, 'Request body too large'));
      }
    });
    req.on('end', () => resolveText(body));
    req.on('error', reject);
  });
}
