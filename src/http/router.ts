import type { IncomingMessage, ServerResponse } from 'node:http';

import { port } from '../config.ts';
import { handleAdmin } from './adminRoutes.ts';
import { handleMock } from './mockRoutes.ts';
import { serveStatic } from './staticFiles.ts';

export async function routeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `localhost:${port}`}`);

  if (url.pathname.startsWith('/api/admin/')) {
    await handleAdmin(req, res, url);
    return;
  }

  if (url.pathname.startsWith('/mock/')) {
    await handleMock(req, res, url);
    return;
  }

  serveStatic(res, url.pathname);
}
