import { db } from './database.ts';
import type { Category, CategoryDraft } from '../types.ts';
import { asRecord } from '../utils/object.ts';

export const defaultCategoryId = 1;

export function listCategories(): Category[] {
  return db.prepare('SELECT * FROM category ORDER BY id ASC').all() as Category[];
}

export function getCategory(id: number): Category | undefined {
  return db.prepare('SELECT * FROM category WHERE id = ? LIMIT 1').get(id) as Category | undefined;
}

export function createCategory(category: CategoryDraft): Category | undefined {
  const result = db.prepare('INSERT INTO category (name) VALUES (?)').run(category.name);
  return getCategory(Number(result.lastInsertRowid));
}

export function updateCategory(id: number, category: CategoryDraft): Category | undefined {
  db.prepare('UPDATE category SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(category.name, id);
  return getCategory(id);
}

export function deleteCategory(id: number): boolean {
  if (id === defaultCategoryId) return false;

  const existing = getCategory(id);
  if (!existing) return false;

  db.prepare('UPDATE api_route SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE category_id = ?').run(defaultCategoryId, id);
  db.prepare('DELETE FROM category WHERE id = ?').run(id);
  return true;
}

export function normalizeCategoryInput(input: unknown): CategoryDraft {
  const value = asRecord(input);
  const name = String(value.name ?? '').trim();

  return {
    name: name || '未命名分类',
  };
}

export function normalizeCategoryId(input: unknown): number {
  const id = Number(input);
  if (!Number.isInteger(id) || id <= 0) return defaultCategoryId;
  return getCategory(id) ? id : defaultCategoryId;
}
