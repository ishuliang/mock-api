import type { ServerResponse } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, relative } from 'node:path';

import { publicDir } from '../config.ts';
import { sendText } from './response.ts';

export function serveStatic(res: ServerResponse, pathname: string): void {
  const cleanPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(publicDir, cleanPath));
  const relativePath = relative(publicDir, filePath);

  if (relativePath.startsWith('..')) {
    sendText(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      sendText(res, 404, 'Not found', 'text/plain; charset=utf-8');
      return;
    }

    sendText(res, 200, readFileSync(filePath), mimeType(filePath));
  } catch {
    sendText(res, 404, 'Not found', 'text/plain; charset=utf-8');
  }
}

function mimeType(filePath: string): string {
  const extension = extname(filePath);
  if (extension === '.html') return 'text/html; charset=utf-8';
  if (extension === '.css') return 'text/css; charset=utf-8';
  if (extension === '.js') return 'text/javascript; charset=utf-8';
  if (extension === '.json') return 'application/json; charset=utf-8';
  if (extension === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}
