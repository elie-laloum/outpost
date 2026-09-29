---
title: "Multiple repositories"
description: "Give each repository its own sandbox and connect results."
---

Use one `defineIsolatedTask` per repository. Each task owns its dispatch lifecycle, while the workflow controls dependencies and concurrency.

```ts
import { defineIsolatedTask, defineWorkflow } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const review = (key: string, repository: string) =>
  defineIsolatedTask({
    key,
    request: ({ signal }) => ({
      repository,
      sandboxProvider,
      agent: coder,
      signal,
      branch: { mode: "named", name: `review/${key}` },
      brief: { text: "Review the public API without editing files." },
    }),
  });
const api = review("api", "/projects/api");
const web = review("web", "/projects/web");
const result = await defineWorkflow("repositories", [api, web]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(api).text, result.value(web).text);
```

Replace the two absolute paths with existing checkouts. Distinct named branches keep review work separate.

## Order related work

Add `after: [api]` to the web task when it needs the API result, then read it through `context.value(api)` inside `request`. This dependency orders the operations; it does not merge their Git histories or give them a shared checkout.

## Partial failure

One repository can succeed while another fails. Review each task’s result and retained workspace before rerunning. There is no multi-repository rollback or automatic push. Put final publication behind a separate application-controlled gate.

API: [defineIsolatedTask](../../reference/defineisolatedtask/).
