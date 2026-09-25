---
title: "Outpost"
description: "Run a coding agent, understand its workspace, then build a workflow."
---

Outpost is a TypeScript library and CLI that runs coding agents in sandboxes, keeps their Git work organized and connects their results in typed workflows.

**Start with a small result:** fix a failing test in a disposable text-processing project. Choose Codex or Claude, run the generated script, then inspect the commit.

[Run your first agent →](guide/start/quickstart/)

<span id="choose-your-next-step"></span>
<span id="how-to-use-these-docs"></span>

## Two ways to read

| Learn by doing                                                                           | Look up an exact behavior                                                                                               |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| The [Guide](guide/) walks from one agent task to reusable environments and workflows.    | The [Reference](reference/) explains APIs, CLI commands, configuration and limits.                                      |
| Every practical example includes its own preparation, complete code and expected result. | Signatures follow the package declarations; detailed contracts remain available without interrupting the learning path. |

Already know the basics? Pick a [cookbook recipe](guide/cookbook/) or [diagnose a failure](guide/operations/troubleshooting/).

## What you need

Node.js 24+, Git and Docker for the first agent run. Choose account access or an API key explicitly; API billing is separate from a subscription. The initial image download/build can take several minutes. Subsequent examples reuse that preparation while remaining independently reproducible.

Workflow, validation and persistence examples also run [without a model or container](guide/cookbook/offline/).

English and French cover the same features. The public site follows the latest stable release; the [changelog](project/changelog/) records releases and the [roadmap](project/roadmap/) distinguishes planned work.
