export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type BackendError = { code?: string; message?: string; details?: unknown };

/** Разворачивает ответ openapi-fetch: вернёт data или бросит ApiError. */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise;
  if (!response.ok || error !== undefined) {
    const body = error as BackendError | undefined;
    throw new ApiError(
      response.status,
      body?.code ?? "UNKNOWN",
      body?.message ?? response.statusText,
      body?.details,
    );
  }
  return data as T;
}
