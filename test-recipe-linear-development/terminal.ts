import { isCancel, password } from "@clack/prompts";

export async function requestLinearToken(
  signal: AbortSignal,
): Promise<string | undefined> {
  const flags = process.argv;
  const explicit = flags.lastIndexOf("--interactive");
  if (
    !process.stdin.isTTY ||
    !process.stderr.isTTY ||
    flags.lastIndexOf("--no-interactive") > explicit ||
    (flags.includes("--json") && explicit < 0)
  )
    throw new Error(
      "A validated Linear API key is required; set LINEAR_API_KEY or run interactively",
    );
  const closed = new AbortController();
  const abort = () => closed.abort(signal.reason);
  const end = () => closed.abort();
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, { once: true });
  process.stdin.once("end", end);
  process.stdin.once("close", end);
  try {
    const value = await password({
      message: "Linear personal API key (saved only after validation)",
      input: process.stdin,
      output: process.stderr,
      signal: closed.signal,
      validate: (value) => (value?.trim() ? undefined : "Enter an API key"),
    });
    return isCancel(value) ? undefined : value.trim();
  } finally {
    signal.removeEventListener("abort", abort);
    process.stdin.pause();
    process.stdin.off("end", end);
    process.stdin.off("close", end);
  }
}
