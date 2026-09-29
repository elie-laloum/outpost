// Instructions tell the model what to do; permissions and hooks enforce it.

import {
  defineHarnessHook,
  defineHarnessPermissions,
} from "@elie-laloum/outpost";

// Permissions: the first matching rule decides, otherwise `default`.
export const permissions = defineHarnessPermissions({
  default: "allow",
  rules: [
    {
      effect: "deny",
      tools: ["write_file", "edit_file"],
      paths: ["**/*.test.ts"],
      reason: "Tests are read-only.",
    },
    { effect: "deny", commands: ["git push*"], reason: "Never publish." },
  ],
});

// Hooks: code that runs at a specific point in the loop.
let testsRan = false;

export const hooks = [
  // After each tool call: spot an `npm test` run.
  defineHarnessHook({
    on: "after-tool",
    run({ call }) {
      if (
        call.name === "shell" &&
        JSON.stringify(call.input).includes("npm test")
      )
        testsRan = true;
    },
  }),

  // When about to stop: refuse until the tests have run.
  defineHarnessHook({
    on: "stop",
    run: () =>
      testsRan ? undefined : { continue: "Run `npm test` before you finish." },
  }),
];
