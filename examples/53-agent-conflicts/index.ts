import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createAgentConflictResolver,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  openWorkspace,
  OutpostError,
  recoveryDetails,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [
      createHarnessFileTools(),
      createHarnessEditTools(),
      createHarnessShellTools(),
    ],
  }),
});
const state = join(import.meta.dirname, "state");
await mkdir(state, { recursive: true });

for (const failedVerification of [false, true]) {
  const repository = await mkdtemp(join(state, "run-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
  git("init", "-b", "main");
  git("config", "user.name", "Outpost demo");
  git("config", "user.email", "demo@example.invalid");
  await writeFile(join(repository, "greeting.txt"), "Hi!\n");
  git("add", ".");
  git("commit", "-m", "Initial");
  await using workspace = await openWorkspace({
    repository,
    branch: { mode: "integrate" },
    guard: { maxChangedLines: 10 },
  });
  await writeFile(join(workspace.directory, "greeting.txt"), "Bonjour!\n");
  execFileSync("git", ["commit", "-am", "French greeting"], {
    cwd: workspace.directory,
  });
  await writeFile(join(repository, "greeting.txt"), "Hello!\n");
  git("commit", "-am", "English greeting");
  const hostCommit = git("rev-parse", "HEAD");
  console.log("Repository:", repository);
  try {
    const result = await workspace.integrate({
      onConflict: createAgentConflictResolver(coder, {
        sandboxProvider,
        logging: false,
        instructions:
          "Combine both greetings as exactly Hello, Bonjour! followed by a newline.",
        verify: {
          executable: "node",
          arguments: [
            "--input-type=module",
            "-e",
            failedVerification
              ? "process.exit(7)"
              : "import {readFileSync} from 'node:fs';if(readFileSync('greeting.txt','utf8')!=='Hello, Bonjour!\\n')process.exit(1);",
          ],
        },
      }),
    });
    console.log("Integrated verified commit:", result?.commit);
    console.log("Resolution usage:", result?.usage);
    console.log(await readFile(join(repository, "greeting.txt"), "utf8"));
  } catch (error) {
    const verification =
      error instanceof OutpostError ? error.details.verification : undefined;
    if (
      !failedVerification ||
      typeof verification !== "object" ||
      verification === null ||
      !("status" in verification) ||
      verification.status !== 7
    )
      throw error;
    if (git("rev-parse", "HEAD") !== hostCommit)
      throw new Error("Failed verification moved the host branch");
    console.log("Verification refused integration; host unchanged.");
    console.log("Retained work:", recoveryDetails(error));
  }
}
