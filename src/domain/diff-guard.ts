import { invariant, OutpostError } from "./errors.ts";
import { glob } from "./glob.ts";
import type { BranchPolicy } from "./workspace.types.ts";
import type { DiffChange, DiffGuard } from "./diff-guard.types.ts";

export function validateDiffGuard(
  guard: DiffGuard | undefined,
  policy: BranchPolicy,
): void {
  if (guard === undefined) return;
  invariant(
    guard !== null && typeof guard === "object" && !Array.isArray(guard),
    "guard must be an object",
  );
  invariant(
    policy.mode !== "current",
    "Diff guards require a named or integration workspace",
  );
  if (guard.maxChangedLines !== undefined)
    invariant(
      Number.isSafeInteger(guard.maxChangedLines) && guard.maxChangedLines >= 0,
      "guard.maxChangedLines must be a nonnegative safe integer",
    );
  if (guard.protectedPaths !== undefined) {
    invariant(
      Array.isArray(guard.protectedPaths),
      "guard.protectedPaths must be an array",
    );
    for (const pattern of guard.protectedPaths)
      invariant(
        typeof pattern === "string" &&
          pattern.length > 0 &&
          !pattern.includes("\0") &&
          !pattern.includes("\\") &&
          !pattern.startsWith("/") &&
          !/^[A-Za-z]:/.test(pattern) &&
          !pattern.split("/").some((part) => part === "." || part === ".."),
        "guard.protectedPaths must contain nonempty repository-relative patterns using forward slashes",
      );
  }
}

export function enforceDiffGuard(
  guard: DiffGuard,
  changes: readonly DiffChange[],
): void {
  const protectedPaths = (guard.protectedPaths ?? []).map((pattern) => ({
    pattern,
    matcher: glob(pattern, "path"),
  }));
  const matches = changes.flatMap((change) =>
    change.paths.flatMap((path) =>
      protectedPaths
        .filter(({ matcher }) => matcher.test(path))
        .map(({ pattern }) => ({ path, pattern })),
    ),
  );
  const changedLines = changes.reduce(
    (total, change) => total + change.added + change.removed,
    0,
  );
  const binaryPaths = changes
    .filter((change) => change.binary)
    .flatMap((change) => change.paths);
  const reasons: string[] = [];
  if (matches.length) reasons.push("protected-paths");
  if (guard.maxChangedLines !== undefined) {
    if (binaryPaths.length) reasons.push("binary-files");
    if (
      !Number.isSafeInteger(changedLines) ||
      changedLines > guard.maxChangedLines
    )
      reasons.push("changed-lines");
  }
  if (!reasons.length) return;
  throw new OutpostError(
    "guard",
    "Committed diff refused by workspace guard; workspace retained",
    {
      reasons,
      matches,
      changedLines,
      binaryPaths,
      ...(guard.maxChangedLines === undefined
        ? {}
        : { maxChangedLines: guard.maxChangedLines }),
    },
  );
}
