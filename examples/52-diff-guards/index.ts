import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { dispatch, OutpostError, recoveryDetails } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { createDemoCoder } from "./demo-coder.ts";

const state = join(import.meta.dirname, "state");
await mkdir(state, { recursive: true });
const repository = await mkdtemp(join(state, "run-"));
await cp(join(import.meta.dirname, "repo"), repository, { recursive: true });
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
git("init", "-b", "main");
git("config", "user.name", "Outpost demo");
git("config", "user.email", "demo@example.invalid");
git("config", "core.autocrlf", "false");
git("add", ".");
git("commit", "-m", "Initial commit");

const sandboxProvider = createLocalSandboxProvider();
const guard = {
  protectedPaths: [".github/**", "migrations/**"],
  maxChangedLines: 2,
};
console.log("Dépôt de démonstration :", repository);

const accepted = await dispatch({
  repository,
  sandboxProvider,
  agent: createDemoCoder(
    "src/greeting.ts",
    'export const greeting = "Bonjour";\n',
  ),
  brief: { text: "Update the greeting and commit it." },
  branch: { mode: "integrate" },
  guard,
  logging: false,
});
console.log("1. intégration acceptée :", accepted.commits);
console.log(await readFile(join(repository, "src/greeting.ts"), "utf8"));

const scenarios = [
  ["2. chemin protégé", ".github/workflows/ci.yml", "name: demo\n"],
  [
    "3. diff trop volumineux",
    "src/report.ts",
    "export const report = [\n  1,\n  2,\n  3,\n];\n",
  ],
] as const;

for (const [label, path, content] of scenarios) {
  const hostCommit = git("rev-parse", "HEAD");
  try {
    await dispatch({
      repository,
      sandboxProvider,
      agent: createDemoCoder(path, content),
      brief: { text: "Make the demonstration change and commit it." },
      branch: { mode: "integrate" },
      guard,
      logging: false,
    });
    throw new Error("Expected the diff guard to refuse this change");
  } catch (error) {
    if (!(error instanceof OutpostError) || error.code !== "guard") throw error;
    if (git("rev-parse", "HEAD") !== hostCommit)
      throw new Error("The rejected change modified the host branch");
    console.log(`${label} : ${error.code}`);
    console.log("  violations :", error.details);
    console.log("  travail conservé :", recoveryDetails(error));
  }
}
