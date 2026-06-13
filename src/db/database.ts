import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { dataDir, dbPath } from '../config.ts';

mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO category (id, name) VALUES (1, '默认分类');

  CREATE TABLE IF NOT EXISTS api_route (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT '',
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    mode TEXT NOT NULL DEFAULT 'mock',
    status INTEGER NOT NULL DEFAULT 200,
    delay_ms INTEGER NOT NULL DEFAULT 0,
    response_body TEXT NOT NULL DEFAULT '{}',
    proxy_url TEXT NOT NULL DEFAULT '',
    match_rules TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS request_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    request_body TEXT NOT NULL DEFAULT '',
    response_preview TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

migrateApiRoute();

seedIfEmpty();

function migrateApiRoute(): void {
  const columns = db.prepare('PRAGMA table_info(api_route)').all() as Array<{ name: string }>;
  const hasCategoryId = columns.some((column) => column.name === 'category_id');
  const hasMatchRules = columns.some((column) => column.name === 'match_rules');
  if (!hasCategoryId) {
    db.exec('ALTER TABLE api_route ADD COLUMN category_id INTEGER NOT NULL DEFAULT 1');
  }
  if (!hasMatchRules) {
    db.exec("ALTER TABLE api_route ADD COLUMN match_rules TEXT NOT NULL DEFAULT '[]'");
  }

  db.prepare('UPDATE api_route SET category_id = 1 WHERE category_id IS NULL').run();
  db.prepare("UPDATE api_route SET match_rules = '[]' WHERE match_rules IS NULL OR match_rules = ''").run();

  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'api_route'").get() as
    | { sql: string }
    | undefined;
  const hasMethodPathUnique = table?.sql.includes('UNIQUE(method, path)') ?? false;
  if (!hasMethodPathUnique) return;

  db.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN TRANSACTION;

    CREATE TABLE api_route_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL DEFAULT '',
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      mode TEXT NOT NULL DEFAULT 'mock',
      status INTEGER NOT NULL DEFAULT 200,
      delay_ms INTEGER NOT NULL DEFAULT 0,
      response_body TEXT NOT NULL DEFAULT '{}',
      proxy_url TEXT NOT NULL DEFAULT '',
      match_rules TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO api_route_new (
      id, category_id, name, method, path, enabled, mode, status, delay_ms,
      response_body, proxy_url, match_rules, created_at, updated_at
    )
    SELECT
      id, COALESCE(category_id, 1), name, method, path, enabled, mode, status, delay_ms,
      response_body, proxy_url, COALESCE(match_rules, '[]'), created_at, updated_at
    FROM api_route;

    DROP TABLE api_route;
    ALTER TABLE api_route_new RENAME TO api_route;

    COMMIT;
    PRAGMA foreign_keys = ON;
  `);
}

function seedIfEmpty(): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM api_route').get() as { count: number };
  if (count.count > 0) return;

  db.prepare(`
    INSERT INTO api_route (category_id, name, method, path, mode, status, delay_ms, response_body, match_rules)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'Hello Mock',
    'GET',
    '/hello',
    'mock',
    200,
    0,
    JSON.stringify(
      {
        id: '{{uuid}}',
        message: 'hello mock api',
        page: '{{query.page}}',
        now: '{{now}}',
      },
      null,
      2,
    ),
    '[]',
  );
}
