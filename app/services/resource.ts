import type { ApiClient } from '~/plugins/01.api';

export interface Resource<T, C = Partial<T>, U = Partial<C>> {
  list(query?: Record<string, unknown>): Promise<T[]>;
  get(id: string): Promise<T>;
  create(payload: C): Promise<T>;
  update(id: string, payload: U): Promise<T>;
  remove(id: string): Promise<{ deleted: true; id: string }>;
}

/**
 * Standard REST resource (`GET /x`, `GET /x/:id`, `POST /x`, `PATCH /x/:id`,
 * `DELETE /x/:id`). `listPath` covers admin listings like `/governorates/admin/all`.
 */
export function createResource<T, C = Partial<T>, U = Partial<C>>(
  api: ApiClient,
  basePath: string,
  { listPath = basePath }: { listPath?: string } = {},
): Resource<T, C, U> {
  return {
    list: (query) => api<T[]>(listPath, { query }),
    get: (id) => api<T>(`${basePath}/${id}`),
    create: (payload) => api<T>(basePath, { method: 'POST', body: payload }),
    update: (id, payload) => api<T>(`${basePath}/${id}`, { method: 'PATCH', body: payload }),
    remove: (id) => api<{ deleted: true; id: string }>(`${basePath}/${id}`, { method: 'DELETE' }),
  };
}
