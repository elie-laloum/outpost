import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { directory, safeDestination } from "../infrastructure/files.ts";
import { verificationGit as git } from "../infrastructure/git/verification-command.ts";
import { hashInspectionEntry } from "../infrastructure/inspection-hash.ts";
import { recoveryTransferPatches } from "./recovery-verification.constants.ts";
import type {
  RecoveryStructureCheck,
  RecoveryTransferState,
} from "./recovery-verification.types.ts";

export async function verifyRecoveryRestorability(
  root: string,
  state: RecoveryTransferState,
  repository: string,
): Promise<readonly RecoveryStructureCheck[]> {
  const temporary = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-restore-check-")),
  );
  const checks: RecoveryStructureCheck[] = [];
  let stage = "REPOSITORY_OBJECTS";
  try {
    const source = await directory(repository);
    stage = "SOURCE_UNSUPPORTED";
    const common = (
      await git(source, [
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ])
    ).trim();
    const configuration = await git(source, [
      "config",
      "--local",
      "--null",
      "--list",
    ]);
    if (
      /(?:extensions\.partialclone|remote\.[^\n\0]+\.(?:promisor|partialclonefilter))\n/i.test(
        configuration,
      )
    )
      throw new Error("Partial repositories are unsupported");
    for (const name of [
      "shallow",
      "objects/info/alternates",
      "objects/info/http-alternates",
    ]) {
      const exists = await lstat(join(common, name)).then(
        () => true,
        (error: unknown) => {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
          )
            return false;
          throw error;
        },
      );
      if (exists)
        throw new Error("Repository depends on external or shallow objects");
    }
    const checkout = join(temporary, "checkout");
    const snapshot = join(temporary, "transfer");
    await mkdir(snapshot);
    for (const name of [
      ...recoveryTransferPatches,
      ...(state.previous !== state.next ? ["commits.bundle"] : []),
    ]) {
      stage = "TRANSFER_SNAPSHOT";
      const path = await safeDestination(root, name);
      const before = await hashInspectionEntry(path);
      if (before.kind !== "file")
        throw new Error("Expected a regular transfer file");
      await copyFile(path, join(snapshot, name));
      const copied = await hashInspectionEntry(join(snapshot, name));
      if (before.sha256 !== copied.sha256 || before.bytes !== copied.bytes)
        throw new Error("Transfer changed while copying");
    }
    stage = "REPOSITORY_OBJECTS";
    await git(temporary, [
      "clone",
      "--local",
      "--no-hardlinks",
      "--no-checkout",
      "--",
      source,
      checkout,
    ]);
    if (state.previous !== state.next) {
      stage = "BUNDLE_OBJECTS";
      await git(checkout, [
        "bundle",
        "verify",
        join(snapshot, "commits.bundle"),
      ]);
      await git(checkout, [
        "bundle",
        "unbundle",
        join(snapshot, "commits.bundle"),
      ]);
      checks.push({
        path: join(root, "commits.bundle"),
        status: "pass",
        code: "BUNDLE_OBJECTS_VALID",
      });
    }
    stage = "COMMIT_OBJECTS";
    await git(checkout, ["cat-file", "-e", `${state.previous}^{commit}`]);
    await git(checkout, ["cat-file", "-e", `${state.next}^{commit}`]);
    await git(checkout, [
      "fsck",
      "--strict",
      "--no-reflogs",
      state.previous,
      state.next,
    ]);
    checks.push({ path: root, status: "pass", code: "COMMIT_OBJECTS_VALID" });
    for (const [name, commit, cached] of [
      ["previous.patch", state.previous, false],
      ["previous-index.patch", state.previous, true],
      ["remote.patch", state.next, false],
    ] as const) {
      stage = `PATCH_${name.toUpperCase().replaceAll(/[.-]/g, "_")}`;
      await git(checkout, ["reset", "--hard", commit]);
      const patch = join(snapshot, name);
      if ((await lstat(patch)).size) {
        const args = [
          "apply",
          "--binary",
          ...(cached ? ["--cached"] : []),
          patch,
        ];
        await git(checkout, [...args.slice(0, -1), "--check", patch]);
        await git(checkout, args);
      }
      checks.push({
        path: join(root, name),
        status: "pass",
        code: "PATCH_APPLIES",
      });
    }
  } catch {
    checks.push({
      path: root,
      status: "fail",
      code: stage === "SOURCE_UNSUPPORTED" ? stage : `${stage}_FAILED`,
    });
  } finally {
    await rm(temporary, { recursive: true, force: true, maxRetries: 3 });
  }
  return checks;
}
