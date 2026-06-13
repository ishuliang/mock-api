export type RouteMode = 'mock' | 'proxy';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRoute = {
  id: number;
  category_id: number;
  name: string;
  method: HttpMethod;
  path: string;
  enabled: 0 | 1;
  mode: RouteMode;
  status: number;
  delay_ms: number;
  response_body: string;
  proxy_url: string;
  match_rules: string;
  created_at: string;
  updated_at: string;
};

export type RouteDraft = Omit<ApiRoute, 'id' | 'created_at' | 'updated_at'>;

export type Category = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CategoryDraft = {
  name: string;
};

export type RequestLog = {
  id: number;
  route_id: number | null;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  request_body: string;
  response_preview: string;
  created_at: string;
};
