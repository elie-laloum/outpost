import {
  scriptedAgent,
  createMemorySandboxProvider,
} from "../../dist/testing.js";
import type { SpeculativeValidation } from "../../dist/index.js";

export const memory = createMemorySandboxProvider();
export const agent = scriptedAgent({
  turns: [
    {
      text: "Candidate ready",
      usage: { input: 2, output: 1 },
      commit: {
        message: "Candidate change",
        files: { "candidate.txt": "ready" },
      },
    },
  ],
});
export const validate = ({ result }: SpeculativeValidation<unknown>) =>
  result.text === "Candidate ready";
