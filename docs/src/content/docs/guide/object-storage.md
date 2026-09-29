---
title: "Object storage"
description: "Use an S3 transport for durable Outpost objects."
---

Install the optional AWS SDK and configure an existing private bucket with conditional PUT and DELETE support.

```sh
npm install @aws-sdk/client-s3
```

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { createArtifactStore } from "@elie-laloum/outpost";

const client = new S3Client({ region: "eu-west-1" });
const transporter = createS3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "reviews/",
});
const store = createArtifactStore({ transporter });
```

Replace the bucket and region with your deployment. Configure credentials on the host-side S3 client; they are not forwarded to agents. Destroy the client only after all stores and operations using it have finished.

## Share a transport

Pass the transport to artifact and checkpoint stores, `logging.transporter`, `activityTransport`, `recoveryTransport` or a transport conversation store according to what you want to persist. Use an isolated prefix and storage policy for these objects.

## Compatibility

An S3-compatible endpoint must implement the required conditional operations and paginated listing, not merely basic upload/download. Revisions fence stale writers. They do not authenticate actors, prove remote process liveness or make incomplete task replay safe automatically.

## Cloudflare R2

R2 supports conditional PUT, but the live validation found that DELETE accepts stale `If-Match` values. Select logical deletion explicitly:

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const client = new S3Client({
  region: "auto",
  endpoint: "https://<account-id>.r2.cloudflarestorage.com",
});
const transporter = createS3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "reviews/",
  deleteMode: "tombstone",
});
```

Configure the client credentials as above. In this mode, `remove` writes a fresh deletion marker with conditional PUT. Stale revisions fail; `read` returns absence and `list` omits deleted keys. A create with `ifRevision: null` can replace a marker conditionally, so concurrent recreations still have one winner. Empty payloads remain regular live objects.

All writers sharing a prefix must use `deleteMode: "tombstone"`. Stop existing writers before switching modes. The default `"conditional"` mode remains appropriate only for services with atomic conditional DELETE support.

Logical deletion retains a 1 KiB marker per deleted key and adds HEAD requests when creating and listing objects. Listing observes current objects, not a transactionally consistent snapshot. Markers remain billable physical objects despite disappearing from transport inventories and logical storage usage. Do not automatically expire or purge them while writers can still run: physical deletion could erase a concurrent recreation. Only an explicit maintenance operation after stopping all writers may remove them from the bucket.

API: [createS3Transport](../../reference/creates3transport/).
