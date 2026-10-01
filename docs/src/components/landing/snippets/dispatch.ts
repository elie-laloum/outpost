import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests and commit." },
});

console.log(result.text);
console.log(result.branch, result.commits.length);
