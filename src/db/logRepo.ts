import { db } from './database.ts';
import type { RequestLog } from '../types.ts';
import { truncate } from '../utils/object.ts';

export function listLogs(limit = 200): RequestLog[] {
  return db.prepare('SELECT * FROM request_log ORDER BY id DESC LIMIT ?').all(limit) as RequestLog[];
}

export function clearLogs(): void {
  db.prepare('DELETE FROM request_log').run();
}

export function logRequest(
  routeId: number | null,
  method: string,
  path: string,
  status: number,
  durationMs: number,
  requestBody: string,
  responsePreview: string,
): void {
  db.prepare(`
    INSERT INTO request_log (route_id, method, path, status, duration_ms, request_body, response_preview)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(routeId, method, path, status, durationMs, truncate(requestBody, 4000), truncate(responsePreview, 4000));

  db.prepare(`
    DELETE FROM request_log
    WHERE id NOT IN (SELECT id FROM request_log ORDER BY id DESC LIMIT 1000)
  `).run();
}
