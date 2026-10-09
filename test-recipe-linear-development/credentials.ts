import { createLinearClient, LinearFailure } from "./linear-api.ts";
import { readLinearToken, saveLinearToken } from "./credential-store.ts";
import { requestLinearToken } from "./terminal.ts";
import { linearLimits } from "./linear.constants.ts";
import type { LinearDependencies } from "./linear.types.ts";

export async function validatedLinearToken(
  file: string,
  signal: AbortSignal,
  dependencies: LinearDependencies = {},
) {
  const write =
    dependencies.write ??
    ((message) => {
      process.stderr.write(message);
    });
  const prompt = dependencies.prompt ?? requestLinearToken;
  const stored = await readLinearToken(file);
  let candidate =
    (
      dependencies.environment ?? (() => process.env.LINEAR_API_KEY)
    )()?.trim() || stored;
  while (true) {
    signal.throwIfAborted();
    if (!candidate) {
      candidate = await prompt(signal);
      if (candidate === undefined) {
        if (!signal.aborted) process.exitCode = 130;
        throw new Error(
          "Linear authentication cancelled; no credential was saved",
        );
      }
      candidate = candidate.trim();
    }
    try {
      if (
        !candidate ||
        Buffer.byteLength(candidate) > linearLimits.tokenBytes ||
        !/^[\x21-\x7e]+$/.test(candidate)
      )
        throw new LinearFailure("authentication", "Invalid API key format");
      await createLinearClient(candidate, dependencies.fetch).validate(signal);
      if (candidate !== stored) await saveLinearToken(file, candidate);
      write("[Linear] API key verified.\n");
      return candidate;
    } catch (error) {
      if (!(error instanceof LinearFailure) || error.kind !== "authentication")
        throw error;
      write("[Linear] API key rejected. Enter another key.\n");
      candidate = undefined;
    }
  }
}
