---
title: "Preflight checks"
description: "Diagnose prerequisites before paying for a model call."
---

Run `doctor` for the provider and agent you intend to use.

```sh
npx outpost doctor --sandbox-provider docker --agent codex --image outpost:dev --json
```

The report separates available, unsupported and failing capabilities. Fix the reported executable, image or engine problem before retrying a dispatch.

Interrupting `doctor` stops its active host probe and its descendants. SIGINT exits with status 130; SIGTERM exits with status 143. Image diagnostics also clean up their temporary container.

## Diagnose an owned sandbox

`sandbox.diagnose()` inspects an existing sandbox under its operation gate. The diagnostic does not own or close the sandbox. Do not run it concurrently with another command on that same sandbox.

`diagnoseAgentProtocol()` checks recorded protocol fixtures. It does not authenticate a real account or prove that a live model is available.

## Interpret validation

A passing local preflight is not a paid model test. Cloud SDK configuration, real provider allocation and live model availability are separate checks. Use a small non-mutating first request after setup, and inspect its actual outcome.

API: [diagnoseSandbox](../../reference/diagnosesandbox/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/).
