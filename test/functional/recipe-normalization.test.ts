import assert from "node:assert/strict";
import { test } from "node:test";
import { defineRecipe } from "../../src/application/recipe.ts";
import { createSandbox } from "../../src/application/sandbox.ts";
import {
  createScriptedAgent,
  createMemorySandboxProvider,
} from "../../src/testing.ts";
import { recipeObject } from "../../src/domain/recipes/values.ts";
import { repository } from "../helpers.ts";

test("one recipe compiler retains literal v1 briefs, single-pass references and native versus JSON results", async (t) => {
  const root = await repository(t);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createMemorySandboxProvider({
      commands: [{ executable: "echo", arguments: ["still owned by caller"] }],
    }),
    logging: false,
  });
  for (const version of [1, 2, 3]) {
    const briefs: string[] = [];
    const source = JSON.stringify({
      version,
      name: "version-contracts",
      ...(version === 1
        ? {}
        : { inputs: { goal: { type: "string", description: "Goal" } } }),
      tasks: [
        { key: "analyze", agent: "reviewer", brief: "{{ inputs.goal }}" },
        {
          key: "fix",
          after: ["analyze"],
          agent: "coder",
          brief: "Use {{ steps.analyze.text }}",
        },
      ],
    });
    const workflow = defineRecipe(source, {
      sandbox: {
        ...sandbox,
        dispatch(options) {
          briefs.push(options.brief.text ?? "");
          return sandbox.dispatch(options);
        },
      },
      ...(version === 1
        ? {}
        : { inputs: { goal: "Literal {{ steps.analyze.text }}" } }),
      agents: {
        reviewer: createScriptedAgent({
          turns: [{ text: "literal {{ inputs.goal }}" }],
        }),
        coder: createScriptedAgent({ turns: [{ text: "Done" }] }),
      },
    });
    if (version !== 3)
      assert.throws(
        () => workflow.start({ concurrency: 2 }),
        /requires concurrency 1/,
      );
    const result = await workflow.start({ concurrency: version === 3 ? 2 : 1 });
    result.unwrap();
    assert.deepEqual(
      briefs,
      version === 1
        ? ["{{ inputs.goal }}", "Use {{ steps.analyze.text }}"]
        : ["Literal {{ steps.analyze.text }}", "Use literal {{ inputs.goal }}"],
    );
    const output = result.value(workflow.tasks[1]!);
    assert.ok(recipeObject(output));
    assert.equal(output.text, "Done");
    assert.equal(
      typeof output.resume,
      version === 3 ? "undefined" : "function",
    );
    assert.equal(
      typeof output.report,
      version === 3 ? "undefined" : "function",
    );
    assert.equal(Object.isFrozen(workflow), version !== 3);
  }
  assert.equal(
    (
      await sandbox.command({
        executable: "echo",
        arguments: ["still owned by caller"],
      })
    ).status,
    0,
  );
});
