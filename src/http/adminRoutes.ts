import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  createCategory,
  deleteCategory,
  listCategories,
  normalizeCategoryInput,
  updateCategory,
} from '../db/categoryRepo.ts';
import { clearLogs, listLogs } from '../db/logRepo.ts';
import { createRoute, deleteRoute, listRoutes, normalizeRouteInput, updateRoute } from '../db/routeRepo.ts';
import { readJson } from './request.ts';
import { sendJson } from './response.ts';

export async function handleAdmin(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
  if (req.method === 'GET' && url.pathname === '/api/admin/categories') {
    sendJson(res, 200, listCategories());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/categories') {
    const input = await readJson(req);
    const category = normalizeCategoryInput(input);
    sendJson(res, 201, createCategory(category));
    return;
  }

  const categoryIdMatch = /^\/api\/admin\/categories\/(\d+)$/.exec(url.pathname);
  if (categoryIdMatch && req.method === 'PUT') {
    const id = Number(categoryIdMatch[1]);
    const input = await readJson(req);
    const category = normalizeCategoryInput(input);
    const updated = updateCategory(id, category);

    if (!updated) {
      sendJson(res, 404, { error: 'Category not found' });
      return;
    }

    sendJson(res, 200, updated);
    return;
  }

  if (categoryIdMatch && req.method === 'DELETE') {
    const id = Number(categoryIdMatch[1]);
    const deleted = deleteCategory(id);
    if (!deleted) {
      sendJson(res, 400, { error: 'Category cannot be deleted' });
      return;
    }
    sendJson(res, 204, null);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/routes') {
    sendJson(res, 200, listRoutes());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/routes') {
    const input = await readJson(req);
    const route = normalizeRouteInput(input);
    sendJson(res, 201, createRoute(route));
    return;
  }

  const routeIdMatch = /^\/api\/admin\/routes\/(\d+)$/.exec(url.pathname);
  if (routeIdMatch && req.method === 'PUT') {
    const id = Number(routeIdMatch[1]);
    const input = await readJson(req);
    const route = normalizeRouteInput(input);
    const updated = updateRoute(id, route);

    if (!updated) {
      sendJson(res, 404, { error: 'Route not found' });
      return;
    }

    sendJson(res, 200, updated);
    return;
  }

  if (routeIdMatch && req.method === 'DELETE') {
    const id = Number(routeIdMatch[1]);
    deleteRoute(id);
    sendJson(res, 204, null);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/logs') {
    sendJson(res, 200, listLogs());
    return;
  }

  if (req.method === 'DELETE' && url.pathname === '/api/admin/logs') {
    clearLogs();
    sendJson(res, 204, null);
    return;
  }

  sendJson(res, 404, { error: 'Admin endpoint not found' });
}
