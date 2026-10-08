---
title: Available YAML components
description: Generated mapping of YAML components, TypeScript contracts and ownership.
---

These declarations come from the registry used to validate and execute recipes. Declare a component with `type` or reuse it with `$ref` from local configuration. The [YAML recipes guide](../yaml-recipes/) explains families and extensions; [advanced composition](../recipe-advanced/) covers speculation and resolvers.

Identifiers read as `category.type`. The `*Options.options` rows represent document sections: `workflow`, `workspace`, `integration` or task options. Detailed properties retain the TypeScript contracts linked from the guides. The editor schema and `recipes/components.json` list their fields and callback references.

A component marked “runtime” is closed by the runtime; “value” denotes configuration, an allocation-free factory or an object without its own cleanup. Owned dependencies close in reverse order, with observers last. Borrowed exports always remain caller-owned. Experimental activation requires `experimental: true` in configuration.

| Identifier                    | Category              | Cleanup | Lot | Status       |
| ----------------------------- | --------------------- | ------- | --- | ------------ |
| `agent.composed`              | `agent`               | value   | 2   | implemented  |
| `agent.fallback`              | `agent`               | value   | 3   | implemented  |
| `agent.replay`                | `agent`               | value   | 3   | implemented  |
| `artifact.binary`             | `artifact`            | value   | 5   | implemented  |
| `artifact.json`               | `artifact`            | value   | 5   | implemented  |
| `artifactStore.transport`     | `artifactStore`       | value   | 5   | implemented  |
| `artifactTaskOptions.options` | `artifactTaskOptions` | value   | 5   | implemented  |
| `callOptions.options`         | `callOptions`         | value   | 4   | implemented  |
| `checkpointStore.transport`   | `checkpointStore`     | value   | 5   | implemented  |
| `context.custom`              | `context`             | value   | 3   | implemented  |
| `context.summarize`           | `context`             | value   | 3   | implemented  |
| `context.truncate`            | `context`             | value   | 3   | implemented  |
| `conversations.bundle`        | `conversations`       | value   | 3   | implemented  |
| `conversations.claude`        | `conversations`       | value   | 3   | implemented  |
| `conversations.codex`         | `conversations`       | value   | 3   | implemented  |
| `conversations.copilot`       | `conversations`       | value   | 3   | implemented  |
| `conversations.harness`       | `conversations`       | value   | 3   | implemented  |
| `conversations.kimi`          | `conversations`       | value   | 3   | implemented  |
| `conversations.transcript`    | `conversations`       | value   | 3   | implemented  |
| `conversations.transport`     | `conversations`       | value   | 3   | implemented  |
| `cron.schedule`               | `cron`                | value   | 6   | implemented  |
| `decision.questions`          | `decision`            | value   | 3   | implemented  |
| `decisionProvider.system-one` | `decisionProvider`    | value   | 3   | implemented  |
| `decisionTaskOptions.options` | `decisionTaskOptions` | value   | 4   | implemented  |
| `dispatchOptions.options`     | `dispatchOptions`     | value   | 3   | implemented  |
| `gateOptions.options`         | `gateOptions`         | value   | 5   | implemented  |
| `harness.agy`                 | `harness`             | value   | 2   | implemented  |
| `harness.claude`              | `harness`             | value   | 2   | implemented  |
| `harness.codex`               | `harness`             | value   | 2   | implemented  |
| `harness.copilot`             | `harness`             | value   | 2   | implemented  |
| `harness.kimi`                | `harness`             | value   | 2   | implemented  |
| `harness.outpost`             | `harness`             | value   | 3   | implemented  |
| `hook.custom`                 | `hook`                | value   | 3   | implemented  |
| `instructions.mcp`            | `instructions`        | value   | 3   | implemented  |
| `instructions.source`         | `instructions`        | value   | 3   | implemented  |
| `integrationOptions.options`  | `integrationOptions`  | value   | 7   | implemented  |
| `interactiveOptions.options`  | `interactiveOptions`  | value   | 5   | implemented  |
| `isolatedOptions.options`     | `isolatedOptions`     | value   | 4   | implemented  |
| `job.recipe`                  | `job`                 | value   | 6   | implemented  |
| `job.workflow`                | `job`                 | value   | 6   | implemented  |
| `loopOptions.options`         | `loopOptions`         | value   | 4   | implemented  |
| `modelProvider.anthropic`     | `modelProvider`       | value   | 3   | implemented  |
| `modelProvider.openai`        | `modelProvider`       | value   | 3   | implemented  |
| `observation.hub`             | `observation`         | runtime | 1   | implemented  |
| `permissions.rules`           | `permissions`         | value   | 3   | implemented  |
| `profile.portable`            | `profile`             | value   | 2   | implemented  |
| `queue.bullmq`                | `queue`               | runtime | 6   | implemented  |
| `queue.http`                  | `queue`               | value   | 6   | implemented  |
| `queue.sqlite`                | `queue`               | runtime | 6   | implemented  |
| `queuedOptions.options`       | `queuedOptions`       | value   | 6   | implemented  |
| `resolver.agent`              | `resolver`            | value   | 7   | implemented  |
| `response.json`               | `response`            | value   | 3   | implemented  |
| `response.text`               | `response`            | value   | 3   | implemented  |
| `routing.decision`            | `routing`             | value   | 3   | implemented  |
| `sandboxOptions.options`      | `sandboxOptions`      | value   | 2   | implemented  |
| `sandboxProvider.daytona`     | `sandboxProvider`     | value   | 2   | implemented  |
| `sandboxProvider.docker`      | `sandboxProvider`     | value   | 2   | implemented  |
| `sandboxProvider.firecracker` | `sandboxProvider`     | value   | 2   | experimental |
| `sandboxProvider.local`       | `sandboxProvider`     | value   | 2   | implemented  |
| `sandboxProvider.mounted`     | `sandboxProvider`     | value   | 7   | implemented  |
| `sandboxProvider.podman`      | `sandboxProvider`     | value   | 2   | implemented  |
| `sandboxProvider.remote`      | `sandboxProvider`     | value   | 7   | implemented  |
| `sandboxProvider.vercel`      | `sandboxProvider`     | value   | 2   | implemented  |
| `schedule.cron`               | `schedule`            | value   | 6   | implemented  |
| `secretSource.aws`            | `secretSource`        | value   | 2   | implemented  |
| `secretSource.azure`          | `secretSource`        | value   | 2   | implemented  |
| `secretSource.gcp`            | `secretSource`        | value   | 2   | implemented  |
| `secretSource.infisical`      | `secretSource`        | value   | 2   | implemented  |
| `secretSource.onepassword`    | `secretSource`        | value   | 2   | implemented  |
| `secretSource.vault`          | `secretSource`        | value   | 2   | implemented  |
| `service.queue`               | `service`             | value   | 6   | implemented  |
| `service.schedules`           | `service`             | value   | 6   | implemented  |
| `service.triggers`            | `service`             | value   | 6   | implemented  |
| `service.worker`              | `service`             | value   | 6   | implemented  |
| `sink.console`                | `sink`                | value   | 1   | implemented  |
| `sink.custom`                 | `sink`                | runtime | 7   | implemented  |
| `sink.opentelemetry`          | `sink`                | runtime | 7   | implemented  |
| `sink.reporter`               | `sink`                | value   | 7   | implemented  |
| `sink.run`                    | `sink`                | runtime | 5   | implemented  |
| `skill.custom`                | `skill`               | value   | 3   | implemented  |
| `speculationOptions.options`  | `speculationOptions`  | value   | 7   | experimental |
| `steering.controller`         | `steering`            | value   | 3   | implemented  |
| `taskCacheStore.transport`    | `taskCacheStore`      | value   | 5   | implemented  |
| `taskOptions.options`         | `taskOptions`         | value   | 4   | implemented  |
| `tool.custom`                 | `tool`                | value   | 3   | implemented  |
| `tool.subagent`               | `tool`                | value   | 3   | implemented  |
| `toolset.custom`              | `toolset`             | value   | 3   | implemented  |
| `toolset.edit`                | `toolset`             | value   | 3   | implemented  |
| `toolset.files`               | `toolset`             | value   | 3   | implemented  |
| `toolset.git`                 | `toolset`             | value   | 3   | implemented  |
| `toolset.search`              | `toolset`             | value   | 3   | implemented  |
| `toolset.shell`               | `toolset`             | value   | 3   | implemented  |
| `transport.local`             | `transport`           | value   | 2   | implemented  |
| `transport.s3`                | `transport`           | value   | 5   | implemented  |
| `triggerMapper.job`           | `triggerMapper`       | value   | 6   | implemented  |
| `triggerSource.github`        | `triggerSource`       | value   | 6   | implemented  |
| `triggerSource.gitlab`        | `triggerSource`       | value   | 6   | implemented  |
| `triggerSource.slack`         | `triggerSource`       | value   | 6   | implemented  |
| `triggerSource.standard`      | `triggerSource`       | value   | 6   | implemented  |
| `variables.secrets`           | `variables`           | value   | 2   | implemented  |
| `verifier.ed25519`            | `verifier`            | value   | 5   | implemented  |
| `workflowOptions.options`     | `workflowOptions`     | value   | 4   | implemented  |

Coverage describes local composition, not validation of every remote service. Tests use simulated agents, local HTTP models, real Git, Docker and Redis; paid calls, clouds and remote secret managers remain without live validation.
