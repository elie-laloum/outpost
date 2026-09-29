---
title: "S3 and R2"
description: "Keep checkpoints, artifacts, journals and conversations in an S3 bucket or Cloudflare R2, so any machine can resume or read them."
---

## Create the transport

Install the AWS SDK, an optional dependency used only by this transport.

```sh
npm install @aws-sdk/client-s3
```

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createWorkflowCheckpointStore } from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const transporter = createS3Transport({
  client: new S3Client({ region: "eu-west-1" }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
const checkpoints = createWorkflowCheckpointStore({ transporter });
```

`transporter` replaces `createLocalTransport()` wherever a [transport](../storage/) is accepted. Every object lands under `outpost/` in the bucket.

| Option       | Default         | Meaning                                                                                           |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------- |
| `client`     | Required        | Your `S3Client`, with region, credentials and endpoint.                                           |
| `bucket`     | Required        | An existing private bucket.                                                                       |
| `prefix`     | Bucket root     | Key prefix for Outpost objects. Keep unrelated objects outside it.                                |
| `deleteMode` | `"conditional"` | `"conditional"` deletes with a conditional DELETE; `"tombstone"` is for [R2](#use-cloudflare-r2). |

## Prepare the bucket

Create the bucket first: Outpost does not create it. The endpoint must support these operations, not only upload and download.

<!-- features -->

- **Conditional PUT**: `If-None-Match: *` to create a key, `If-Match` to replace it.
- **Conditional DELETE**: `If-Match` on removal, in the default `"conditional"` mode.
- **Paginated listing**: `ListObjectsV2` with continuation tokens.

## Pass it to the stores

One transport serves every store. Pass it where you want each kind of object kept.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import {
  createArtifactStore,
  createWorkflowCheckpointStore,
  dispatch,
} from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createS3Transport({
  client: new S3Client({ region: "eu-west-1" }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
export const checkpoints = createWorkflowCheckpointStore({ transporter });
export const artifacts = createArtifactStore({ transporter });

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Update the changelog for the last release." },
  logging: { transporter },
  activityTransport: transporter,
  recoveryTransport: transporter,
});
```

<!-- features -->

- [Checkpoints](../durable-runs/): Resume a workflow run from another machine.
  - `createWorkflowCheckpointStore()`
- [Artifacts](../artifacts/): Share task outputs by reference.
  - `createArtifactStore()`
- [Journals](../journals/): Keep the dispatch journal.
  - `logging.transporter`
- [Conversations](../conversations/): Archive captures to resume them anywhere.
  - `createTransportConversations()`
- [Recovery archives](../recovery/): Back up remote changes before applying them.
  - `recoveryTransport`
- [Sandbox activity](../retention/): Record which sandboxes are in use.
  - `activityTransport`

## Keep credentials on the host

The `S3Client` runs in your Node.js process. Its credentials never reach the sandbox or the agent. Configure them as for any AWS SDK client, and close the client only after every store using it has finished: Outpost never closes it.

## Use Cloudflare R2

R2 accepts a DELETE whose `If-Match` is stale, so a conditional DELETE cannot stop a concurrent writer. Select `deleteMode: "tombstone"`.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const transporter = createS3Transport({
  client: new S3Client({
    region: "auto",
    endpoint: "https://<account-id>.r2.cloudflarestorage.com",
  }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
  deleteMode: "tombstone",
});
```

Removing a key writes a deletion marker with a conditional PUT. Reads and listings hide markers, and creating the key again replaces its marker, still conditionally.

Each marker stays in the bucket as a billed 1 KiB object. Creating a key adds one HEAD request, and listing adds one HEAD per object.

:::caution
Every writer sharing a prefix must use the same `deleteMode`: stop them all before switching. Never expire or purge markers while a writer can run, since a purge can erase a concurrent recreation.
:::

## Limits

- **Fencing, not identity**: Revisions reject stale writers; they do not authenticate who wrote.
- **No snapshot**: A listing shows current objects, not a consistent view of the prefix.
- **Local files remain**: Git worktrees, execution staging and native conversations still need a local filesystem ([Where data lives](../storage/)).

API: [createS3Transport](../../reference/creates3transport/) · [S3TransportOptions](../../reference/s3transportoptions/) · [Transport](../../reference/transport/).
