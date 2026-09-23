import { imageRecipe } from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";
import { starter, tracker } from "./starters.ts";

export function scaffoldFiles(
  options: InitOptions,
  extension: string,
): Record<string, string> {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker",
    template = options.template ?? "blank";
  const files: Record<string, string> = {
    [`run.${extension}`]: starter(options, extension),
    "brief.md":
      "Objective: {{OBJECTIVE}}\n\nWork on {{WORK_BRANCH}} from {{BASE_BRANCH}}. Inspect the repository, implement the objective, run relevant tests and commit your changes. When finished, write <outpost>done</outpost>.\n",
    ".env.example":
      (agent === "codex" ? "OPENAI_API_KEY=\n" : "ANTHROPIC_API_KEY=\n") +
      (options.tracker === "github" ? "GH_TOKEN=\n" : ""),
    ".gitignore": ".env\nworkspaces/\nlocks/\nrecovery/\nlogs/\n",
  };
  if (provider === "docker" || provider === "podman")
    files[provider === "docker" ? "Dockerfile" : "Containerfile"] =
      options.tracker === "beads"
        ? imageRecipe.replace(
            "RUN groupmod",
            "RUN npm install -g --allow-scripts=@beads/bd @beads/bd@1.2.2\nRUN groupmod",
          )
        : imageRecipe;
  if (template !== "blank")
    files["STANDARDS.md"] =
      "# Engineering standards\n\nKeep domain rules separate from infrastructure. Test observable behavior, handle failure and cancellation, and preserve existing user changes. Run the repository checks before committing. Prefer clear names to comments; keep necessary comments at most two lines. Review the complete diff against the supplied base commit.\n";
  if (options.tracker)
    files[`tickets.${extension}`] = tracker(options.tracker, options.label);
  if (options.tracker === "custom")
    files["TRACKER.md"] =
      `# Custom issue tracker\n\nSet OUTPOST_TRACKER_URL in the host environment before running the starter. Implement GET issues?state=open (Issue[]), GET issues/:id (Issue), and POST issues/:id/close (any successful status). Issue has id, title, optional body and optional blockedBy ids. The generated tickets.${extension} is yours to adapt: add authentication, pagination and filtering for your tracker there. Never commit credentials.\n\nThe campaign reloads the backlog each cycle, reads an issue before implementation, and closes it only after its commits reach the host branch. Configure authentication in tickets.${extension}. A failed close is reported and must be reconciled before rerunning.\n`;

  return files;
}
