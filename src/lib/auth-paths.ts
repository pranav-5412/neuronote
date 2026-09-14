const routes = new Set([
  "/",
  "/my-brain",
  "/documents",
  "/notes",
  "/knowledge-graph",
  "/flashcards",
  "/quizzes",
  "/progress",
  "/ai-tutor",
  "/settings",
]);
export function safeNext(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x1f]/.test(value)
  )
    return "/";
  try {
    const url = new URL(value, "https://neuronote.invalid");
    return url.origin === "https://neuronote.invalid" &&
      routes.has(url.pathname)
      ? url.pathname + url.search
      : "/";
  } catch {
    return "/";
  }
}
