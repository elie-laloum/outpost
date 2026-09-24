import { createHash } from "node:crypto";
import { cp, lstat, mkdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import { directory, inside, safeDestination } from "../infrastructure/files.ts";
import { verificationGit as git } from "../infrastructure/git/verification-command.ts";
import { verifyRecoveryRestorability } from "./recovery-restorability.ts";
import { snapshotRecoveryTransfer } from "./recovery-restore-snapshot.ts";
import type {
  RecoveryRestoreOptions,
  RecoveryRestorePlan,
  RecoveryRestoreResult,
} from "./recovery-restore.types.ts";

function planFingerprint(
  plan: Omit<RecoveryRestorePlan, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        plan.directory,
        plan.repository,
        plan.destination,
        plan.side,
        plan.maxBytes ?? null,
        plan.manifestSha256,
        plan.commit,
        plan.payloads,
        plan.staging,
      ]),
    )
    .digest("hex");
}

async function absent(path: string): Promise<void> {
  const present = await lstat(path).then(
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
  invariant(!present, "Recovery destination already exists");
}

async function locations(options: RecoveryRestoreOptions) {
  invariant(
    options.side === "previous" || options.side === "incoming",
    "Recovery side must be previous or incoming",
  );
  const repository = await directory(options.repository);
  const transfer = await directory(options.directory);
  const destination = join(
    await directory(dirname(resolve(options.destination))),
    basename(resolve(options.destination)),
  );
  const common = await directory(
    (
      await git(repository, [
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ])
    ).trim(),
  );
  invariant(
    !inside(repository, destination) &&
      !inside(transfer, destination) &&
      !inside(common, destination),
    "Recovery destination must be outside the source repository, Git metadata and transfer",
  );
  await absent(destination);
  return { repository, directory: transfer, destination };
}

export async function planRecoveryRestore(
  options: RecoveryRestoreOptions,
): Promise<RecoveryRestorePlan> {
  const paths = await locations(options);
  const snapshot = await snapshotRecoveryTransfer(
    paths.directory,
    options.maxBytes,
  );
  try {
    const checks = await verifyRecoveryRestorability(
      snapshot.directory,
      snapshot.state,
      paths.repository,
    );
    invariant(
      checks.every((check) => check.status === "pass"),
      "Recovery Git restorability verification failed",
    );
    const plan = {
      ...options,
      ...paths,
      manifestSha256: snapshot.manifestSha256,
      commit:
        options.side === "previous"
          ? snapshot.state.previous
          : snapshot.state.next,
      payloads:
        options.side === "previous"
          ? snapshot.state.previousExtras
          : snapshot.state.incoming,
      staging:
        options.side === "previous"
          ? ("preserved" as const)
          : ("unavailable" as const),
    };
    return { ...plan, fingerprint: planFingerprint(plan) };
  } finally {
    await snapshot.dispose();
  }
}

async function applyPatch(
  checkout: string,
  patch: string,
  cached = false,
): Promise<void> {
  if (!(await lstat(patch)).size) return;
  await git(checkout, [
    "apply",
    "--binary",
    ...(cached ? ["--cached"] : []),
    patch,
  ]);
}

export async function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
): Promise<RecoveryRestoreResult> {
  invariant(
    plan.fingerprint === planFingerprint(plan),
    "Recovery plan changed after planning",
  );
  const paths = await locations(plan);
  invariant(
    paths.repository === plan.repository &&
      paths.directory === plan.directory &&
      paths.destination === plan.destination,
    "Recovery plan paths changed after planning",
  );
  const snapshot = await snapshotRecoveryTransfer(
    paths.directory,
    plan.maxBytes,
  );
  let owned = false;
  try {
    invariant(
      snapshot.manifestSha256 === plan.manifestSha256,
      "Recovery transfer changed since planning",
    );
    const commit =
      plan.side === "previous" ? snapshot.state.previous : snapshot.state.next;
    invariant(commit === plan.commit, "Recovery plan commit changed");
    const checks = await verifyRecoveryRestorability(
      snapshot.directory,
      snapshot.state,
      paths.repository,
    );
    invariant(
      checks.every((check) => check.status === "pass"),
      "Recovery Git restorability verification failed",
    );
    await mkdir(paths.destination, { mode: 0o700 });
    owned = true;
    await git(dirname(paths.destination), [
      "clone",
      "--local",
      "--no-hardlinks",
      "--no-checkout",
      "--",
      paths.repository,
      paths.destination,
    ]);
    await git(paths.destination, ["remote", "remove", "origin"]);
    if (snapshot.state.previous !== snapshot.state.next) {
      await git(paths.destination, [
        "bundle",
        "verify",
        join(snapshot.directory, "commits.bundle"),
      ]);
      await git(paths.destination, [
        "bundle",
        "unbundle",
        join(snapshot.directory, "commits.bundle"),
      ]);
    }
    await git(paths.destination, ["checkout", "--detach", commit]);
    await applyPatch(
      paths.destination,
      join(
        snapshot.directory,
        plan.side === "previous" ? "previous.patch" : "remote.patch",
      ),
    );
    if (plan.side === "previous")
      await applyPatch(
        paths.destination,
        join(snapshot.directory, "previous-index.patch"),
        true,
      );
    const entries =
      plan.side === "previous"
        ? snapshot.state.previousExtras
        : snapshot.state.incoming;
    const prefix = plan.side === "previous" ? "previous-files" : "incoming";
    for (const entry of entries) {
      const to = await safeDestination(paths.destination, entry);
      await absent(to);
      await mkdir(dirname(to), { recursive: true, mode: 0o700 });
      await cp(
        await safeDestination(snapshot.directory, `${prefix}/${entry}`),
        to,
        {
          dereference: false,
          verbatimSymlinks: true,
          force: false,
          errorOnExist: true,
        },
      );
    }
    return {
      directory: paths.destination,
      commit,
      side: plan.side,
      staging: plan.side === "previous" ? "preserved" : "unavailable",
      sourceRetained: true,
    };
  } catch (cause) {
    if (!owned) throw cause;
    throw new OutpostError(
      "workspace",
      "Recovery restoration failed; source and partial destination retained",
      { destination: paths.destination, transfer: paths.directory },
      cause,
    );
  } finally {
    await snapshot.dispose();
  }
}
