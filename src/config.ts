import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export const rootDir = sourceRoot.endsWith('/dist') ? resolve(sourceRoot, '..') : sourceRoot;
export const publicDir = resolve(rootDir, 'public');
export const dataDir = resolve(rootDir, 'data');
export const dbPath = resolve(dataDir, 'mock.db');
export const port = Number(process.env.PORT ?? 13000);
