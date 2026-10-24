export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5080';

export type ApiPath = `/api/${string}`;

export class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: ApiPath, init: RequestInit = {}): Promise<T> {
  const response = await fetch(API_URL + path, init);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.code ?? 'ERROR', body.message ?? `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

const withJson = (method: string, data?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: data === undefined ? undefined : JSON.stringify(data),
});

export const api = {
  get: <T>(path: ApiPath) => request<T>(path),
  post: <T>(path: ApiPath, data?: unknown) => request<T>(path, withJson('POST', data)),
  put: <T>(path: ApiPath, data: unknown) => request<T>(path, withJson('PUT', data)),
  upload: <T>(path: ApiPath, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<T>(path, { method: 'POST', body: form });
  },
};

export function toQuery(params: Record<string, string | number | readonly (string | number)[] | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    if (Array.isArray(value)) value.forEach(v => query.append(key, String(v)));
    else query.append(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}
