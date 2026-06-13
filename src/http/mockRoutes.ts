import type { IncomingMessage, ServerResponse } from 'node:http';

import { logRequest } from '../db/logRepo.ts';
import { listCandidateRoutes } from '../db/routeRepo.ts';
import { parseBodyForMatch, selectMatchedRoute } from '../mock/matcher.ts';
import { applyTemplate } from '../mock/template.ts';
import { proxyRequest } from '../mock/proxy.ts';
import { looksLikeJson, sleep } from '../utils/object.ts';
import { normalizeMethod, normalizeMockPath } from '../utils/routes.ts';
import { readText } from './request.ts';
import { sendJson, sendText } from './response.ts';

export async function handleMock(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
  const startedAt = Date.now();
  const method = normalizeMethod(req.method ?? 'GET');
  const mockPath = normalizeMockPath(url.pathname);
  const bodyText = await readText(req);
  const query = Object.fromEntries(url.searchParams.entries());
  const parsedBody = parseBodyForMatch(bodyText);
  const route = selectMatchedRoute(listCandidateRoutes(method, mockPath), {
    headers: req.headers,
    query,
    bodyText,
    body: parsedBody,
  });

  if (!route || route.enabled !== 1) {
    logRequest(null, method, mockPath, 404, Date.now() - startedAt, bodyText, 'Route not found');
    sendJson(res, 404, { error: 'Mock route not found', method, path: mockPath });
    return;
  }

  await sleep(route.delay_ms);

  if (route.mode === 'proxy') {
    const result = await proxyRequest(req, res, route, url, bodyText);
    if (result) {
      logRequest(route.id, req.method ?? 'GET', mockPath, result.status, Date.now() - startedAt, bodyText, result.responseText);
    }
    return;
  }

  let responseBody = route.response_body || '{}';
  responseBody = applyTemplate(responseBody, {
    query,
    body: parsedBody,
  });

  const contentType = looksLikeJson(responseBody) ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8';
  logRequest(route.id, method, mockPath, route.status, Date.now() - startedAt, bodyText, responseBody);
  sendText(res, route.status, responseBody, contentType);
}
