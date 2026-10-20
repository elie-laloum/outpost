---
title: "Answer questions and approve recipe work"
description: "Handle durable approvals and agent questions in a terminal or from another application."
---

Start with the checkpoint and approval from [Save and resume a recipe](../recipe-durability/). Pending requests and accepted answers survive process restarts.

## Respond in the terminal

Run without `--json` to handle questions automatically when stdin and stderr are terminals. For the saved example, resume its existing run:

```sh
npx outpost recipe resume --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change
```

The CLI shows saved evidence, offers approval or rejection and asks for a reason. Leaving pending is the default. A single allowed actor is selected automatically; several actors offer a choice. Actor selection declares a trusted local identity, not a login.

Ctrl+C keeps the request pending. Resume presents it again without replaying completed turns. Signed gates still require an external signature proof.

## Submit a decision from a file

For automation, use `--no-interactive` or `--json`. Read the saved request IDs from the report and write a [WorkflowDecision](../../reference/workflowdecision/) to `decision.json`, including an authorized actor and reason. Signed gates also require their original proof.

```sh
npx outpost recipe decide --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --decision decision.json --json
```

A service accepting decisions must authenticate its callers before supplying trusted actor metadata. A client-provided actor name alone is not authentication. See [signed approvals](../signed-approvals/) for verifier setup.

## Let an agent ask questions

Use the Git configuration and `writer` role from [agent setup](../recipe-configuration/), prepare its Codex image, and keep the checkpoint `transports` and `stores`. Add this item under `tasks` in the checkpointed recipe. The agent must support portable conversation capture and resume.

```yaml title="recipe.yaml — interactive task"
- key: clarify
  interactive:
    repository: ./project
    sandboxProvider: { type: docker, image: outpost-codex:dev }
    agent: { $ref: agents.writer }
    brief: Clarify the requested change before implementing it.
    actors: [maintainer]
```

Interactive tasks retain their named workspace and release the sandbox before presenting a question. With a terminal, the CLI collects answers and continues the saved conversation. See [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) for the complete contract.

For a headless client, write a [WorkflowAnswer](../../reference/workflowanswer/) with the saved execution, task and request IDs, actor and answer value, then submit it:

```sh
npx outpost recipe answer --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --answer answer.json --json
```

`--interactive --json` explicitly combines terminal prompts on stderr with one final JSON report on stdout. The [CLI reference](../recipe-cli/) lists actor and interaction flags.
