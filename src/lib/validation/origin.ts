// Compare the browser's Origin with the actual request Host. Next's internal
// URL may use localhost even when the browser connects through 127.0.0.1.
export function sameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.origin === origin &&
      parsed.host === host
    );
  } catch {
    return false;
  }
}
