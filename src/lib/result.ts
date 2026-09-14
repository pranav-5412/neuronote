export type Result<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string };
export class PublicError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "PublicError";
  }
}
export function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof PublicError) return { ok: false, error: error.message };
  console.error(
    "[NeuroNote] Operation failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return {
    ok: false,
    error: "Something interrupted this request. Please try again.",
  };
}
