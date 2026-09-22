export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}
export async function api<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? 'GET', signal: options.signal, credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Workspace-Request': '1' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const result = await response.json().catch(() => ({ error: '服务未就绪，请检查工作区服务是否正在运行。' }))
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('workspace-session-expired'))
    if (response.status === 403 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('workspace-access-changed'))
    throw new ApiError(result.error ?? '操作失败，请重试。', response.status)
  }
  return result as T
}
