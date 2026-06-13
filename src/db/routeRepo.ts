import { db } from './database.ts';
import { normalizeCategoryId } from './categoryRepo.ts';
import type { ApiRoute, RouteDraft } from '../types.ts';
import { asRecord, clampInteger } from '../utils/object.ts';
import { normalizeMethod, normalizePath } from '../utils/routes.ts';

export function listRoutes(): ApiRoute[] {
  return db.prepare('SELECT * FROM api_route ORDER BY updated_at DESC, id DESC').all() as ApiRoute[];
}

export function createRoute(route: RouteDraft): ApiRoute | undefined {
  const result = db.prepare(`
    INSERT INTO api_route (category_id, name, method, path, enabled, mode, status, delay_ms, response_body, proxy_url, match_rules)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    route.category_id,
    route.name,
    route.method,
    route.path,
    route.enabled,
    route.mode,
    route.status,
    route.delay_ms,
    route.response_body,
    route.proxy_url,
    route.match_rules,
  );

  return getRoute(Number(result.lastInsertRowid));
}

export function updateRoute(id: number, route: RouteDraft): ApiRoute | undefined {
  db.prepare(`
    UPDATE api_route
    SET category_id = ?, name = ?, method = ?, path = ?, enabled = ?, mode = ?, status = ?, delay_ms = ?,
        response_body = ?, proxy_url = ?, match_rules = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    route.category_id,
    route.name,
    route.method,
    route.path,
    route.enabled,
    route.mode,
    route.status,
    route.delay_ms,
    route.response_body,
    route.proxy_url,
    route.match_rules,
    id,
  );

  return getRoute(id);
}

export function deleteRoute(id: number): void {
  db.prepare('DELETE FROM api_route WHERE id = ?').run(id);
}

export function findRoute(method: string, path: string): ApiRoute | undefined {
  return db
    .prepare('SELECT * FROM api_route WHERE method = ? AND path = ? LIMIT 1')
    .get(method, path) as ApiRoute | undefined;
}

export function listCandidateRoutes(method: string, path: string): ApiRoute[] {
  return db
    .prepare('SELECT * FROM api_route WHERE method = ? AND path = ? AND enabled = 1 ORDER BY id DESC')
    .all(method, path) as ApiRoute[];
}

export function getRoute(id: number): ApiRoute | undefined {
  return db.prepare('SELECT * FROM api_route WHERE id = ? LIMIT 1').get(id) as ApiRoute | undefined;
}

export function normalizeRouteInput(input: unknown): RouteDraft {
  const value = asRecord(input);
  const method = normalizeMethod(String(value.method ?? 'GET'));
  const path = normalizePath(String(value.path ?? '/hello'));
  const mode = value.mode === 'proxy' ? 'proxy' : 'mock';
  const response = value.response_body ?? value.responseBody ?? '{}';
  const matchRules = value.match_rules ?? value.matchRules ?? '[]';

  return {
    category_id: normalizeCategoryId(value.category_id ?? value.categoryId),
    name: String(value.name ?? path).trim() || path,
    method,
    path,
    enabled: value.enabled === false || value.enabled === 0 ? 0 : 1,
    mode,
    status: clampInteger(value.status, 100, 599, 200),
    delay_ms: clampInteger(value.delay_ms ?? value.delayMs, 0, 60000, 0),
    response_body: typeof response === 'string' ? response : JSON.stringify(response, null, 2),
    proxy_url: String(value.proxy_url ?? value.proxyUrl ?? '').trim(),
    match_rules: normalizeMatchRules(matchRules),
  };
}

function normalizeMatchRules(value: unknown): string {
  if (typeof value === 'string') return value.trim() || '[]';
  return JSON.stringify(value ?? [], null, 2);
}
