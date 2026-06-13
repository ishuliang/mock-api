import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRoute } from '../types.ts';
import { sendJson, corsHeaders } from '../http/response.ts';

export type ProxyResult = {
  status: number;
  responseText: string;
};

export async function proxyRequest(
  req: IncomingMessage,
  res: ServerResponse,
  route: ApiRoute,
  url: URL,
  bodyText: string,
): Promise<ProxyResult | undefined> {
  if (!route.proxy_url) {
    sendJson(res, 502, { error: 'Proxy URL is empty' });
    return undefined;
  }

  const target = new URL(route.proxy_url);
  target.search = url.search;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (key === 'host' || value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const requestInit: RequestInit = {
    method: req.method ?? 'GET',
    headers,
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(req.method ?? 'GET')) {
    requestInit.body = bodyText;
  }

  const response = await fetch(target, requestInit);
  const responseText = await response.text();

  res.writeHead(response.status, {
    ...corsHeaders(),
    'Content-Type': response.headers.get('content-type') ?? 'text/plain; charset=utf-8',
  });
  res.end(responseText);

  return {
    status: response.status,
    responseText,
  };
}
