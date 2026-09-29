// The tools the agent can call.

import {
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessShellTools,
  defineHarnessTool,
  defineHarnessToolset,
} from "@elie-laloum/outpost";


// A custom tool: a name, a description read by the model, an input schema
// and a function that runs in the sandbox.
export const countLines = defineHarnessTool({
  name: "count_lines",
  description: "Count the lines of a file in the repository.",
  readOnly: true,
  input: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
    additionalProperties: false,
  },

  async execute(input: { path: string }, { sandbox, signal }) {
    const result = await sandbox.invoke({ executable: "wc", arguments: ["-l", input.path], signal });

    return result.status === 0 ? result.stdout : { content: result.stderr, isError: true };
  },
});


// The tools provided by Outpost, grouped with ours into a single set.
export const workbench = defineHarnessToolset({
  name: "workbench",
  tools: [
    createHarnessFileTools(),   // read_file, list_files
    createHarnessSearchTools(), // search
    createHarnessEditTools(),   // write_file, edit_file
    createHarnessShellTools(),  // shell
    countLines,
  ],
});
