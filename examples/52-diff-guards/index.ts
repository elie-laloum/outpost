import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  dispatch,
  OutpostError,
  recoveryDetails,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

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

const repository = demoRepository(import.meta.dirname);
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();

const guard = {
  protectedPaths: [".github/**", "migrations/**"],
  maxChangedLines: 2,
};
console.log("Dépôt de démonstration :", repository);

const accepted = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: {
    text: 'Replace src/greeting.ts with exactly `export const greeting = "Bonjour";` followed by a newline. Change only that file and commit it.',
  },
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
      agent: coder,
      brief: {
        text: `Write ${JSON.stringify(path)} with exactly the contents of this JSON string: ${JSON.stringify(content)}. Create parent directories if needed. Change only that file and commit it.`,
      },
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
