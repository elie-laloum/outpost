// Turns a demo's `repo/` folder into a real Git repository, in examples/.repos/<demo>.
// The copy is created only once: rerunning the demo reuses the same repository.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

export function demoRepository(demoDirectory: string): string {
  const target = join(
    import.meta.dirname,
    "..",
    ".repos",
    basename(demoDirectory),
  );

  if (!existsSync(target)) {
    cpSync(join(demoDirectory, "repo"), target, { recursive: true });

    const git = (...args: string[]) =>
      execFileSync("git", args, { cwd: target, stdio: "pipe" });
    git("init", "-b", "main");
    git("config", "user.name", "Outpost demo");
    git("config", "user.email", "demo@example.invalid");
    git("add", ".");
    git("commit", "-m", "Initial commit");
  }

  return target;
}
