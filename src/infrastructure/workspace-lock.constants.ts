import { homedir, tmpdir, userInfo } from "node:os";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const workspaceLocksDirectory = join(
  tmpdir(),
  `outpost-path-locks-${createHash("sha256").update(`${userInfo().username}:${homedir()}`).digest("hex").slice(0, 24)}`,
);
export const workspaceLockAttempts = 100;
