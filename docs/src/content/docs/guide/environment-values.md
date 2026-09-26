---
title: "Environment values"
description: "Pass only the variables each execution needs."
---

Pass `variables` on the provider for sandbox-wide values, on the harness for agent-specific values, or on a command for that invocation.

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
  image: "outpost:dev",
  variables: { NODE_ENV: "test", CI: "true" },
});
```

Values are strings. Do not spread `process.env` into a provider: select required names explicitly. A missing required credential is an error, not a request to try another authentication mode.

## Generated projects

`outpost init` creates `.env.example`. Copy the declarations you need into `.env`. A nonempty value is used directly; an empty declaration reads the matching process variable. Only declared names are forwarded by the generated script.

The generated script resolves its environment file, brief and relative repository path from its own directory. It does not require launching from that directory.

## Host and sandbox

The host needs allocation and storage credentials. The agent needs model access. Put these credentials at the correct boundary instead of forwarding all of them into the sandbox. See [Account and API access](../access-credentials/).

API: [Variables](../../reference/variables/).
