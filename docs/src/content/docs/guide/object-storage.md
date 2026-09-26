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
import { s3Transport } from "@elie-laloum/outpost/transports/s3";
import { artifactStore } from "@elie-laloum/outpost";

const client = new S3Client({ region: "eu-west-1" });
const transporter = s3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "reviews/",
});
const store = artifactStore({ transporter });
```

Replace the bucket and region with your deployment. Configure credentials on the host-side S3 client; they are not forwarded to agents. Destroy the client only after all stores and operations using it have finished.

## Share a transport

Pass the transport to artifact and checkpoint stores, `logging.transporter`, `activityTransport`, `recoveryTransport` or a transport conversation store according to what you want to persist. Use an isolated prefix and storage policy for these objects.

## Compatibility

An S3-compatible endpoint must implement the required conditional operations and paginated listing, not merely basic upload/download. Revisions fence stale writers. They do not authenticate actors, prove remote process liveness or make incomplete task replay safe automatically.

API: [s3Transport](../../reference/s3transport/).
