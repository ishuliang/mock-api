import type { IncomingHttpHeaders } from 'node:http';

import type { ApiRoute } from '../types.ts';
import { asRecord, parseJsonOrText } from '../utils/object.ts';

type MatchSource = 'body' | 'query' | 'header' | 'rawBody';
type MatchOperator = 'equals' | 'contains' | 'regex' | 'exists';

type MatchRule = {
  source?: MatchSource;
  path?: string;
  name?: string;
  operator?: MatchOperator;
  value?: unknown;
};

type MatchContext = {
  headers: IncomingHttpHeaders;
  query: Record<string, string>;
  bodyText: string;
  body: unknown;
};

export function selectMatchedRoute(candidates: ApiRoute[], context: MatchContext): ApiRoute | undefined {
  const fallbackRoutes: ApiRoute[] = [];

  for (const route of candidates) {
    const rules = parseMatchRules(route.match_rules);
    if (!rules) continue;
    if (rules.length === 0) {
      fallbackRoutes.push(route);
      continue;
    }

    if (rules.every((rule) => matchRule(rule, context))) {
      return route;
    }
  }

  return fallbackRoutes[0];
}

export function parseBodyForMatch(bodyText: string): unknown {
  return parseJsonOrText(bodyText);
}

function parseMatchRules(input: string): MatchRule[] | undefined {
  const trimmed = input.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.map((rule) => asRecord(rule) as MatchRule) : undefined;
  } catch {
    return undefined;
  }
}

function matchRule(rule: MatchRule, context: MatchContext): boolean {
  const operator = rule.operator ?? 'equals';
  const actual = readRuleValue(rule, context);

  if (operator === 'exists') {
    return actual !== undefined && actual !== null && actual !== '';
  }

  if (actual === undefined || actual === null) return false;

  const actualText = stringifyValue(actual);
  const expectedText = stringifyValue(rule.value);

  if (operator === 'equals') return actualText === expectedText;
  if (operator === 'contains') return actualText.includes(expectedText);
  if (operator === 'regex') {
    try {
      return new RegExp(expectedText).test(actualText);
    } catch {
      return false;
    }
  }

  return false;
}

function readRuleValue(rule: MatchRule, context: MatchContext): unknown {
  const source = rule.source ?? 'body';
  const path = rule.path ?? rule.name ?? '';

  if (source === 'rawBody') return context.bodyText;
  if (source === 'query') return path ? context.query[path] : context.query;
  if (source === 'header') return readHeader(context.headers, path);

  if (!path) return context.bodyText;
  return readPath(context.body, path);
}

function readHeader(headers: IncomingHttpHeaders, name: string): unknown {
  if (!name) return headers;
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(', ') : value;
}

function readPath(value: unknown, path: string): unknown {
  const parts = path.split('.').filter(Boolean);
  let current: unknown = value;

  for (const part of parts) {
    if (Array.isArray(current)) {
      const index = Number(part);
      current = Number.isInteger(index) ? current[index] : undefined;
      continue;
    }

    const record = asRecord(current);
    current = record[part];
  }

  return current;
}

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}
