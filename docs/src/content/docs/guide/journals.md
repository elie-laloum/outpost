---
title: "Journals"
description: "Keep a durable record of each dispatch and read it back."
---

Use dispatch journals for durable execution records, progress observers for live display, and telemetry for instrumentation.

```ts
import {
  dispatch,
  createLocalTransport,
  readJournal,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  console.log(
    await readJournal({ transporter, reference: result.logReference }),
  );
}
```

## Journal options

`logging: false` disables journaling. `"stdout"` selects stdout logging. An object selects a transport, optional `verbose` raw-event retention and optional `replayable` commit recording for [record and replay](../record-replay/). The returned `logReference` pins the journal index revision; `readJournal()` verifies linked segments and returns committed events in order.

An open journal exposes its committed prefix. `maxEntries` and `maxBytes` bound reads. Logs and transcripts can contain private repository content, so store and share them deliberately.
