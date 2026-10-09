export const workspaceRecoverySchema = {
  type: "object",
  additionalProperties: {
    type: "object",
    additionalProperties: false,
    required: ["expectedRevision", "processesStopped"],
    properties: {
      expectedRevision: { type: "string", minLength: 1 },
      processesStopped: { const: true },
      allocationReleased: { const: true },
      adoptInterruptedFiles: { type: "boolean" },
      adoptMountedSource: { type: "boolean" },
    },
  },
} as const;

export const fileWorkspaceSourceSchema = {
  anyOf: [
    {
      type: "object",
      additionalProperties: false,
      required: ["kind"],
      properties: { kind: { const: "ephemeral" } },
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["kind", "directory", "access"],
      properties: {
        kind: { const: "directory" },
        directory: { type: "string", minLength: 1 },
        access: {
          anyOf: [
            {
              type: "object",
              additionalProperties: false,
              required: ["mode"],
              properties: { mode: { const: "copy" } },
            },
            {
              type: "object",
              additionalProperties: false,
              required: ["mode", "target", "readOnly"],
              properties: {
                mode: { const: "mount" },
                target: { type: "string", minLength: 1 },
                readOnly: { type: "boolean" },
              },
            },
          ],
        },
      },
    },
  ],
} as const;

export const workspaceFileEntrySchema = {
  type: "object",
  additionalProperties: false,
  required: ["path", "kind", "mode", "size", "sha256"],
  properties: {
    path: { type: "string", minLength: 1 },
    kind: { enum: ["file", "link", "directory"] },
    mode: { type: "integer", minimum: 0, maximum: 511 },
    size: { type: "integer", minimum: 0 },
    sha256: { type: "string" },
    target: { type: "string" },
  },
} as const;

export const fileWorkspaceRecordSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "format",
    "id",
    "kind",
    "source",
    "ownership",
    "owner",
    "locks",
    "materialization",
    "directory",
    "runtime",
    "inputFingerprint",
    "generation",
    "fingerprint",
  ],
  properties: {
    format: { const: 1 },
    id: { type: "string", pattern: "^[a-f0-9-]{36}$" },
    kind: { enum: ["directory", "ephemeral"] },
    source: fileWorkspaceSourceSchema,
    ownership: { const: "owned" },
    directory: { type: "string", minLength: 1 },
    materialization: {
      type: "object",
      additionalProperties: false,
      required: ["device", "inode"],
      properties: { device: { type: "number" }, inode: { type: "number" } },
    },
    owner: {
      type: "object",
      additionalProperties: false,
      required: ["nonce", "state"],
      properties: {
        nonce: { type: "string", pattern: "^[a-f0-9-]{36}$" },
        state: { enum: ["open", "released", "recovering"] },
      },
    },
    locks: {
      type: "object",
      additionalProperties: false,
      required: ["materialization"],
      properties: {
        materialization: { type: "string", pattern: "^[a-f0-9-]{36}$" },
        source: { type: "string", pattern: "^[a-f0-9-]{36}$" },
      },
    },
    runtime: {
      type: "object",
      additionalProperties: false,
      required: ["directory", "namespace"],
      properties: {
        directory: { type: "string", minLength: 1 },
        namespace: { type: "string", minLength: 1 },
      },
    },
    inputFingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
    preparation: { enum: ["preparing", "failed", "ready"] },
    fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
    mountedFingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
    generation: { type: "integer", minimum: 0 },
    inputs: {
      type: "array",
      maxItems: 100000,
      items: workspaceFileEntrySchema,
    },
    publicationBaselines: {
      type: "array",
      items: {
        type: "object",
        required: ["options", "expected"],
        properties: {
          options: {
            type: "object",
            required: ["paths", "destination", "policy"],
            properties: {
              paths: { type: "array", items: { type: "string" } },
              destination: { type: "string" },
              policy: { enum: ["create", "update"] },
              deleteMissing: { type: "boolean" },
            },
          },
          expected: {
            type: "array",
            maxItems: 100000,
            items: workspaceFileEntrySchema,
          },
        },
      },
    },
    snapshot: {
      type: "object",
      additionalProperties: false,
      required: ["key", "revision"],
      properties: {
        key: { type: "string", minLength: 1 },
        revision: { type: "string", minLength: 1 },
      },
    },
    publications: {
      type: "array",
      maxItems: 100000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "state", "reference"],
        properties: {
          id: { type: "string", minLength: 1 },
          state: {
            enum: ["applying", "complete", "rolled-back", "recovery-required"],
          },
          reference: {
            type: "object",
            additionalProperties: false,
            required: ["key", "revision"],
            properties: {
              key: { type: "string", minLength: 1 },
              revision: { type: "string", minLength: 1 },
            },
          },
        },
      },
    },
    conversations: {
      type: "array",
      maxItems: 100000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "format", "path", "archive"],
        properties: {
          id: { type: "string", minLength: 1 },
          format: { type: "string", minLength: 1 },
          path: { type: "string", minLength: 1 },
          archive: {
            type: "object",
            additionalProperties: false,
            required: ["key", "revision"],
            properties: {
              key: { type: "string", minLength: 1 },
              revision: { type: "string", minLength: 1 },
            },
          },
        },
      },
    },
    allocation: {
      type: "object",
      additionalProperties: false,
      required: ["provider", "state", "reference"],
      properties: {
        provider: { type: "string", minLength: 1 },
        state: { enum: ["allocating", "active", "uncertain", "released"] },
        resourceId: { type: "string", minLength: 1 },
        reference: {
          type: "object",
          additionalProperties: false,
          required: ["key", "revision"],
          properties: {
            key: { type: "string", minLength: 1 },
            revision: { type: "string", minLength: 1 },
          },
        },
      },
    },
  },
} as const;
