import type { ServerResponse } from 'node:http';

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  if (status === 204) {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }
  sendText(res, status, JSON.stringify(body), 'application/json; charset=utf-8');
}

export function sendText(res: ServerResponse, status: number, body: string | Buffer, contentType: string): void {
  res.writeHead(status, {
    ...corsHeaders(),
    'Content-Type': contentType,
  });
  res.end(body);
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };
}
