export const nativeRecipeSchemas: Readonly<
  Record<string, Readonly<Record<string, unknown>>>
> = {
  "task.options": {
    type: "object",
    properties: {
      interaction: {
        type: "object",
        properties: {
          actors: {
            type: "array",
            items: {
              type: "string",
            },
          },
          identity: {
            type: "string",
          },
        },
        required: ["actors", "identity"],
        additionalProperties: false,
      },
      gate: {
        type: "object",
        properties: {
          authentication: {
            const: "signed",
          },
          kind: {
            anyOf: [
              {
                const: "approval",
              },
              {
                const: "pause",
              },
            ],
          },
          prompt: {
            type: "string",
          },
          actors: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["kind", "prompt", "actors"],
        additionalProperties: false,
      },
      condition: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "task.options.condition",
      },
      retry: {
        type: "object",
        properties: {
          attempts: {
            type: "number",
          },
          delayMs: {
            type: "number",
          },
          backoff: {
            anyOf: [
              {
                const: "fixed",
              },
              {
                const: "exponential",
              },
            ],
          },
          maxDelayMs: {
            type: "number",
          },
          jitter: {
            anyOf: [
              {
                const: "none",
              },
              {
                const: "full",
              },
            ],
          },
          accepts: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "task.options.retry.accepts",
          },
        },
        required: ["attempts"],
        additionalProperties: false,
      },
      timeoutMs: {
        type: "number",
      },
      cache: {
        type: "object",
        properties: {
          store: {
            type: "object",
            properties: {
              read: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "task.options.cache.store.read",
              },
              write: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "task.options.cache.store.write",
              },
            },
            required: ["read", "write"],
            additionalProperties: false,
          },
          version: {
            type: "string",
          },
          key: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "task.options.cache.key",
          },
          maxAgeMs: {
            type: "number",
          },
          mode: {
            anyOf: [
              {
                const: "reuse",
              },
              {
                const: "refresh",
              },
            ],
          },
        },
        required: ["store", "version", "key"],
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  "workflow.options": {
    type: "object",
    properties: {
      timeoutMs: {
        type: "number",
      },
      redact: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
            },
            flags: {
              type: "string",
            },
          },
          required: ["pattern"],
          additionalProperties: false,
          regexp: true,
        },
      },
      onQuota: {
        type: "object",
        properties: {
          action: {
            const: "pause",
          },
          maxWaitMs: {
            type: "number",
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
      answers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            executionId: {
              type: "string",
            },
            key: {
              type: "string",
            },
            requestId: {
              type: "string",
            },
            actor: {
              type: "string",
            },
            value: {
              type: "string",
            },
          },
          required: ["executionId", "key", "requestId", "actor", "value"],
          additionalProperties: false,
        },
      },
      decisionVerifier: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "verifier",
      },
      decisions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            proof: {
              type: "object",
              properties: {
                keyId: {
                  type: "string",
                },
                expiresAt: {
                  type: "string",
                },
                signature: {
                  type: "string",
                },
              },
              required: ["keyId", "expiresAt", "signature"],
              additionalProperties: false,
            },
            executionId: {
              type: "string",
            },
            key: {
              type: "string",
            },
            requestId: {
              type: "string",
            },
            action: {
              anyOf: [
                {
                  const: "approve",
                },
                {
                  const: "resume",
                },
                {
                  const: "reject",
                },
              ],
            },
            actor: {
              type: "string",
            },
            reason: {
              type: "string",
            },
          },
          required: [
            "executionId",
            "key",
            "requestId",
            "action",
            "actor",
            "reason",
          ],
          additionalProperties: false,
        },
      },
      checkpoint: {
        type: "object",
        properties: {
          store: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "checkpointStore",
          },
          runId: {
            type: "string",
          },
          version: {
            type: "string",
          },
          resume: {
            const: "retry-incomplete",
          },
        },
        required: ["store", "runId", "version"],
        additionalProperties: false,
      },
      concurrency: {
        type: "number",
      },
      budget: {
        type: "object",
        properties: {
          prices: {
            type: "object",
            properties: {
              currency: {
                anyOf: [
                  {
                    const: "EUR",
                  },
                  {
                    const: "USD",
                  },
                ],
              },
              models: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "object",
                  properties: {
                    input: {
                      type: "number",
                    },
                    output: {
                      type: "number",
                    },
                    cached: {
                      type: "number",
                    },
                    cacheCreated: {
                      type: "number",
                    },
                  },
                  required: ["input", "output"],
                  additionalProperties: false,
                },
              },
            },
            required: ["currency", "models"],
            additionalProperties: false,
          },
          cost: {
            type: "object",
            properties: {
              currency: {
                anyOf: [
                  {
                    const: "EUR",
                  },
                  {
                    const: "USD",
                  },
                ],
              },
              limit: {
                type: "number",
              },
            },
            required: ["currency", "limit"],
            additionalProperties: false,
          },
          attempts: {
            type: "number",
          },
          usage: {
            type: "object",
            properties: {
              input: {
                type: "number",
              },
              cached: {
                type: "number",
              },
              cacheCreated: {
                type: "number",
              },
              output: {
                type: "number",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      stopOnError: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      telemetry: {
        type: "object",
        properties: {
          observe: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "workflow.options.telemetry.observe",
          },
        },
        required: ["observe"],
        additionalProperties: false,
      },
      observe: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "workflow.options.observe",
      },
    },
    additionalProperties: false,
  },
  "loop.options": {
    type: "object",
    properties: {
      maxRounds: {
        type: "number",
      },
      attempt: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "loop.options.attempt",
      },
      check: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "loop.options.check",
      },
    },
    required: ["maxRounds", "attempt", "check"],
    additionalProperties: false,
  },
  "decisionTask.options": {
    type: "object",
    properties: {
      provider: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "decisionProvider",
      },
      model: {
        type: "string",
      },
      decision: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "decision",
      },
      allowTruncated: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
    },
    required: ["provider", "model", "decision"],
    additionalProperties: false,
  },
  "isolated.options": {
    type: "object",
    properties: {
      redact: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
            },
            flags: {
              type: "string",
            },
          },
          required: ["pattern"],
          additionalProperties: false,
          regexp: true,
        },
      },
      telemetry: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "telemetry",
      },
      observe: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "isolated.options.observe",
      },
      includeUncommitted: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      agent: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "agent",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "agent",
          },
          {
            type: "object",
            properties: {
              kind: {
                const: "replay",
              },
              source: {
                anyOf: [
                  {
                    const: "agent",
                  },
                  {
                    const: "harness",
                  },
                ],
              },
              divergence: {
                anyOf: [
                  {
                    const: "warn",
                  },
                  {
                    const: "fail",
                  },
                ],
              },
              turns: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    prompt: {
                      type: "string",
                    },
                    events: {
                      type: "array",
                      items: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-route",
                              },
                              step: {
                                type: "number",
                              },
                              choice: {
                                type: "string",
                              },
                              model: {
                                type: "object",
                                properties: {
                                  name: {
                                    type: "string",
                                  },
                                  reasoning: {
                                    anyOf: [
                                      {
                                        const: "none",
                                      },
                                      {
                                        const: "minimal",
                                      },
                                      {
                                        const: "low",
                                      },
                                      {
                                        const: "medium",
                                      },
                                      {
                                        const: "high",
                                      },
                                      {
                                        const: "xhigh",
                                      },
                                      {
                                        const: "max",
                                      },
                                    ],
                                  },
                                  maxOutputTokens: {
                                    type: "number",
                                  },
                                },
                                required: ["name"],
                                additionalProperties: false,
                              },
                              reason: {
                                anyOf: [
                                  {
                                    const: "selected",
                                  },
                                  {
                                    const: "confidence",
                                  },
                                  {
                                    const: "unavailable",
                                  },
                                ],
                              },
                              confidence: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "step",
                              "choice",
                              "model",
                              "reason",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "subagent",
                              },
                              id: {
                                type: "string",
                              },
                              callId: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              status: {
                                anyOf: [
                                  {
                                    const: "started",
                                  },
                                  {
                                    const: "finished",
                                  },
                                  {
                                    const: "failed",
                                  },
                                ],
                              },
                              conversation: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "id",
                              "callId",
                              "name",
                              "status",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "message-usage",
                              },
                              tokens: {
                                $ref: "#/$defs/option0",
                              },
                              messageId: {
                                type: "string",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "tokens"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stderr",
                              },
                              text: {
                                type: "string",
                              },
                              truncated: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stopped",
                              },
                              reason: {
                                anyOf: [
                                  {
                                    const: "completion",
                                  },
                                  {
                                    const: "idle-timeout",
                                  },
                                  {
                                    const: "deadline",
                                  },
                                  {
                                    const: "aborted",
                                  },
                                  {
                                    const: "oversized-event",
                                  },
                                  {
                                    const: "steered",
                                  },
                                  {
                                    const: "stuck",
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "reason"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "steer",
                              },
                              text: {
                                type: "string",
                              },
                              mode: {
                                anyOf: [
                                  {
                                    const: "injected",
                                  },
                                  {
                                    const: "resumed",
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text", "mode"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "reasoning",
                              },
                              text: {
                                type: "string",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "file-change",
                              },
                              changes: {},
                              callId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "changes"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-request",
                              },
                              request: {},
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "request"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-response",
                              },
                              response: {},
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "response"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-retry",
                              },
                              attempt: {
                                type: "number",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "attempt"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-error",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "hook",
                              },
                              phase: {
                                type: "string",
                              },
                              changed: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "phase", "changed"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "instructions-loaded",
                              },
                              count: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "count"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "skills-loaded",
                              },
                              names: {
                                type: "array",
                                items: {
                                  type: "string",
                                },
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "names"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool-output",
                              },
                              callId: {
                                type: "string",
                              },
                              channel: {
                                anyOf: [
                                  {
                                    const: "stdout",
                                  },
                                  {
                                    const: "stderr",
                                  },
                                ],
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "callId", "channel", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "phase",
                              },
                              name: {
                                type: "string",
                              },
                              agent: {
                                type: "string",
                              },
                              branch: {
                                type: "string",
                              },
                              directory: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "name"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "summary",
                              },
                              durationMs: {
                                type: "number",
                              },
                              status: {
                                type: "number",
                              },
                              tokens: {
                                $ref: "#/$defs/option0",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "durationMs",
                              "status",
                              "tokens",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "warning",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "text",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "text-delta",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "result",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "prompt",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool",
                              },
                              name: {
                                type: "string",
                              },
                              input: {},
                              callId: {
                                type: "string",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "name", "input"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool-result",
                              },
                              callId: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              isError: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              preview: {
                                type: "string",
                              },
                              characters: {
                                type: "number",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "callId",
                              "name",
                              "isError",
                              "preview",
                              "characters",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "step",
                              },
                              index: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "index"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool-denied",
                              },
                              callId: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              reason: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "callId", "name", "reason"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stop-prevented",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "compaction",
                              },
                              strategy: {
                                type: "string",
                              },
                              messages: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "strategy", "messages"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "conversation",
                              },
                              id: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "id"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "usage",
                              },
                              tokens: {
                                $ref: "#/$defs/option0",
                              },
                              cumulative: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "tokens"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "failure",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "quota",
                              },
                              message: {
                                type: "string",
                              },
                              resetAt: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            $ref: "#/$defs/option1",
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "finished",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "raw",
                              },
                              value: {},
                              bytes: {
                                type: "number",
                              },
                              truncated: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "value"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stuck",
                              },
                              activity: {
                                anyOf: [
                                  {
                                    const: "file-change",
                                  },
                                  {
                                    const: "tool",
                                  },
                                ],
                              },
                              name: {
                                type: "string",
                              },
                              repeats: {
                                type: "number",
                              },
                              window: {
                                type: "number",
                              },
                              action: {
                                anyOf: [
                                  {
                                    const: "warn",
                                  },
                                  {
                                    const: "steer",
                                  },
                                  {
                                    const: "stop",
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "activity",
                              "repeats",
                              "window",
                              "action",
                            ],
                            additionalProperties: false,
                          },
                        ],
                      },
                    },
                    decisionEvents: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          before: {
                            type: "number",
                          },
                          event: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  kind: {
                                    const: "decision",
                                  },
                                  status: {
                                    anyOf: [
                                      {
                                        const: "started",
                                      },
                                      {
                                        const: "finished",
                                      },
                                      {
                                        const: "failed",
                                      },
                                    ],
                                  },
                                  provider: {
                                    type: "string",
                                  },
                                  model: {
                                    type: "string",
                                  },
                                  durationMs: {
                                    type: "number",
                                  },
                                  usage: {
                                    $ref: "#/$defs/option0",
                                  },
                                  truncated: {
                                    anyOf: [
                                      {
                                        const: false,
                                      },
                                      {
                                        const: true,
                                      },
                                    ],
                                  },
                                  code: {
                                    type: "string",
                                  },
                                },
                                required: [
                                  "kind",
                                  "status",
                                  "provider",
                                  "model",
                                ],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  kind: {
                                    const: "decision-request",
                                  },
                                  request: {},
                                },
                                required: ["kind", "request"],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  kind: {
                                    const: "decision-response",
                                  },
                                  response: {},
                                },
                                required: ["kind", "response"],
                                additionalProperties: false,
                              },
                            ],
                          },
                          subagentId: {
                            type: "string",
                          },
                        },
                        required: ["before", "event"],
                        additionalProperties: false,
                      },
                    },
                    text: {
                      type: "string",
                    },
                    usage: {
                      $ref: "#/$defs/option0",
                    },
                    conversation: {
                      type: "string",
                    },
                    failure: {
                      type: "object",
                      properties: {
                        code: {
                          anyOf: [
                            {
                              const: "provider",
                            },
                            {
                              const: "workspace",
                            },
                            {
                              const: "guard",
                            },
                            {
                              const: "steering",
                            },
                            {
                              const: "response",
                            },
                            {
                              const: "replay",
                            },
                            {
                              const: "aborted",
                            },
                            {
                              const: "stuck",
                            },
                            {
                              const: "prompt",
                            },
                            {
                              const: "quota",
                            },
                            {
                              const: "rejected",
                            },
                            {
                              const: "configuration",
                            },
                            {
                              const: "process",
                            },
                            {
                              const: "timeout",
                            },
                            {
                              const: "conflict",
                            },
                            {
                              const: "session",
                            },
                            {
                              const: "limit",
                            },
                          ],
                        },
                        message: {
                          type: "string",
                        },
                      },
                      required: ["code", "message"],
                      additionalProperties: false,
                    },
                    handover: {
                      $ref: "#/$defs/option1",
                    },
                    changes: {
                      anyOf: [
                        {
                          type: "object",
                          properties: {
                            kind: {
                              const: "workspace-commits",
                            },
                            baseline: {
                              type: "object",
                              properties: {
                                commit: {
                                  type: "string",
                                },
                                tree: {
                                  type: "string",
                                },
                              },
                              required: ["commit", "tree"],
                              additionalProperties: false,
                            },
                            commits: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  oid: {
                                    type: "string",
                                  },
                                  tree: {
                                    type: "string",
                                  },
                                  author: {
                                    type: "object",
                                    properties: {
                                      name: {
                                        type: "string",
                                      },
                                      email: {
                                        type: "string",
                                      },
                                      date: {
                                        type: "string",
                                      },
                                    },
                                    required: ["name", "email", "date"],
                                    additionalProperties: false,
                                  },
                                  committer: {
                                    type: "object",
                                    properties: {
                                      name: {
                                        type: "string",
                                      },
                                      email: {
                                        type: "string",
                                      },
                                      date: {
                                        type: "string",
                                      },
                                    },
                                    required: ["name", "email", "date"],
                                    additionalProperties: false,
                                  },
                                  message: {
                                    type: "string",
                                  },
                                  patch: {
                                    type: "string",
                                  },
                                },
                                required: [
                                  "oid",
                                  "tree",
                                  "author",
                                  "committer",
                                  "message",
                                  "patch",
                                ],
                                additionalProperties: false,
                              },
                            },
                          },
                          required: ["kind", "baseline", "commits"],
                          additionalProperties: false,
                        },
                        {
                          type: "object",
                          properties: {
                            kind: {
                              const: "workspace-commits",
                            },
                            baseline: {
                              type: "object",
                              properties: {
                                commit: {
                                  type: "string",
                                },
                                tree: {
                                  type: "string",
                                },
                              },
                              required: ["commit", "tree"],
                              additionalProperties: false,
                            },
                            unavailable: {
                              type: "string",
                            },
                          },
                          required: ["kind", "unavailable"],
                          additionalProperties: false,
                        },
                      ],
                    },
                    resumedBy: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    interrupted: {
                      anyOf: [
                        {
                          const: false,
                        },
                        {
                          const: true,
                        },
                      ],
                    },
                  },
                  required: ["prompt", "events", "text", "usage"],
                  additionalProperties: false,
                },
              },
              remainingTurns: {
                type: "number",
              },
              nextTurn: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "isolated.options.agent.nextTurn",
              },
              pendingSteering: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "isolated.options.agent.pendingSteering",
              },
              usageInput: {
                anyOf: [
                  {
                    const: "inclusive",
                  },
                  {
                    const: "uncached",
                  },
                ],
              },
              name: {
                type: "string",
              },
              bootstrap: {
                type: "string",
              },
              requiresFinishedEvent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              usage: {
                anyOf: [
                  {
                    const: "unavailable",
                  },
                  {
                    const: "session",
                  },
                  {
                    const: "events",
                  },
                ],
              },
              variables: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      $ref: {
                        type: "string",
                        minLength: 1,
                      },
                    },
                    required: ["$ref"],
                    additionalProperties: false,
                    component: "variables",
                  },
                  {
                    type: "object",
                    additionalProperties: {
                      anyOf: [
                        {
                          type: "string",
                        },
                        {
                          type: "object",
                          properties: {
                            env: {
                              type: "string",
                              pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                            },
                          },
                          required: ["env"],
                          additionalProperties: false,
                          secret: true,
                        },
                      ],
                    },
                  },
                ],
              },
              storage: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "conversations",
              },
              capture: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              resumable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              forkable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              transcriptUsage: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "isolated.options.agent.transcriptUsage",
              },
            },
            required: [
              "kind",
              "source",
              "divergence",
              "turns",
              "remainingTurns",
              "nextTurn",
              "pendingSteering",
              "name",
            ],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              kind: {
                const: "fallback",
              },
              agents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "agent",
                },
              },
              on: {
                type: "array",
                items: {
                  anyOf: [
                    {
                      const: "unavailable",
                    },
                    {
                      const: "quota",
                    },
                  ],
                },
              },
            },
            required: ["kind", "agents", "on"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        ],
      },
      sandboxProvider: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "sandboxProvider",
      },
      workspace: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "workspace",
      },
      hooks: {
        type: "object",
        properties: {
          workspaceReady: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: {
                  type: "object",
                  properties: {
                    kind: {
                      const: "changed",
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["kind", "files"],
                  additionalProperties: false,
                },
                executable: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                stdin: {
                  type: "string",
                },
                input: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "object",
                },
                directory: {
                  type: "string",
                },
                variables: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "variables",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        anyOf: [
                          {
                            type: "string",
                          },
                          {
                            type: "object",
                            properties: {
                              env: {
                                type: "string",
                                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                              },
                            },
                            required: ["env"],
                            additionalProperties: false,
                            secret: true,
                          },
                        ],
                      },
                    },
                  ],
                },
                deadlineMs: {
                  type: "number",
                },
                interactive: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                terminal: {
                  $ref: "#/$defs/option2",
                },
                elevated: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                retain: {
                  type: "number",
                },
                observe: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "callback",
                  contract: "isolated.options.hooks.workspaceReady.*.observe",
                },
              },
              required: ["executable"],
              additionalProperties: false,
            },
          },
          hostReady: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: {
                  type: "object",
                  properties: {
                    kind: {
                      const: "changed",
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["kind", "files"],
                  additionalProperties: false,
                },
                executable: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                stdin: {
                  type: "string",
                },
                input: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "object",
                },
                directory: {
                  type: "string",
                },
                variables: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "variables",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        anyOf: [
                          {
                            type: "string",
                          },
                          {
                            type: "object",
                            properties: {
                              env: {
                                type: "string",
                                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                              },
                            },
                            required: ["env"],
                            additionalProperties: false,
                            secret: true,
                          },
                        ],
                      },
                    },
                  ],
                },
                deadlineMs: {
                  type: "number",
                },
                interactive: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                terminal: {
                  $ref: "#/$defs/option2",
                },
                elevated: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                retain: {
                  type: "number",
                },
                observe: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "callback",
                  contract: "isolated.options.hooks.hostReady.*.observe",
                },
              },
              required: ["executable"],
              additionalProperties: false,
            },
          },
          sandboxReady: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: {
                  type: "object",
                  properties: {
                    kind: {
                      const: "changed",
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["kind", "files"],
                  additionalProperties: false,
                },
                executable: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                stdin: {
                  type: "string",
                },
                input: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "object",
                },
                directory: {
                  type: "string",
                },
                variables: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "variables",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        anyOf: [
                          {
                            type: "string",
                          },
                          {
                            type: "object",
                            properties: {
                              env: {
                                type: "string",
                                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                              },
                            },
                            required: ["env"],
                            additionalProperties: false,
                            secret: true,
                          },
                        ],
                      },
                    },
                  ],
                },
                deadlineMs: {
                  type: "number",
                },
                interactive: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                terminal: {
                  $ref: "#/$defs/option2",
                },
                elevated: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                retain: {
                  type: "number",
                },
                observe: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "callback",
                  contract: "isolated.options.hooks.sandboxReady.*.observe",
                },
              },
              required: ["executable"],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
      logging: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "stdout",
          },
          {
            type: "object",
            properties: {
              transporter: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "transport",
              },
              verbose: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              replayable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
            },
            additionalProperties: false,
          },
        ],
      },
      bootstrap: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      conversationHome: {
        type: "string",
        hostPath: true,
      },
      recoveryTransport: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "transport",
      },
      activityTransport: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "transport",
      },
      guard: {
        type: "object",
        properties: {
          protectedPaths: {
            type: "array",
            items: {
              type: "string",
            },
          },
          maxChangedLines: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
      storageQuota: {
        type: "object",
        properties: {
          transporter: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "transport",
          },
          maxBytes: {
            type: "number",
          },
          reserveBytes: {
            type: "number",
          },
          maxEntries: {
            type: "number",
          },
        },
        required: ["maxBytes", "reserveBytes"],
        additionalProperties: false,
      },
      repository: {
        type: "string",
        hostPath: true,
      },
      branch: {
        anyOf: [
          {
            type: "object",
            properties: {
              mode: {
                const: "current",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "named",
              },
              name: {
                type: "string",
              },
              from: {
                type: "string",
              },
            },
            required: ["mode", "name"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "integrate",
              },
              from: {
                type: "string",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
        ],
      },
      copies: {
        type: "array",
        items: {
          type: "string",
        },
      },
      limits: {
        type: "object",
        properties: {
          copyMs: {
            type: "number",
          },
          gitMs: {
            type: "number",
          },
          collectMs: {
            type: "number",
          },
          mergeMs: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
      label: {
        type: "string",
      },
      watchdog: {
        type: "object",
        properties: {
          repetition: {
            type: "object",
            properties: {
              window: {
                type: "number",
              },
              maxRepeats: {
                type: "number",
              },
            },
            required: ["window", "maxRepeats"],
            additionalProperties: false,
          },
          onStuck: {
            anyOf: [
              {
                const: "warn",
              },
              {
                const: "stop",
              },
              {
                type: "object",
                properties: {
                  instruction: {
                    type: "string",
                  },
                  maxInterventions: {
                    type: "number",
                  },
                },
                required: ["instruction"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["repetition", "onStuck"],
        additionalProperties: false,
      },
      prices: {
        type: "object",
        properties: {
          currency: {
            anyOf: [
              {
                const: "EUR",
              },
              {
                const: "USD",
              },
            ],
          },
          models: {
            type: "object",
            properties: {},
            additionalProperties: {
              type: "object",
              properties: {
                input: {
                  type: "number",
                },
                output: {
                  type: "number",
                },
                cached: {
                  type: "number",
                },
                cacheCreated: {
                  type: "number",
                },
              },
              required: ["input", "output"],
              additionalProperties: false,
            },
          },
        },
        required: ["currency", "models"],
        additionalProperties: false,
      },
      brief: {
        anyOf: [
          {
            type: "object",
            properties: {
              text: {
                type: "string",
              },
              file: false,
              values: false,
            },
            required: ["text"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              file: {
                type: "string",
                hostPath: true,
              },
              text: false,
              values: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "string",
                    },
                    {
                      type: "number",
                    },
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
              },
            },
            required: ["file"],
            additionalProperties: false,
          },
        ],
      },
      passes: {
        type: "number",
      },
      until: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      idleMs: {
        type: "number",
      },
      idleWarningMs: {
        type: "number",
      },
      settleMs: {
        type: "number",
      },
      deadlineMs: {
        type: "number",
      },
      expansionMs: {
        type: "number",
      },
      steering: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "steering",
      },
      continuation: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          fork: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
      response: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "response",
      },
      warn: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "isolated.options.warn",
      },
      diagnostic: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "isolated.options.diagnostic",
      },
    },
    required: ["agent", "brief"],
    additionalProperties: false,
    $defs: {
      option0: {
        type: "object",
        properties: {
          models: {
            type: "object",
            properties: {},
            additionalProperties: {
              type: "object",
              properties: {
                inputIncludesCache: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                complete: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                input: {
                  type: "number",
                },
                cached: {
                  type: "number",
                },
                cacheCreated: {
                  type: "number",
                },
                output: {
                  type: "number",
                },
              },
              required: ["input", "cached", "output"],
              additionalProperties: false,
            },
          },
          complete: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          input: {
            type: "number",
          },
          cached: {
            type: "number",
          },
          cacheCreated: {
            type: "number",
          },
          output: {
            type: "number",
          },
        },
        required: ["input", "cached", "output"],
        additionalProperties: false,
      },
      option1: {
        type: "object",
        properties: {
          kind: {
            const: "fallback",
          },
          from: {
            type: "object",
            properties: {
              index: {
                type: "number",
              },
              name: {
                type: "string",
              },
              model: {
                type: "string",
              },
            },
            required: ["index", "name"],
            additionalProperties: false,
          },
          to: {
            type: "object",
            properties: {
              index: {
                type: "number",
              },
              name: {
                type: "string",
              },
              model: {
                type: "string",
              },
            },
            required: ["index", "name"],
            additionalProperties: false,
          },
          failure: {
            anyOf: [
              {
                const: "unavailable",
              },
              {
                const: "quota",
              },
            ],
          },
          message: {
            type: "string",
          },
          resetAt: {
            type: "string",
          },
          subagentId: {
            type: "string",
          },
        },
        required: ["kind", "from", "to", "failure", "message"],
        additionalProperties: false,
      },
      option2: {
        type: "object",
        properties: {
          input: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "object",
          },
          output: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "object",
          },
          error: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "object",
          },
        },
        additionalProperties: false,
      },
    },
  },
  "call.options": {
    type: "object",
    properties: {
      perform: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "call.options.perform",
      },
    },
    required: ["perform"],
    additionalProperties: false,
  },
  "steering.controller": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "harness.outpost": {
    type: "object",
    properties: {
      routing: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "routing",
      },
      modelProvider: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "modelProvider",
      },
      instructions: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "instructions",
          },
          {
            type: "array",
            items: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "instructions",
                },
              ],
            },
          },
        ],
      },
      tools: {
        type: "array",
        items: {
          anyOf: [
            {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "tool",
            },
            {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "toolset",
            },
          ],
        },
      },
      limits: {
        type: "object",
        properties: {
          maxSteps: {
            type: "number",
          },
          maxDelegationDepth: {
            type: "number",
          },
          maxToolCalls: {
            type: "number",
          },
          usage: {
            type: "object",
            properties: {
              input: {
                type: "number",
              },
              cached: {
                type: "number",
              },
              cacheCreated: {
                type: "number",
              },
              output: {
                type: "number",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      toolExecution: {
        type: "object",
        properties: {
          concurrency: {
            type: "number",
          },
          deadlineMs: {
            type: "number",
          },
          onError: {
            anyOf: [
              {
                const: "fail",
              },
              {
                const: "return-to-model",
              },
            ],
          },
        },
        additionalProperties: false,
      },
      hooks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            $ref: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["$ref"],
          additionalProperties: false,
          component: "hook",
        },
      },
      permissions: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "permissions",
      },
      context: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "context",
      },
      conversations: {
        anyOf: [
          {
            const: false,
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "conversations",
          },
        ],
      },
      skills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            $ref: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["$ref"],
          additionalProperties: false,
          component: "skill",
        },
      },
      cache: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
      profile: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "profile",
      },
    },
    required: ["modelProvider"],
    additionalProperties: false,
  },
  "modelProvider.openai": {
    type: "object",
    properties: {
      api: {
        anyOf: [
          {
            const: "chat-completions",
          },
          {
            const: "responses",
          },
        ],
      },
      baseUrl: {
        type: "string",
      },
      apiKey: {
        anyOf: [
          {
            type: "object",
            properties: {
              env: {
                type: "string",
                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
              },
            },
            required: ["env"],
            additionalProperties: false,
            secret: true,
          },
          {
            const: false,
          },
        ],
      },
      timeoutMs: {
        type: "number",
      },
      maxResponseBytes: {
        type: "number",
      },
    },
    required: ["baseUrl", "apiKey"],
    additionalProperties: false,
  },
  "modelProvider.anthropic": {
    type: "object",
    properties: {
      apiKey: {
        type: "object",
        properties: {
          env: {
            type: "string",
            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
          },
        },
        required: ["env"],
        additionalProperties: false,
        secret: true,
      },
      baseUrl: {
        type: "string",
      },
      cacheSystem: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      timeoutMs: {
        type: "number",
      },
      maxResponseBytes: {
        type: "number",
      },
    },
    required: ["apiKey"],
    additionalProperties: false,
  },
  "decisionProvider.system-one": {
    type: "object",
    properties: {
      baseUrl: {
        type: "string",
      },
      apiKey: {
        anyOf: [
          {
            type: "object",
            properties: {
              env: {
                type: "string",
                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
              },
            },
            required: ["env"],
            additionalProperties: false,
            secret: true,
          },
          {
            const: false,
          },
        ],
      },
      timeoutMs: {
        type: "number",
      },
      maxResponseBytes: {
        type: "number",
      },
    },
    required: ["baseUrl", "apiKey"],
    additionalProperties: false,
  },
  "tool.custom": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      description: {
        type: "string",
      },
      input: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "validator",
          },
          {
            type: "object",
            properties: {},
            additionalProperties: {},
          },
        ],
      },
      readOnly: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      resources: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "tool.custom.resources",
      },
      execute: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "tool.custom.execute",
      },
    },
    required: ["name", "description", "input", "execute"],
    additionalProperties: false,
  },
  "tool.subagent": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      description: {
        type: "string",
      },
      agent: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "agent",
      },
    },
    required: ["name", "description", "agent"],
    additionalProperties: false,
  },
  "toolset.custom": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      tools: {
        type: "array",
        items: {
          anyOf: [
            {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "tool",
            },
            {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "toolset",
            },
          ],
        },
      },
    },
    required: ["name", "tools"],
    additionalProperties: false,
  },
  "toolset.files": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "toolset.edit": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "toolset.git": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "toolset.search": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "toolset.shell": {
    type: "object",
    properties: {
      deadlineMs: {
        type: "number",
      },
    },
    additionalProperties: false,
  },
  "permissions.rules": {
    type: "object",
    properties: {
      rules: {
        type: "array",
        items: {
          type: "object",
          properties: {
            effect: {
              anyOf: [
                {
                  const: "allow",
                },
                {
                  const: "deny",
                },
              ],
            },
            tools: {
              type: "array",
              items: {
                type: "string",
              },
            },
            paths: {
              type: "array",
              items: {
                type: "string",
              },
            },
            commands: {
              type: "array",
              items: {
                type: "string",
              },
            },
            reason: {
              type: "string",
            },
          },
          required: ["effect"],
          additionalProperties: false,
        },
      },
      default: {
        anyOf: [
          {
            const: "allow",
          },
          {
            const: "deny",
          },
        ],
      },
    },
    required: ["rules"],
    additionalProperties: false,
  },
  "hook.custom": {
    type: "object",
    properties: {
      on: {
        anyOf: [
          {
            const: "stop",
          },
          {
            const: "session-start",
          },
          {
            const: "before-model",
          },
          {
            const: "after-model",
          },
          {
            const: "before-tool",
          },
          {
            const: "after-tool",
          },
        ],
      },
      name: {
        type: "string",
      },
      run: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "hook.custom.run",
      },
    },
    required: ["on", "run"],
    additionalProperties: false,
  },
  "skill.custom": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      description: {
        type: "string",
      },
      instructions: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "skill.custom.instructions",
          },
        ],
      },
      tools: {
        type: "array",
        items: {
          anyOf: [
            {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "tool",
            },
            {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "toolset",
            },
          ],
        },
      },
    },
    required: ["name", "description", "instructions"],
    additionalProperties: false,
  },
  "context.custom": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      compact: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "context.custom.compact",
      },
    },
    required: ["name", "compact"],
    additionalProperties: false,
  },
  "context.truncate": {
    type: "object",
    properties: {
      keepRecent: {
        type: "number",
      },
      maxCharacters: {
        type: "number",
      },
    },
    additionalProperties: false,
  },
  "context.summarize": {
    type: "object",
    properties: {
      triggerCharacters: {
        type: "number",
      },
      keepRecentMessages: {
        type: "number",
      },
    },
    additionalProperties: false,
  },
  "instructions.source": {
    type: "object",
    properties: {
      source: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "instructions.source.source",
          },
        ],
      },
    },
    required: ["source"],
    additionalProperties: false,
  },
  "instructions.mcp": {
    type: "object",
    properties: {
      server: {
        type: "string",
      },
      name: {
        type: "string",
      },
      arguments: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "string",
        },
      },
    },
    required: ["server", "name"],
    additionalProperties: false,
  },
  "agent.fallback": {
    type: "object",
    properties: {
      agents: {
        type: "array",
        prefixItems: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "agent",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "agent",
          },
        ],
        minItems: 2,
        items: {
          type: "object",
          properties: {
            $ref: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["$ref"],
          additionalProperties: false,
          component: "agent",
        },
      },
      on: {
        type: "array",
        items: {
          anyOf: [
            {
              const: "unavailable",
            },
            {
              const: "quota",
            },
          ],
        },
      },
    },
    required: ["agents", "on"],
    additionalProperties: false,
  },
  "agent.replay": {
    type: "object",
    properties: {
      journal: {
        type: "array",
        items: {},
      },
      divergence: {
        anyOf: [
          {
            const: "warn",
          },
          {
            const: "fail",
          },
        ],
      },
    },
    required: ["journal"],
    additionalProperties: false,
  },
  "response.json": {
    type: "object",
    properties: {
      tag: {
        type: "string",
      },
      repairs: {
        type: "number",
      },
      jsonSchema: {
        type: "object",
        properties: {},
        additionalProperties: {},
      },
      schema: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "validator",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "response.json.schema",
          },
        ],
      },
    },
    required: ["tag", "jsonSchema"],
    additionalProperties: false,
  },
  "response.text": {
    type: "object",
    properties: {
      tag: {
        type: "string",
      },
      repairs: {
        type: "number",
      },
    },
    required: ["tag"],
    additionalProperties: false,
  },
  "decision.questions": {
    type: "object",
    properties: {
      questions: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                type: {
                  const: "choice",
                },
                instructions: {
                  type: "string",
                },
                criteria: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
              },
              required: ["type", "instructions", "criteria"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                type: {
                  const: "score",
                },
                instructions: {
                  type: "string",
                },
                criteria: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["type", "instructions", "criteria"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                type: {
                  const: "noul",
                },
                instructions: {
                  type: "string",
                },
                criteria: {
                  type: "object",
                  properties: {
                    true: {
                      type: "string",
                    },
                    false: {
                      type: "string",
                    },
                  },
                  required: ["true", "false"],
                  additionalProperties: false,
                },
              },
              required: ["type", "instructions"],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    required: ["questions"],
    additionalProperties: false,
  },
  "routing.decision": {
    type: "object",
    properties: {
      question: {
        type: "string",
      },
      models: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                reasoning: {
                  anyOf: [
                    {
                      const: "none",
                    },
                    {
                      const: "minimal",
                    },
                    {
                      const: "low",
                    },
                    {
                      const: "medium",
                    },
                    {
                      const: "high",
                    },
                    {
                      const: "xhigh",
                    },
                    {
                      const: "max",
                    },
                  ],
                },
                maxOutputTokens: {
                  type: "number",
                },
              },
              required: ["name"],
              additionalProperties: false,
            },
          ],
        },
      },
      fallback: {
        type: "string",
      },
      state: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "routing.decision.state",
      },
      provider: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "decisionProvider",
      },
      model: {
        type: "string",
      },
      decision: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "decision",
      },
      minConfidence: {
        type: "number",
      },
      onError: {
        anyOf: [
          {
            const: "fallback",
          },
          {
            const: "fail",
          },
        ],
      },
    },
    required: [
      "question",
      "models",
      "fallback",
      "provider",
      "model",
      "decision",
    ],
    additionalProperties: false,
  },
  "conversations.transport": {
    type: "object",
    properties: {
      base: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "conversations",
      },
      namespace: {
        type: "string",
      },
      transporter: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "transport",
      },
    },
    required: ["base", "namespace", "transporter"],
    additionalProperties: false,
  },
  "conversations.harness": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "conversations.claude": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "conversations.codex": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "conversations.copilot": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "conversations.kimi": {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  "conversations.transcript": {
    type: "object",
    properties: {
      format: {
        type: "string",
      },
      sidecars: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      searchRoot: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.searchRoot",
      },
      remoteSearchRoot: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.remoteSearchRoot",
      },
      pattern: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.pattern",
      },
      matches: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.matches",
      },
      directory: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.directory",
      },
      preferredPath: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.preferredPath",
      },
      capturePath: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.capturePath",
      },
      remotePath: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.transcript.remotePath",
      },
    },
    required: [
      "format",
      "sidecars",
      "searchRoot",
      "remoteSearchRoot",
      "pattern",
      "matches",
      "directory",
      "capturePath",
      "remotePath",
    ],
    additionalProperties: false,
  },
  "conversations.bundle": {
    type: "object",
    properties: {
      format: {
        type: "string",
      },
      root: {
        type: "object",
        properties: {
          variable: {
            type: "string",
          },
          directory: {
            type: "string",
          },
        },
        required: ["directory"],
        additionalProperties: false,
      },
      sessions: {
        type: "string",
      },
      buckets: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      include: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
          },
          flags: {
            type: "string",
          },
        },
        required: ["pattern"],
        additionalProperties: false,
        regexp: true,
      },
      exclude: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
          },
          flags: {
            type: "string",
          },
        },
        required: ["pattern"],
        additionalProperties: false,
        regexp: true,
      },
      required: {
        type: "array",
        items: {
          type: "string",
        },
      },
      relocated: {
        type: "array",
        items: {
          type: "string",
        },
      },
      validate: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.bundle.validate",
      },
      bucket: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.bundle.bucket",
      },
      relocate: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "conversations.bundle.relocate",
      },
    },
    required: ["format", "root", "sessions", "include", "required"],
    additionalProperties: false,
  },
  "dispatch.options": {
    type: "object",
    properties: {
      redact: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
            },
            flags: {
              type: "string",
            },
          },
          required: ["pattern"],
          additionalProperties: false,
          regexp: true,
        },
      },
      telemetry: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "telemetry",
      },
      observe: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "dispatch.options.observe",
      },
      logging: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "stdout",
          },
          {
            type: "object",
            properties: {
              transporter: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "transport",
              },
              verbose: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              replayable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
            },
            additionalProperties: false,
          },
        ],
      },
      label: {
        type: "string",
      },
      watchdog: {
        type: "object",
        properties: {
          repetition: {
            type: "object",
            properties: {
              window: {
                type: "number",
              },
              maxRepeats: {
                type: "number",
              },
            },
            required: ["window", "maxRepeats"],
            additionalProperties: false,
          },
          onStuck: {
            anyOf: [
              {
                const: "warn",
              },
              {
                const: "stop",
              },
              {
                type: "object",
                properties: {
                  instruction: {
                    type: "string",
                  },
                  maxInterventions: {
                    type: "number",
                  },
                },
                required: ["instruction"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["repetition", "onStuck"],
        additionalProperties: false,
      },
      prices: {
        type: "object",
        properties: {
          currency: {
            anyOf: [
              {
                const: "EUR",
              },
              {
                const: "USD",
              },
            ],
          },
          models: {
            type: "object",
            properties: {},
            additionalProperties: {
              type: "object",
              properties: {
                input: {
                  type: "number",
                },
                output: {
                  type: "number",
                },
                cached: {
                  type: "number",
                },
                cacheCreated: {
                  type: "number",
                },
              },
              required: ["input", "output"],
              additionalProperties: false,
            },
          },
        },
        required: ["currency", "models"],
        additionalProperties: false,
      },
      passes: {
        type: "number",
      },
      until: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      idleMs: {
        type: "number",
      },
      idleWarningMs: {
        type: "number",
      },
      settleMs: {
        type: "number",
      },
      deadlineMs: {
        type: "number",
      },
      expansionMs: {
        type: "number",
      },
      steering: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "steering",
      },
      continuation: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          fork: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
      response: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "response",
      },
      warn: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "dispatch.options.warn",
      },
      diagnostic: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "dispatch.options.diagnostic",
      },
    },
    additionalProperties: false,
  },
  "sandboxProvider.docker": {
    type: "object",
    properties: {
      egress: {
        anyOf: [
          {
            type: "object",
            properties: {
              mode: {
                const: "deny-all",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "allowlist",
              },
              domains: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              allowCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              denyCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
        ],
      },
      repositoryMode: {
        anyOf: [
          {
            const: "mounted",
          },
          {
            const: "isolated",
          },
        ],
      },
      caches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            key: {
              type: "string",
            },
          },
          required: ["name", "key"],
          additionalProperties: false,
        },
      },
      image: {
        type: "string",
      },
      user: {
        type: "object",
        properties: {
          uid: {
            type: "number",
          },
          gid: {
            type: "number",
          },
        },
        required: ["uid", "gid"],
        additionalProperties: false,
      },
      volumes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: {
              type: "string",
              hostPath: true,
            },
            target: {
              type: "string",
            },
            readOnly: {
              anyOf: [
                {
                  const: false,
                },
                {
                  const: true,
                },
              ],
            },
          },
          required: ["source", "target"],
          additionalProperties: false,
        },
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      networks: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      groups: {
        type: "array",
        items: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "number",
            },
          ],
        },
      },
      devices: {
        type: "array",
        items: {
          type: "string",
        },
      },
      cpus: {
        type: "number",
      },
      memoryMb: {
        type: "number",
      },
      label: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "z",
          },
          {
            const: "Z",
          },
        ],
      },
      retain: {
        type: "number",
      },
      userns: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "keep-id",
          },
        ],
      },
    },
    additionalProperties: false,
  },
  "sandboxProvider.podman": {
    type: "object",
    properties: {
      egress: {
        anyOf: [
          {
            type: "object",
            properties: {
              mode: {
                const: "deny-all",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "allowlist",
              },
              domains: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              allowCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              denyCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
        ],
      },
      repositoryMode: {
        anyOf: [
          {
            const: "mounted",
          },
          {
            const: "isolated",
          },
        ],
      },
      caches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            key: {
              type: "string",
            },
          },
          required: ["name", "key"],
          additionalProperties: false,
        },
      },
      image: {
        type: "string",
      },
      user: {
        type: "object",
        properties: {
          uid: {
            type: "number",
          },
          gid: {
            type: "number",
          },
        },
        required: ["uid", "gid"],
        additionalProperties: false,
      },
      volumes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: {
              type: "string",
              hostPath: true,
            },
            target: {
              type: "string",
            },
            readOnly: {
              anyOf: [
                {
                  const: false,
                },
                {
                  const: true,
                },
              ],
            },
          },
          required: ["source", "target"],
          additionalProperties: false,
        },
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      networks: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      groups: {
        type: "array",
        items: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "number",
            },
          ],
        },
      },
      devices: {
        type: "array",
        items: {
          type: "string",
        },
      },
      cpus: {
        type: "number",
      },
      memoryMb: {
        type: "number",
      },
      label: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "z",
          },
          {
            const: "Z",
          },
        ],
      },
      retain: {
        type: "number",
      },
      userns: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "keep-id",
          },
        ],
      },
    },
    additionalProperties: false,
  },
  "sandboxProvider.local": {
    type: "object",
    properties: {
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
    },
    additionalProperties: false,
  },
  "sandboxProvider.vercel": {
    type: "object",
    properties: {
      caches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            transport: {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "transport",
            },
            name: {
              type: "string",
            },
            key: {
              type: "string",
            },
          },
          required: ["transport", "name", "key"],
          additionalProperties: false,
        },
      },
      repositoryMode: {
        const: "isolated",
      },
      egress: {
        anyOf: [
          {
            type: "object",
            properties: {
              mode: {
                const: "deny-all",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "allowlist",
              },
              domains: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              allowCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              denyCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
        ],
      },
      create: {
        anyOf: [
          {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              source: {
                $ref: "#/$defs/option0",
              },
              ports: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              timeout: {
                type: "number",
              },
              resources: {
                type: "object",
                properties: {
                  vcpus: {
                    type: "number",
                  },
                },
                required: ["vcpus"],
                additionalProperties: false,
              },
              networkPolicy: {
                $ref: "#/$defs/option2",
              },
              env: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              tags: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              region: {
                $ref: "#/$defs/option13",
              },
              failoverRegions: {
                $ref: "#/$defs/option15",
              },
              mounts: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "object",
                    },
                    {
                      type: "object",
                      properties: {
                        drive: {
                          type: "string",
                        },
                        mode: {
                          anyOf: [
                            {
                              const: "read-write",
                            },
                            {
                              const: "snapshot",
                            },
                          ],
                        },
                      },
                      required: ["drive", "mode"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
              persistent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              snapshotExpiration: {
                type: "number",
              },
              keepLastSnapshots: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                  },
                  expiration: {
                    type: "number",
                  },
                  deleteEvicted: {
                    anyOf: [
                      {
                        const: false,
                      },
                      {
                        const: true,
                      },
                    ],
                  },
                },
                required: ["count"],
                additionalProperties: false,
              },
              onResume: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.onResume",
              },
              runtime: {
                $ref: "#/$defs/option18",
              },
              image: false,
              fetch: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.fetch",
              },
            },
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              source: {
                $ref: "#/$defs/option0",
              },
              ports: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              timeout: {
                type: "number",
              },
              resources: {
                type: "object",
                properties: {
                  vcpus: {
                    type: "number",
                  },
                },
                required: ["vcpus"],
                additionalProperties: false,
              },
              networkPolicy: {
                $ref: "#/$defs/option2",
              },
              env: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              tags: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              region: {
                $ref: "#/$defs/option13",
              },
              failoverRegions: {
                $ref: "#/$defs/option15",
              },
              mounts: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "object",
                    },
                    {
                      type: "object",
                      properties: {
                        drive: {
                          type: "string",
                        },
                        mode: {
                          anyOf: [
                            {
                              const: "read-write",
                            },
                            {
                              const: "snapshot",
                            },
                          ],
                        },
                      },
                      required: ["drive", "mode"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
              persistent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              snapshotExpiration: {
                type: "number",
              },
              keepLastSnapshots: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                  },
                  expiration: {
                    type: "number",
                  },
                  deleteEvicted: {
                    anyOf: [
                      {
                        const: false,
                      },
                      {
                        const: true,
                      },
                    ],
                  },
                },
                required: ["count"],
                additionalProperties: false,
              },
              onResume: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.onResume",
              },
              runtime: false,
              image: {
                $ref: "#/$defs/option20",
              },
              fetch: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.fetch",
              },
            },
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              timeout: {
                type: "number",
              },
              name: {
                type: "string",
              },
              ports: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              resources: {
                type: "object",
                properties: {
                  vcpus: {
                    type: "number",
                  },
                },
                required: ["vcpus"],
                additionalProperties: false,
              },
              networkPolicy: {
                $ref: "#/$defs/option2",
              },
              env: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              tags: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              region: {
                $ref: "#/$defs/option13",
              },
              failoverRegions: {
                $ref: "#/$defs/option15",
              },
              mounts: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "object",
                    },
                    {
                      type: "object",
                      properties: {
                        drive: {
                          type: "string",
                        },
                        mode: {
                          anyOf: [
                            {
                              const: "read-write",
                            },
                            {
                              const: "snapshot",
                            },
                          ],
                        },
                      },
                      required: ["drive", "mode"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
              persistent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              snapshotExpiration: {
                type: "number",
              },
              keepLastSnapshots: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                  },
                  expiration: {
                    type: "number",
                  },
                  deleteEvicted: {
                    anyOf: [
                      {
                        const: false,
                      },
                      {
                        const: true,
                      },
                    ],
                  },
                },
                required: ["count"],
                additionalProperties: false,
              },
              onResume: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.onResume",
              },
              source: {
                type: "object",
                properties: {
                  type: {
                    const: "snapshot",
                  },
                  snapshotId: {
                    type: "string",
                  },
                },
                required: ["type", "snapshotId"],
                additionalProperties: false,
              },
              runtime: false,
              image: false,
              fetch: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.fetch",
              },
            },
            required: ["source"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              source: {
                $ref: "#/$defs/option0",
              },
              ports: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              timeout: {
                type: "number",
              },
              resources: {
                type: "object",
                properties: {
                  vcpus: {
                    type: "number",
                  },
                },
                required: ["vcpus"],
                additionalProperties: false,
              },
              networkPolicy: {
                $ref: "#/$defs/option2",
              },
              env: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              tags: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              region: {
                $ref: "#/$defs/option13",
              },
              failoverRegions: {
                $ref: "#/$defs/option15",
              },
              mounts: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "object",
                    },
                    {
                      type: "object",
                      properties: {
                        drive: {
                          type: "string",
                        },
                        mode: {
                          anyOf: [
                            {
                              const: "read-write",
                            },
                            {
                              const: "snapshot",
                            },
                          ],
                        },
                      },
                      required: ["drive", "mode"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
              persistent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              snapshotExpiration: {
                type: "number",
              },
              keepLastSnapshots: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                  },
                  expiration: {
                    type: "number",
                  },
                  deleteEvicted: {
                    anyOf: [
                      {
                        const: false,
                      },
                      {
                        const: true,
                      },
                    ],
                  },
                },
                required: ["count"],
                additionalProperties: false,
              },
              onResume: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.onResume",
              },
              runtime: {
                $ref: "#/$defs/option18",
              },
              image: false,
              token: {
                type: "object",
                properties: {
                  env: {
                    type: "string",
                    pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                  },
                },
                required: ["env"],
                additionalProperties: false,
                secret: true,
              },
              projectId: {
                type: "string",
              },
              teamId: {
                type: "string",
              },
              fetch: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.fetch",
              },
            },
            required: ["token", "projectId", "teamId"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              source: {
                $ref: "#/$defs/option0",
              },
              ports: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              timeout: {
                type: "number",
              },
              resources: {
                type: "object",
                properties: {
                  vcpus: {
                    type: "number",
                  },
                },
                required: ["vcpus"],
                additionalProperties: false,
              },
              networkPolicy: {
                $ref: "#/$defs/option2",
              },
              env: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              tags: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              region: {
                $ref: "#/$defs/option13",
              },
              failoverRegions: {
                $ref: "#/$defs/option15",
              },
              mounts: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "object",
                    },
                    {
                      type: "object",
                      properties: {
                        drive: {
                          type: "string",
                        },
                        mode: {
                          anyOf: [
                            {
                              const: "read-write",
                            },
                            {
                              const: "snapshot",
                            },
                          ],
                        },
                      },
                      required: ["drive", "mode"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
              persistent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              snapshotExpiration: {
                type: "number",
              },
              keepLastSnapshots: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                  },
                  expiration: {
                    type: "number",
                  },
                  deleteEvicted: {
                    anyOf: [
                      {
                        const: false,
                      },
                      {
                        const: true,
                      },
                    ],
                  },
                },
                required: ["count"],
                additionalProperties: false,
              },
              onResume: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.onResume",
              },
              runtime: false,
              image: {
                $ref: "#/$defs/option20",
              },
              token: {
                type: "object",
                properties: {
                  env: {
                    type: "string",
                    pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                  },
                },
                required: ["env"],
                additionalProperties: false,
                secret: true,
              },
              projectId: {
                type: "string",
              },
              teamId: {
                type: "string",
              },
              fetch: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.fetch",
              },
            },
            required: ["token", "projectId", "teamId"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              timeout: {
                type: "number",
              },
              name: {
                type: "string",
              },
              ports: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              resources: {
                type: "object",
                properties: {
                  vcpus: {
                    type: "number",
                  },
                },
                required: ["vcpus"],
                additionalProperties: false,
              },
              networkPolicy: {
                $ref: "#/$defs/option2",
              },
              env: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              tags: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              region: {
                $ref: "#/$defs/option13",
              },
              failoverRegions: {
                $ref: "#/$defs/option15",
              },
              mounts: {
                type: "object",
                properties: {},
                additionalProperties: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "object",
                    },
                    {
                      type: "object",
                      properties: {
                        drive: {
                          type: "string",
                        },
                        mode: {
                          anyOf: [
                            {
                              const: "read-write",
                            },
                            {
                              const: "snapshot",
                            },
                          ],
                        },
                      },
                      required: ["drive", "mode"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
              persistent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              snapshotExpiration: {
                type: "number",
              },
              keepLastSnapshots: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                  },
                  expiration: {
                    type: "number",
                  },
                  deleteEvicted: {
                    anyOf: [
                      {
                        const: false,
                      },
                      {
                        const: true,
                      },
                    ],
                  },
                },
                required: ["count"],
                additionalProperties: false,
              },
              onResume: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.onResume",
              },
              source: {
                type: "object",
                properties: {
                  type: {
                    const: "snapshot",
                  },
                  snapshotId: {
                    type: "string",
                  },
                },
                required: ["type", "snapshotId"],
                additionalProperties: false,
              },
              runtime: false,
              image: false,
              token: {
                type: "object",
                properties: {
                  env: {
                    type: "string",
                    pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                  },
                },
                required: ["env"],
                additionalProperties: false,
                secret: true,
              },
              projectId: {
                type: "string",
              },
              teamId: {
                type: "string",
              },
              fetch: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandboxProvider.vercel.create.fetch",
              },
            },
            required: ["source", "token", "projectId", "teamId"],
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      root: {
        type: "string",
      },
      retain: {
        type: "number",
      },
      connect: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "sandboxProvider.vercel.connect",
      },
    },
    additionalProperties: false,
    $defs: {
      option0: {
        anyOf: [
          {
            type: "object",
            properties: {
              type: {
                const: "git",
              },
              url: {
                type: "string",
              },
              depth: {
                type: "number",
              },
              revision: {
                type: "string",
              },
            },
            required: ["type", "url"],
            additionalProperties: false,
          },
          {
            $ref: "#/$defs/option1",
          },
          {
            type: "object",
            properties: {
              type: {
                const: "tarball",
              },
              url: {
                type: "string",
              },
            },
            required: ["type", "url"],
            additionalProperties: false,
          },
        ],
      },
      option1: {
        type: "object",
        properties: {
          type: {
            const: "git",
          },
          url: {
            type: "string",
          },
          username: {
            type: "object",
            properties: {
              env: {
                type: "string",
                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
              },
            },
            required: ["env"],
            additionalProperties: false,
            secret: true,
          },
          password: {
            type: "object",
            properties: {
              env: {
                type: "string",
                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
              },
            },
            required: ["env"],
            additionalProperties: false,
            secret: true,
          },
          depth: {
            type: "number",
          },
          revision: {
            type: "string",
          },
        },
        required: ["type", "url", "username", "password"],
        additionalProperties: false,
      },
      option2: {
        anyOf: [
          {
            const: "deny-all",
          },
          {
            const: "allow-all",
          },
          {
            $ref: "#/$defs/option3",
          },
        ],
      },
      option3: {
        type: "object",
        properties: {
          allow: {
            $ref: "#/$defs/option4",
          },
          subnets: {
            type: "object",
            properties: {
              allow: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              deny: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      option4: {
        anyOf: [
          {
            type: "array",
            items: {
              type: "string",
            },
          },
          {
            $ref: "#/$defs/option5",
          },
        ],
      },
      option5: {
        type: "object",
        properties: {},
        additionalProperties: {
          $ref: "#/$defs/option6",
        },
      },
      option6: {
        type: "array",
        items: {
          $ref: "#/$defs/option7",
        },
      },
      option7: {
        anyOf: [
          {
            $ref: "#/$defs/option8",
          },
          {
            $ref: "#/$defs/option12",
          },
        ],
      },
      option8: {
        type: "object",
        properties: {
          match: {
            $ref: "#/$defs/option9",
          },
          transform: {
            type: "array",
            items: {
              type: "object",
              properties: {
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
              },
              additionalProperties: false,
            },
          },
          forwardURL: false,
        },
        required: ["transform"],
        additionalProperties: false,
      },
      option9: {
        type: "object",
        properties: {
          path: {
            anyOf: [
              {
                type: "object",
                properties: {
                  exact: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  startsWith: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  regex: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
            ],
          },
          method: {
            type: "array",
            items: {
              type: "string",
            },
          },
          queryString: {
            $ref: "#/$defs/option10",
          },
          headers: {
            $ref: "#/$defs/option10",
          },
        },
        additionalProperties: false,
      },
      option10: {
        type: "array",
        items: {
          $ref: "#/$defs/option11",
        },
      },
      option11: {
        type: "object",
        properties: {
          key: {
            anyOf: [
              {
                type: "object",
                properties: {
                  exact: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  startsWith: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  regex: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
            ],
          },
          value: {
            anyOf: [
              {
                type: "object",
                properties: {
                  exact: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  startsWith: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  regex: {
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
            ],
          },
        },
        additionalProperties: false,
      },
      option12: {
        type: "object",
        properties: {
          match: {
            $ref: "#/$defs/option9",
          },
          transform: false,
          forwardURL: {
            type: "string",
          },
        },
        required: ["forwardURL"],
        additionalProperties: false,
      },
      option13: {
        anyOf: [
          {
            const: "iad1",
          },
          {
            const: "sfo1",
          },
          {
            const: "cle1",
          },
          {
            const: "cdg1",
          },
          {
            const: "fra1",
          },
          {
            const: "arn1",
          },
          {
            const: "sin1",
          },
          {
            const: "pdx1",
          },
          {
            const: "lhr1",
          },
          {
            const: "icn1",
          },
          {
            const: "bom1",
          },
          {
            const: "cpt1",
          },
          {
            const: "dub1",
          },
          {
            const: "gru1",
          },
          {
            const: "hkg1",
          },
          {
            const: "syd1",
          },
          {
            const: "yul1",
          },
          {
            const: "hnd1",
          },
          {
            const: "kix1",
          },
          {
            $ref: "#/$defs/option14",
          },
        ],
      },
      option14: {
        type: "object",
        properties: {
          toString: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          charAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.charAt",
          },
          charCodeAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.charCodeAt",
          },
          concat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.concat",
          },
          indexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.indexOf",
          },
          lastIndexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.lastIndexOf",
          },
          localeCompare: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.localeCompare",
          },
          match: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.match",
          },
          replace: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.replace",
          },
          search: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.search",
          },
          slice: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.slice",
          },
          split: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.split",
          },
          substring: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.substring",
          },
          toLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.toLowerCase",
          },
          toLocaleLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.toLocaleLowerCase",
          },
          toUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.toUpperCase",
          },
          toLocaleUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.toLocaleUpperCase",
          },
          trim: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.trim",
          },
          length: {
            type: "number",
          },
          substr: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.substr",
          },
          valueOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          codePointAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.codePointAt",
          },
          includes: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.includes",
          },
          endsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.endsWith",
          },
          normalize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.normalize",
          },
          repeat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.repeat",
          },
          startsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.startsWith",
          },
          anchor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.anchor",
          },
          big: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.big",
          },
          blink: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.blink",
          },
          bold: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.bold",
          },
          fixed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.fixed",
          },
          fontcolor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.fontcolor",
          },
          fontsize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.fontsize",
          },
          italics: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.italics",
          },
          link: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.link",
          },
          small: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.small",
          },
          strike: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.strike",
          },
          sub: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.sub",
          },
          sup: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.sup",
          },
          padStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.padStart",
          },
          padEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.padEnd",
          },
          trimEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.trimEnd",
          },
          trimStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.trimStart",
          },
          trimLeft: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.trimLeft",
          },
          trimRight: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.trimRight",
          },
          matchAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.matchAll",
          },
          replaceAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.replaceAll",
          },
          at: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.at",
          },
          isWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.isWellFormed",
          },
          toWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.region.toWellFormed",
          },
        },
        required: [
          "toString",
          "charAt",
          "charCodeAt",
          "concat",
          "indexOf",
          "lastIndexOf",
          "localeCompare",
          "match",
          "replace",
          "search",
          "slice",
          "split",
          "substring",
          "toLowerCase",
          "toLocaleLowerCase",
          "toUpperCase",
          "toLocaleUpperCase",
          "trim",
          "length",
          "substr",
          "valueOf",
          "codePointAt",
          "includes",
          "endsWith",
          "normalize",
          "repeat",
          "startsWith",
          "anchor",
          "big",
          "blink",
          "bold",
          "fixed",
          "fontcolor",
          "fontsize",
          "italics",
          "link",
          "small",
          "strike",
          "sub",
          "sup",
          "padStart",
          "padEnd",
          "trimEnd",
          "trimStart",
          "trimLeft",
          "trimRight",
          "matchAll",
          "replaceAll",
          "at",
          "isWellFormed",
          "toWellFormed",
        ],
        additionalProperties: false,
      },
      option15: {
        type: "array",
        items: {
          $ref: "#/$defs/option16",
        },
      },
      option16: {
        anyOf: [
          {
            const: "iad1",
          },
          {
            const: "sfo1",
          },
          {
            const: "cle1",
          },
          {
            const: "cdg1",
          },
          {
            const: "fra1",
          },
          {
            const: "arn1",
          },
          {
            const: "sin1",
          },
          {
            const: "pdx1",
          },
          {
            const: "lhr1",
          },
          {
            const: "icn1",
          },
          {
            const: "bom1",
          },
          {
            const: "cpt1",
          },
          {
            const: "dub1",
          },
          {
            const: "gru1",
          },
          {
            const: "hkg1",
          },
          {
            const: "syd1",
          },
          {
            const: "yul1",
          },
          {
            const: "hnd1",
          },
          {
            const: "kix1",
          },
          {
            $ref: "#/$defs/option17",
          },
        ],
      },
      option17: {
        type: "object",
        properties: {
          toString: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          charAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.charAt",
          },
          charCodeAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.charCodeAt",
          },
          concat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.concat",
          },
          indexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.indexOf",
          },
          lastIndexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.lastIndexOf",
          },
          localeCompare: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.localeCompare",
          },
          match: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.match",
          },
          replace: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.replace",
          },
          search: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.search",
          },
          slice: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.slice",
          },
          split: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.split",
          },
          substring: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.substring",
          },
          toLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.toLowerCase",
          },
          toLocaleLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.toLocaleLowerCase",
          },
          toUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.toUpperCase",
          },
          toLocaleUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.toLocaleUpperCase",
          },
          trim: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.trim",
          },
          length: {
            type: "number",
          },
          substr: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.substr",
          },
          valueOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          codePointAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.codePointAt",
          },
          includes: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.includes",
          },
          endsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.endsWith",
          },
          normalize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.normalize",
          },
          repeat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.repeat",
          },
          startsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.startsWith",
          },
          anchor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.anchor",
          },
          big: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.big",
          },
          blink: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.blink",
          },
          bold: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.bold",
          },
          fixed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.fixed",
          },
          fontcolor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.fontcolor",
          },
          fontsize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.fontsize",
          },
          italics: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.italics",
          },
          link: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.link",
          },
          small: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.small",
          },
          strike: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.strike",
          },
          sub: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.sub",
          },
          sup: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.sup",
          },
          padStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.padStart",
          },
          padEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.padEnd",
          },
          trimEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.trimEnd",
          },
          trimStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.trimStart",
          },
          trimLeft: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.trimLeft",
          },
          trimRight: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.trimRight",
          },
          matchAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.matchAll",
          },
          replaceAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.replaceAll",
          },
          at: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.failoverRegions.*.at",
          },
          isWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.isWellFormed",
          },
          toWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract:
              "sandboxProvider.vercel.create.failoverRegions.*.toWellFormed",
          },
        },
        required: [
          "toString",
          "charAt",
          "charCodeAt",
          "concat",
          "indexOf",
          "lastIndexOf",
          "localeCompare",
          "match",
          "replace",
          "search",
          "slice",
          "split",
          "substring",
          "toLowerCase",
          "toLocaleLowerCase",
          "toUpperCase",
          "toLocaleUpperCase",
          "trim",
          "length",
          "substr",
          "valueOf",
          "codePointAt",
          "includes",
          "endsWith",
          "normalize",
          "repeat",
          "startsWith",
          "anchor",
          "big",
          "blink",
          "bold",
          "fixed",
          "fontcolor",
          "fontsize",
          "italics",
          "link",
          "small",
          "strike",
          "sub",
          "sup",
          "padStart",
          "padEnd",
          "trimEnd",
          "trimStart",
          "trimLeft",
          "trimRight",
          "matchAll",
          "replaceAll",
          "at",
          "isWellFormed",
          "toWellFormed",
        ],
        additionalProperties: false,
      },
      option18: {
        anyOf: [
          {
            $ref: "#/$defs/option19",
          },
          {
            const: "node26",
          },
          {
            const: "node24",
          },
          {
            const: "node22",
          },
          {
            const: "python3.13",
          },
        ],
      },
      option19: {
        type: "object",
        properties: {
          toString: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          charAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.charAt",
          },
          charCodeAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.charCodeAt",
          },
          concat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.concat",
          },
          indexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.indexOf",
          },
          lastIndexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.lastIndexOf",
          },
          localeCompare: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.localeCompare",
          },
          match: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.match",
          },
          replace: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.replace",
          },
          search: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.search",
          },
          slice: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.slice",
          },
          split: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.split",
          },
          substring: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.substring",
          },
          toLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.toLowerCase",
          },
          toLocaleLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.toLocaleLowerCase",
          },
          toUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.toUpperCase",
          },
          toLocaleUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.toLocaleUpperCase",
          },
          trim: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.trim",
          },
          length: {
            type: "number",
          },
          substr: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.substr",
          },
          valueOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          codePointAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.codePointAt",
          },
          includes: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.includes",
          },
          endsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.endsWith",
          },
          normalize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.normalize",
          },
          repeat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.repeat",
          },
          startsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.startsWith",
          },
          anchor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.anchor",
          },
          big: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.big",
          },
          blink: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.blink",
          },
          bold: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.bold",
          },
          fixed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.fixed",
          },
          fontcolor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.fontcolor",
          },
          fontsize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.fontsize",
          },
          italics: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.italics",
          },
          link: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.link",
          },
          small: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.small",
          },
          strike: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.strike",
          },
          sub: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.sub",
          },
          sup: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.sup",
          },
          padStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.padStart",
          },
          padEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.padEnd",
          },
          trimEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.trimEnd",
          },
          trimStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.trimStart",
          },
          trimLeft: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.trimLeft",
          },
          trimRight: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.trimRight",
          },
          matchAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.matchAll",
          },
          replaceAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.replaceAll",
          },
          at: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.at",
          },
          isWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.isWellFormed",
          },
          toWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.runtime.toWellFormed",
          },
        },
        required: [
          "toString",
          "charAt",
          "charCodeAt",
          "concat",
          "indexOf",
          "lastIndexOf",
          "localeCompare",
          "match",
          "replace",
          "search",
          "slice",
          "split",
          "substring",
          "toLowerCase",
          "toLocaleLowerCase",
          "toUpperCase",
          "toLocaleUpperCase",
          "trim",
          "length",
          "substr",
          "valueOf",
          "codePointAt",
          "includes",
          "endsWith",
          "normalize",
          "repeat",
          "startsWith",
          "anchor",
          "big",
          "blink",
          "bold",
          "fixed",
          "fontcolor",
          "fontsize",
          "italics",
          "link",
          "small",
          "strike",
          "sub",
          "sup",
          "padStart",
          "padEnd",
          "trimEnd",
          "trimStart",
          "trimLeft",
          "trimRight",
          "matchAll",
          "replaceAll",
          "at",
          "isWellFormed",
          "toWellFormed",
        ],
        additionalProperties: false,
      },
      option20: {
        anyOf: [
          {
            $ref: "#/$defs/option21",
          },
          {
            const: "vercel/sandbox/universal",
          },
          {
            const: "vercel/sandbox/node:22",
          },
          {
            const: "vercel/sandbox/node:24",
          },
          {
            const: "vercel/sandbox/node:26",
          },
          {
            const: "vercel/sandbox/python:3.14",
          },
          {
            const: "vercel/sandbox/ubuntu",
          },
          {
            const: "vercel/sandbox/arch",
          },
        ],
      },
      option21: {
        type: "object",
        properties: {
          toString: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          charAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.charAt",
          },
          charCodeAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.charCodeAt",
          },
          concat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.concat",
          },
          indexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.indexOf",
          },
          lastIndexOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.lastIndexOf",
          },
          localeCompare: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.localeCompare",
          },
          match: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.match",
          },
          replace: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.replace",
          },
          search: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.search",
          },
          slice: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.slice",
          },
          split: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.split",
          },
          substring: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.substring",
          },
          toLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.toLowerCase",
          },
          toLocaleLowerCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.toLocaleLowerCase",
          },
          toUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.toUpperCase",
          },
          toLocaleUpperCase: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.toLocaleUpperCase",
          },
          trim: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.trim",
          },
          length: {
            type: "number",
          },
          substr: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.substr",
          },
          valueOf: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
          },
          codePointAt: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.codePointAt",
          },
          includes: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.includes",
          },
          endsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.endsWith",
          },
          normalize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.normalize",
          },
          repeat: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.repeat",
          },
          startsWith: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.startsWith",
          },
          anchor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.anchor",
          },
          big: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.big",
          },
          blink: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.blink",
          },
          bold: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.bold",
          },
          fixed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.fixed",
          },
          fontcolor: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.fontcolor",
          },
          fontsize: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.fontsize",
          },
          italics: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.italics",
          },
          link: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.link",
          },
          small: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.small",
          },
          strike: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.strike",
          },
          sub: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.sub",
          },
          sup: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.sup",
          },
          padStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.padStart",
          },
          padEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.padEnd",
          },
          trimEnd: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.trimEnd",
          },
          trimStart: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.trimStart",
          },
          trimLeft: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.trimLeft",
          },
          trimRight: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.trimRight",
          },
          matchAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.matchAll",
          },
          replaceAll: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.replaceAll",
          },
          at: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.at",
          },
          isWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.isWellFormed",
          },
          toWellFormed: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "callback",
            contract: "sandboxProvider.vercel.create.image.toWellFormed",
          },
        },
        required: [
          "toString",
          "charAt",
          "charCodeAt",
          "concat",
          "indexOf",
          "lastIndexOf",
          "localeCompare",
          "match",
          "replace",
          "search",
          "slice",
          "split",
          "substring",
          "toLowerCase",
          "toLocaleLowerCase",
          "toUpperCase",
          "toLocaleUpperCase",
          "trim",
          "length",
          "substr",
          "valueOf",
          "codePointAt",
          "includes",
          "endsWith",
          "normalize",
          "repeat",
          "startsWith",
          "anchor",
          "big",
          "blink",
          "bold",
          "fixed",
          "fontcolor",
          "fontsize",
          "italics",
          "link",
          "small",
          "strike",
          "sub",
          "sup",
          "padStart",
          "padEnd",
          "trimEnd",
          "trimStart",
          "trimLeft",
          "trimRight",
          "matchAll",
          "replaceAll",
          "at",
          "isWellFormed",
          "toWellFormed",
        ],
        additionalProperties: false,
      },
    },
  },
  "sandboxProvider.daytona": {
    type: "object",
    properties: {
      caches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            transport: {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "transport",
            },
            name: {
              type: "string",
            },
            key: {
              type: "string",
            },
          },
          required: ["transport", "name", "key"],
          additionalProperties: false,
        },
      },
      repositoryMode: {
        const: "isolated",
      },
      egress: {
        anyOf: [
          {
            type: "object",
            properties: {
              mode: {
                const: "deny-all",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "allowlist",
              },
              domains: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              allowCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              denyCidrs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
        ],
      },
      connection: {
        type: "object",
        properties: {
          apiKey: {
            type: "object",
            properties: {
              env: {
                type: "string",
                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
              },
            },
            required: ["env"],
            additionalProperties: false,
            secret: true,
          },
          jwtToken: {
            type: "object",
            properties: {
              env: {
                type: "string",
                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
              },
            },
            required: ["env"],
            additionalProperties: false,
            secret: true,
          },
          organizationId: {
            type: "string",
          },
          apiUrl: {
            type: "string",
          },
          serverUrl: {
            type: "string",
          },
          target: {
            type: "string",
          },
          otelEnabled: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          useDeprecatedPolling: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          requestTimeoutMs: {
            type: "number",
          },
          _experimental: {
            type: "object",
            properties: {},
            additionalProperties: {},
          },
        },
        additionalProperties: false,
      },
      create: {
        anyOf: [
          {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              user: {
                type: "string",
              },
              language: {
                type: "string",
              },
              envVars: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              labels: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              public: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              autoStopInterval: {
                type: "number",
              },
              autoPauseInterval: {
                type: "number",
              },
              autoArchiveInterval: {
                type: "number",
              },
              autoDeleteInterval: {
                type: "number",
              },
              ttlMinutes: {
                type: "number",
              },
              volumes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    volumeId: {
                      type: "string",
                    },
                    mountPath: {
                      type: "string",
                    },
                    subpath: {
                      type: "string",
                    },
                  },
                  required: ["volumeId", "mountPath"],
                  additionalProperties: false,
                },
              },
              networkBlockAll: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              networkAllowList: {
                type: "string",
              },
              domainAllowList: {
                type: "string",
              },
              outboundProxyUrl: {
                type: "string",
              },
              otelEndpointOverride: {
                type: "string",
              },
              ephemeral: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              spot: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              linkedSandbox: {
                type: "string",
              },
              secrets: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              image: {
                anyOf: [
                  {
                    type: "string",
                  },
                  {
                    type: "object",
                    properties: {
                      $ref: {
                        type: "string",
                        minLength: 1,
                      },
                    },
                    required: ["$ref"],
                    additionalProperties: false,
                    component: "object",
                  },
                ],
              },
              resources: {
                type: "object",
                properties: {
                  cpu: {
                    type: "number",
                  },
                  gpu: {
                    type: "number",
                  },
                  gpuType: {
                    anyOf: [
                      {
                        const: "H100",
                      },
                      {
                        const: "H200",
                      },
                      {
                        const: "MI355X",
                      },
                      {
                        const: "RTX-PRO-6000",
                      },
                      {
                        const: "RTX-4090",
                      },
                      {
                        const: "RTX-5090",
                      },
                      {
                        const: "11184809",
                      },
                      {
                        type: "array",
                        items: {
                          anyOf: [
                            {
                              const: "H100",
                            },
                            {
                              const: "H200",
                            },
                            {
                              const: "MI355X",
                            },
                            {
                              const: "RTX-PRO-6000",
                            },
                            {
                              const: "RTX-4090",
                            },
                            {
                              const: "RTX-5090",
                            },
                            {
                              const: "11184809",
                            },
                          ],
                        },
                      },
                    ],
                  },
                  memory: {
                    type: "number",
                  },
                  disk: {
                    type: "number",
                  },
                },
                additionalProperties: false,
              },
            },
            required: ["image"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              user: {
                type: "string",
              },
              language: {
                type: "string",
              },
              envVars: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              labels: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              public: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              autoStopInterval: {
                type: "number",
              },
              autoPauseInterval: {
                type: "number",
              },
              autoArchiveInterval: {
                type: "number",
              },
              autoDeleteInterval: {
                type: "number",
              },
              ttlMinutes: {
                type: "number",
              },
              volumes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    volumeId: {
                      type: "string",
                    },
                    mountPath: {
                      type: "string",
                    },
                    subpath: {
                      type: "string",
                    },
                  },
                  required: ["volumeId", "mountPath"],
                  additionalProperties: false,
                },
              },
              networkBlockAll: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              networkAllowList: {
                type: "string",
              },
              domainAllowList: {
                type: "string",
              },
              outboundProxyUrl: {
                type: "string",
              },
              otelEndpointOverride: {
                type: "string",
              },
              ephemeral: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              spot: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              linkedSandbox: {
                type: "string",
              },
              secrets: {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "string",
                },
              },
              snapshot: {
                type: "string",
              },
            },
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      root: {
        type: "string",
      },
      retain: {
        type: "number",
      },
      connect: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "callback",
        contract: "sandboxProvider.daytona.connect",
      },
    },
    additionalProperties: false,
  },
  "sandboxProvider.firecracker": {
    type: "object",
    properties: {
      binary: {
        type: "string",
      },
      kernel: {
        type: "string",
        hostPath: true,
      },
      rootfs: {
        type: "string",
        hostPath: true,
      },
      tap: {
        type: "string",
      },
      guestMac: {
        type: "string",
      },
      bootArgs: {
        type: "string",
      },
      ssh: {
        type: "object",
        properties: {
          host: {
            type: "string",
          },
          user: {
            type: "string",
          },
          identity: {
            type: "string",
            hostPath: true,
          },
          knownHosts: {
            type: "string",
            hostPath: true,
          },
          port: {
            type: "number",
          },
          binary: {
            type: "string",
          },
        },
        required: ["host", "user", "identity", "knownHosts"],
        additionalProperties: false,
      },
      root: {
        type: "string",
      },
      home: {
        type: "string",
      },
      cpus: {
        type: "number",
      },
      memoryMb: {
        type: "number",
      },
      bootDeadlineMs: {
        type: "number",
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      jailer: {
        type: "object",
        properties: {
          binary: {
            type: "string",
          },
          directory: {
            type: "string",
            hostPath: true,
          },
          cgroup: {
            type: "string",
          },
          uid: {
            type: "number",
          },
          gid: {
            type: "number",
          },
          cpuQuotaUs: {
            type: "number",
          },
          memoryMaxMb: {
            type: "number",
          },
          processes: {
            type: "number",
          },
        },
        required: [
          "binary",
          "directory",
          "cgroup",
          "uid",
          "gid",
          "cpuQuotaUs",
          "memoryMaxMb",
          "processes",
        ],
        additionalProperties: false,
      },
    },
    required: [
      "binary",
      "kernel",
      "rootfs",
      "tap",
      "guestMac",
      "bootArgs",
      "ssh",
      "home",
    ],
    additionalProperties: false,
  },
  "profile.portable": {
    type: "object",
    properties: {
      instructions: {
        type: "string",
      },
      allowedTools: {
        type: "array",
        items: {
          anyOf: [
            {
              const: "read",
            },
            {
              const: "edit",
            },
            {
              const: "shell",
            },
            {
              type: "string",
            },
          ],
        },
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    additionalProperties: false,
  },
  "secretSource.vault": {
    type: "object",
    properties: {
      address: {
        type: "string",
      },
      token: {
        type: "object",
        properties: {
          env: {
            type: "string",
            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
          },
        },
        required: ["env"],
        additionalProperties: false,
        secret: true,
      },
      mount: {
        type: "string",
      },
      path: {
        type: "string",
      },
      version: {
        type: "number",
      },
      namespace: {
        type: "string",
      },
    },
    required: ["address", "token", "mount", "path"],
    additionalProperties: false,
  },
  "secretSource.aws": {
    type: "object",
    properties: {
      client: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "object",
      },
      secrets: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            field: {
              type: "string",
            },
            versionId: {
              type: "string",
            },
            versionStage: {
              type: "string",
            },
          },
          required: ["id"],
          additionalProperties: false,
        },
      },
    },
    required: ["client", "secrets"],
    additionalProperties: false,
  },
  "secretSource.azure": {
    type: "object",
    properties: {
      client: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "object",
      },
      secrets: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            version: {
              type: "string",
            },
          },
          required: ["name"],
          additionalProperties: false,
        },
      },
    },
    required: ["client", "secrets"],
    additionalProperties: false,
  },
  "secretSource.gcp": {
    type: "object",
    properties: {
      client: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "object",
      },
      secrets: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "string",
        },
      },
    },
    required: ["client", "secrets"],
    additionalProperties: false,
  },
  "secretSource.onepassword": {
    type: "object",
    properties: {
      client: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "object",
      },
      secrets: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "string",
        },
      },
    },
    required: ["client", "secrets"],
    additionalProperties: false,
  },
  "secretSource.infisical": {
    type: "object",
    properties: {
      client: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "object",
      },
      projectId: {
        type: "string",
      },
      environment: {
        type: "string",
      },
      path: {
        type: "string",
      },
    },
    required: ["client", "projectId", "environment"],
    additionalProperties: false,
  },
  "sandbox.options": {
    type: "object",
    properties: {
      includeUncommitted: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      agent: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "agent",
          },
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "agent",
          },
          {
            type: "object",
            properties: {
              kind: {
                const: "replay",
              },
              source: {
                anyOf: [
                  {
                    const: "agent",
                  },
                  {
                    const: "harness",
                  },
                ],
              },
              divergence: {
                anyOf: [
                  {
                    const: "warn",
                  },
                  {
                    const: "fail",
                  },
                ],
              },
              turns: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    prompt: {
                      type: "string",
                    },
                    events: {
                      type: "array",
                      items: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-route",
                              },
                              step: {
                                type: "number",
                              },
                              choice: {
                                type: "string",
                              },
                              model: {
                                type: "object",
                                properties: {
                                  name: {
                                    type: "string",
                                  },
                                  reasoning: {
                                    anyOf: [
                                      {
                                        const: "none",
                                      },
                                      {
                                        const: "minimal",
                                      },
                                      {
                                        const: "low",
                                      },
                                      {
                                        const: "medium",
                                      },
                                      {
                                        const: "high",
                                      },
                                      {
                                        const: "xhigh",
                                      },
                                      {
                                        const: "max",
                                      },
                                    ],
                                  },
                                  maxOutputTokens: {
                                    type: "number",
                                  },
                                },
                                required: ["name"],
                                additionalProperties: false,
                              },
                              reason: {
                                anyOf: [
                                  {
                                    const: "selected",
                                  },
                                  {
                                    const: "confidence",
                                  },
                                  {
                                    const: "unavailable",
                                  },
                                ],
                              },
                              confidence: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "step",
                              "choice",
                              "model",
                              "reason",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "subagent",
                              },
                              id: {
                                type: "string",
                              },
                              callId: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              status: {
                                anyOf: [
                                  {
                                    const: "started",
                                  },
                                  {
                                    const: "finished",
                                  },
                                  {
                                    const: "failed",
                                  },
                                ],
                              },
                              conversation: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "id",
                              "callId",
                              "name",
                              "status",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "message-usage",
                              },
                              tokens: {
                                $ref: "#/$defs/option0",
                              },
                              messageId: {
                                type: "string",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "tokens"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stderr",
                              },
                              text: {
                                type: "string",
                              },
                              truncated: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stopped",
                              },
                              reason: {
                                anyOf: [
                                  {
                                    const: "completion",
                                  },
                                  {
                                    const: "idle-timeout",
                                  },
                                  {
                                    const: "deadline",
                                  },
                                  {
                                    const: "aborted",
                                  },
                                  {
                                    const: "oversized-event",
                                  },
                                  {
                                    const: "steered",
                                  },
                                  {
                                    const: "stuck",
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "reason"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "steer",
                              },
                              text: {
                                type: "string",
                              },
                              mode: {
                                anyOf: [
                                  {
                                    const: "injected",
                                  },
                                  {
                                    const: "resumed",
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text", "mode"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "reasoning",
                              },
                              text: {
                                type: "string",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "file-change",
                              },
                              changes: {},
                              callId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "changes"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-request",
                              },
                              request: {},
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "request"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-response",
                              },
                              response: {},
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "response"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-retry",
                              },
                              attempt: {
                                type: "number",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "attempt"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "model-error",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "hook",
                              },
                              phase: {
                                type: "string",
                              },
                              changed: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "phase", "changed"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "instructions-loaded",
                              },
                              count: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "count"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "skills-loaded",
                              },
                              names: {
                                type: "array",
                                items: {
                                  type: "string",
                                },
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "names"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool-output",
                              },
                              callId: {
                                type: "string",
                              },
                              channel: {
                                anyOf: [
                                  {
                                    const: "stdout",
                                  },
                                  {
                                    const: "stderr",
                                  },
                                ],
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "callId", "channel", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "phase",
                              },
                              name: {
                                type: "string",
                              },
                              agent: {
                                type: "string",
                              },
                              branch: {
                                type: "string",
                              },
                              directory: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "name"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "summary",
                              },
                              durationMs: {
                                type: "number",
                              },
                              status: {
                                type: "number",
                              },
                              tokens: {
                                $ref: "#/$defs/option0",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "durationMs",
                              "status",
                              "tokens",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "warning",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "text",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "text-delta",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "result",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "prompt",
                              },
                              text: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "text"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool",
                              },
                              name: {
                                type: "string",
                              },
                              input: {},
                              callId: {
                                type: "string",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "name", "input"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool-result",
                              },
                              callId: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              isError: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              preview: {
                                type: "string",
                              },
                              characters: {
                                type: "number",
                              },
                              parentCallId: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "callId",
                              "name",
                              "isError",
                              "preview",
                              "characters",
                            ],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "step",
                              },
                              index: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "index"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "tool-denied",
                              },
                              callId: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              reason: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "callId", "name", "reason"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stop-prevented",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "compaction",
                              },
                              strategy: {
                                type: "string",
                              },
                              messages: {
                                type: "number",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "strategy", "messages"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "conversation",
                              },
                              id: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "id"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "usage",
                              },
                              tokens: {
                                $ref: "#/$defs/option0",
                              },
                              cumulative: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "tokens"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "failure",
                              },
                              message: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "quota",
                              },
                              message: {
                                type: "string",
                              },
                              resetAt: {
                                type: "string",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "message"],
                            additionalProperties: false,
                          },
                          {
                            $ref: "#/$defs/option1",
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "finished",
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "raw",
                              },
                              value: {},
                              bytes: {
                                type: "number",
                              },
                              truncated: {
                                anyOf: [
                                  {
                                    const: false,
                                  },
                                  {
                                    const: true,
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: ["kind", "value"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              kind: {
                                const: "stuck",
                              },
                              activity: {
                                anyOf: [
                                  {
                                    const: "file-change",
                                  },
                                  {
                                    const: "tool",
                                  },
                                ],
                              },
                              name: {
                                type: "string",
                              },
                              repeats: {
                                type: "number",
                              },
                              window: {
                                type: "number",
                              },
                              action: {
                                anyOf: [
                                  {
                                    const: "warn",
                                  },
                                  {
                                    const: "steer",
                                  },
                                  {
                                    const: "stop",
                                  },
                                ],
                              },
                              subagentId: {
                                type: "string",
                              },
                            },
                            required: [
                              "kind",
                              "activity",
                              "repeats",
                              "window",
                              "action",
                            ],
                            additionalProperties: false,
                          },
                        ],
                      },
                    },
                    decisionEvents: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          before: {
                            type: "number",
                          },
                          event: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  kind: {
                                    const: "decision",
                                  },
                                  status: {
                                    anyOf: [
                                      {
                                        const: "started",
                                      },
                                      {
                                        const: "finished",
                                      },
                                      {
                                        const: "failed",
                                      },
                                    ],
                                  },
                                  provider: {
                                    type: "string",
                                  },
                                  model: {
                                    type: "string",
                                  },
                                  durationMs: {
                                    type: "number",
                                  },
                                  usage: {
                                    $ref: "#/$defs/option0",
                                  },
                                  truncated: {
                                    anyOf: [
                                      {
                                        const: false,
                                      },
                                      {
                                        const: true,
                                      },
                                    ],
                                  },
                                  code: {
                                    type: "string",
                                  },
                                },
                                required: [
                                  "kind",
                                  "status",
                                  "provider",
                                  "model",
                                ],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  kind: {
                                    const: "decision-request",
                                  },
                                  request: {},
                                },
                                required: ["kind", "request"],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  kind: {
                                    const: "decision-response",
                                  },
                                  response: {},
                                },
                                required: ["kind", "response"],
                                additionalProperties: false,
                              },
                            ],
                          },
                          subagentId: {
                            type: "string",
                          },
                        },
                        required: ["before", "event"],
                        additionalProperties: false,
                      },
                    },
                    text: {
                      type: "string",
                    },
                    usage: {
                      $ref: "#/$defs/option0",
                    },
                    conversation: {
                      type: "string",
                    },
                    failure: {
                      type: "object",
                      properties: {
                        code: {
                          anyOf: [
                            {
                              const: "provider",
                            },
                            {
                              const: "workspace",
                            },
                            {
                              const: "guard",
                            },
                            {
                              const: "steering",
                            },
                            {
                              const: "response",
                            },
                            {
                              const: "replay",
                            },
                            {
                              const: "aborted",
                            },
                            {
                              const: "stuck",
                            },
                            {
                              const: "prompt",
                            },
                            {
                              const: "quota",
                            },
                            {
                              const: "rejected",
                            },
                            {
                              const: "configuration",
                            },
                            {
                              const: "process",
                            },
                            {
                              const: "timeout",
                            },
                            {
                              const: "conflict",
                            },
                            {
                              const: "session",
                            },
                            {
                              const: "limit",
                            },
                          ],
                        },
                        message: {
                          type: "string",
                        },
                      },
                      required: ["code", "message"],
                      additionalProperties: false,
                    },
                    handover: {
                      $ref: "#/$defs/option1",
                    },
                    changes: {
                      anyOf: [
                        {
                          type: "object",
                          properties: {
                            kind: {
                              const: "workspace-commits",
                            },
                            baseline: {
                              type: "object",
                              properties: {
                                commit: {
                                  type: "string",
                                },
                                tree: {
                                  type: "string",
                                },
                              },
                              required: ["commit", "tree"],
                              additionalProperties: false,
                            },
                            commits: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  oid: {
                                    type: "string",
                                  },
                                  tree: {
                                    type: "string",
                                  },
                                  author: {
                                    type: "object",
                                    properties: {
                                      name: {
                                        type: "string",
                                      },
                                      email: {
                                        type: "string",
                                      },
                                      date: {
                                        type: "string",
                                      },
                                    },
                                    required: ["name", "email", "date"],
                                    additionalProperties: false,
                                  },
                                  committer: {
                                    type: "object",
                                    properties: {
                                      name: {
                                        type: "string",
                                      },
                                      email: {
                                        type: "string",
                                      },
                                      date: {
                                        type: "string",
                                      },
                                    },
                                    required: ["name", "email", "date"],
                                    additionalProperties: false,
                                  },
                                  message: {
                                    type: "string",
                                  },
                                  patch: {
                                    type: "string",
                                  },
                                },
                                required: [
                                  "oid",
                                  "tree",
                                  "author",
                                  "committer",
                                  "message",
                                  "patch",
                                ],
                                additionalProperties: false,
                              },
                            },
                          },
                          required: ["kind", "baseline", "commits"],
                          additionalProperties: false,
                        },
                        {
                          type: "object",
                          properties: {
                            kind: {
                              const: "workspace-commits",
                            },
                            baseline: {
                              type: "object",
                              properties: {
                                commit: {
                                  type: "string",
                                },
                                tree: {
                                  type: "string",
                                },
                              },
                              required: ["commit", "tree"],
                              additionalProperties: false,
                            },
                            unavailable: {
                              type: "string",
                            },
                          },
                          required: ["kind", "unavailable"],
                          additionalProperties: false,
                        },
                      ],
                    },
                    resumedBy: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    interrupted: {
                      anyOf: [
                        {
                          const: false,
                        },
                        {
                          const: true,
                        },
                      ],
                    },
                  },
                  required: ["prompt", "events", "text", "usage"],
                  additionalProperties: false,
                },
              },
              remainingTurns: {
                type: "number",
              },
              nextTurn: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandbox.options.agent.nextTurn",
              },
              pendingSteering: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandbox.options.agent.pendingSteering",
              },
              usageInput: {
                anyOf: [
                  {
                    const: "inclusive",
                  },
                  {
                    const: "uncached",
                  },
                ],
              },
              name: {
                type: "string",
              },
              bootstrap: {
                type: "string",
              },
              requiresFinishedEvent: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              usage: {
                anyOf: [
                  {
                    const: "unavailable",
                  },
                  {
                    const: "session",
                  },
                  {
                    const: "events",
                  },
                ],
              },
              variables: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      $ref: {
                        type: "string",
                        minLength: 1,
                      },
                    },
                    required: ["$ref"],
                    additionalProperties: false,
                    component: "variables",
                  },
                  {
                    type: "object",
                    additionalProperties: {
                      anyOf: [
                        {
                          type: "string",
                        },
                        {
                          type: "object",
                          properties: {
                            env: {
                              type: "string",
                              pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                            },
                          },
                          required: ["env"],
                          additionalProperties: false,
                          secret: true,
                        },
                      ],
                    },
                  },
                ],
              },
              storage: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "conversations",
              },
              capture: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              resumable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              forkable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              transcriptUsage: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "callback",
                contract: "sandbox.options.agent.transcriptUsage",
              },
            },
            required: [
              "kind",
              "source",
              "divergence",
              "turns",
              "remainingTurns",
              "nextTurn",
              "pendingSteering",
              "name",
            ],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              kind: {
                const: "fallback",
              },
              agents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "agent",
                },
              },
              on: {
                type: "array",
                items: {
                  anyOf: [
                    {
                      const: "unavailable",
                    },
                    {
                      const: "quota",
                    },
                  ],
                },
              },
            },
            required: ["kind", "agents", "on"],
            additionalProperties: false,
          },
        ],
      },
      sandboxProvider: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "sandboxProvider",
      },
      workspace: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "workspace",
      },
      hooks: {
        type: "object",
        properties: {
          workspaceReady: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: {
                  type: "object",
                  properties: {
                    kind: {
                      const: "changed",
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["kind", "files"],
                  additionalProperties: false,
                },
                executable: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                stdin: {
                  type: "string",
                },
                input: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "object",
                },
                directory: {
                  type: "string",
                },
                variables: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "variables",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        anyOf: [
                          {
                            type: "string",
                          },
                          {
                            type: "object",
                            properties: {
                              env: {
                                type: "string",
                                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                              },
                            },
                            required: ["env"],
                            additionalProperties: false,
                            secret: true,
                          },
                        ],
                      },
                    },
                  ],
                },
                deadlineMs: {
                  type: "number",
                },
                interactive: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                terminal: {
                  $ref: "#/$defs/option2",
                },
                elevated: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                retain: {
                  type: "number",
                },
                observe: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "callback",
                  contract: "sandbox.options.hooks.workspaceReady.*.observe",
                },
              },
              required: ["executable"],
              additionalProperties: false,
            },
          },
          hostReady: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: {
                  type: "object",
                  properties: {
                    kind: {
                      const: "changed",
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["kind", "files"],
                  additionalProperties: false,
                },
                executable: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                stdin: {
                  type: "string",
                },
                input: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "object",
                },
                directory: {
                  type: "string",
                },
                variables: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "variables",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        anyOf: [
                          {
                            type: "string",
                          },
                          {
                            type: "object",
                            properties: {
                              env: {
                                type: "string",
                                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                              },
                            },
                            required: ["env"],
                            additionalProperties: false,
                            secret: true,
                          },
                        ],
                      },
                    },
                  ],
                },
                deadlineMs: {
                  type: "number",
                },
                interactive: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                terminal: {
                  $ref: "#/$defs/option2",
                },
                elevated: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                retain: {
                  type: "number",
                },
                observe: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "callback",
                  contract: "sandbox.options.hooks.hostReady.*.observe",
                },
              },
              required: ["executable"],
              additionalProperties: false,
            },
          },
          sandboxReady: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: {
                  type: "object",
                  properties: {
                    kind: {
                      const: "changed",
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["kind", "files"],
                  additionalProperties: false,
                },
                executable: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                stdin: {
                  type: "string",
                },
                input: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "object",
                },
                directory: {
                  type: "string",
                },
                variables: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        $ref: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: ["$ref"],
                      additionalProperties: false,
                      component: "variables",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        anyOf: [
                          {
                            type: "string",
                          },
                          {
                            type: "object",
                            properties: {
                              env: {
                                type: "string",
                                pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                              },
                            },
                            required: ["env"],
                            additionalProperties: false,
                            secret: true,
                          },
                        ],
                      },
                    },
                  ],
                },
                deadlineMs: {
                  type: "number",
                },
                interactive: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                terminal: {
                  $ref: "#/$defs/option2",
                },
                elevated: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                retain: {
                  type: "number",
                },
                observe: {
                  type: "object",
                  properties: {
                    $ref: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["$ref"],
                  additionalProperties: false,
                  component: "callback",
                  contract: "sandbox.options.hooks.sandboxReady.*.observe",
                },
              },
              required: ["executable"],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
      logging: {
        anyOf: [
          {
            const: false,
          },
          {
            const: "stdout",
          },
          {
            type: "object",
            properties: {
              transporter: {
                type: "object",
                properties: {
                  $ref: {
                    type: "string",
                    minLength: 1,
                  },
                },
                required: ["$ref"],
                additionalProperties: false,
                component: "transport",
              },
              verbose: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              replayable: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
            },
            additionalProperties: false,
          },
        ],
      },
      bootstrap: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      conversationHome: {
        type: "string",
        hostPath: true,
      },
      recoveryTransport: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "transport",
      },
      activityTransport: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "transport",
      },
      guard: {
        type: "object",
        properties: {
          protectedPaths: {
            type: "array",
            items: {
              type: "string",
            },
          },
          maxChangedLines: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
      observation: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "observation",
      },
      storageQuota: {
        type: "object",
        properties: {
          transporter: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "transport",
          },
          maxBytes: {
            type: "number",
          },
          reserveBytes: {
            type: "number",
          },
          maxEntries: {
            type: "number",
          },
        },
        required: ["maxBytes", "reserveBytes"],
        additionalProperties: false,
      },
      repository: {
        type: "string",
        hostPath: true,
      },
      branch: {
        anyOf: [
          {
            type: "object",
            properties: {
              mode: {
                const: "current",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "named",
              },
              name: {
                type: "string",
              },
              from: {
                type: "string",
              },
            },
            required: ["mode", "name"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              mode: {
                const: "integrate",
              },
              from: {
                type: "string",
              },
            },
            required: ["mode"],
            additionalProperties: false,
          },
        ],
      },
      copies: {
        type: "array",
        items: {
          type: "string",
        },
      },
      limits: {
        type: "object",
        properties: {
          copyMs: {
            type: "number",
          },
          gitMs: {
            type: "number",
          },
          collectMs: {
            type: "number",
          },
          mergeMs: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
      label: {
        type: "string",
      },
    },
    additionalProperties: false,
    $defs: {
      option0: {
        type: "object",
        properties: {
          models: {
            type: "object",
            properties: {},
            additionalProperties: {
              type: "object",
              properties: {
                inputIncludesCache: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                complete: {
                  anyOf: [
                    {
                      const: false,
                    },
                    {
                      const: true,
                    },
                  ],
                },
                input: {
                  type: "number",
                },
                cached: {
                  type: "number",
                },
                cacheCreated: {
                  type: "number",
                },
                output: {
                  type: "number",
                },
              },
              required: ["input", "cached", "output"],
              additionalProperties: false,
            },
          },
          complete: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          input: {
            type: "number",
          },
          cached: {
            type: "number",
          },
          cacheCreated: {
            type: "number",
          },
          output: {
            type: "number",
          },
        },
        required: ["input", "cached", "output"],
        additionalProperties: false,
      },
      option1: {
        type: "object",
        properties: {
          kind: {
            const: "fallback",
          },
          from: {
            type: "object",
            properties: {
              index: {
                type: "number",
              },
              name: {
                type: "string",
              },
              model: {
                type: "string",
              },
            },
            required: ["index", "name"],
            additionalProperties: false,
          },
          to: {
            type: "object",
            properties: {
              index: {
                type: "number",
              },
              name: {
                type: "string",
              },
              model: {
                type: "string",
              },
            },
            required: ["index", "name"],
            additionalProperties: false,
          },
          failure: {
            anyOf: [
              {
                const: "unavailable",
              },
              {
                const: "quota",
              },
            ],
          },
          message: {
            type: "string",
          },
          resetAt: {
            type: "string",
          },
          subagentId: {
            type: "string",
          },
        },
        required: ["kind", "from", "to", "failure", "message"],
        additionalProperties: false,
      },
      option2: {
        type: "object",
        properties: {
          input: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "object",
          },
          output: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "object",
          },
          error: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "object",
          },
        },
        additionalProperties: false,
      },
    },
  },
  "harness.codex": {
    type: "object",
    properties: {
      modelProvider: {
        type: "object",
        properties: {
          baseUrl: {
            type: "string",
          },
          apiKeyEnvironment: {
            anyOf: [
              {
                type: "string",
              },
              {
                const: false,
              },
            ],
          },
        },
        required: ["baseUrl"],
        additionalProperties: false,
      },
      approvalReviewer: {
        anyOf: [
          {
            const: "user",
          },
          {
            const: "auto_review",
          },
        ],
      },
      authentication: {
        anyOf: [
          {
            const: "usage",
          },
          {
            const: "account",
          },
          {
            type: "object",
            properties: {
              account: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        hostPath: true,
                      },
                    },
                    required: ["file"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["account"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              usage: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["usage"],
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      saveConversations: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      conversations: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "conversations",
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
      profile: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "profile",
      },
    },
    additionalProperties: false,
  },
  "harness.claude": {
    type: "object",
    properties: {
      partialMessages: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      permissions: {
        anyOf: [
          {
            const: "default",
          },
          {
            const: "acceptEdits",
          },
          {
            const: "plan",
          },
          {
            const: "auto",
          },
          {
            const: "dontAsk",
          },
          {
            const: "bypassPermissions",
          },
        ],
      },
      authentication: {
        anyOf: [
          {
            const: "usage",
          },
          {
            const: "account",
          },
          {
            type: "object",
            properties: {
              account: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        hostPath: true,
                      },
                    },
                    required: ["file"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["account"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              usage: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["usage"],
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      saveConversations: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
      },
      conversations: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "conversations",
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
      profile: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "profile",
      },
    },
    additionalProperties: false,
  },
  "harness.agy": {
    type: "object",
    properties: {
      authentication: {
        anyOf: [
          {
            const: "usage",
          },
          {
            const: "account",
          },
          {
            type: "object",
            properties: {
              account: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        hostPath: true,
                      },
                    },
                    required: ["file"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["account"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              usage: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["usage"],
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
      profile: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "profile",
      },
      mode: {
        anyOf: [
          {
            const: "plan",
          },
          {
            const: "accept-edits",
          },
        ],
      },
    },
    additionalProperties: false,
  },
  "harness.copilot": {
    type: "object",
    properties: {
      authentication: {
        anyOf: [
          {
            const: "usage",
          },
          {
            const: "account",
          },
          {
            type: "object",
            properties: {
              account: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        hostPath: true,
                      },
                    },
                    required: ["file"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["account"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              usage: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["usage"],
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      conversations: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "conversations",
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
      profile: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "profile",
      },
    },
    additionalProperties: false,
  },
  "harness.kimi": {
    type: "object",
    properties: {
      region: {
        anyOf: [
          {
            const: "mainland-cn",
          },
          {
            const: "global",
          },
        ],
      },
      authentication: {
        anyOf: [
          {
            const: "usage",
          },
          {
            const: "account",
          },
          {
            type: "object",
            properties: {
              account: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        hostPath: true,
                      },
                    },
                    required: ["file"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["account"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              usage: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      key: {
                        type: "object",
                        properties: {
                          env: {
                            type: "string",
                            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                          },
                        },
                        required: ["env"],
                        additionalProperties: false,
                        secret: true,
                      },
                    },
                    required: ["key"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      variable: {
                        type: "string",
                      },
                    },
                    required: ["variable"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["usage"],
            additionalProperties: false,
          },
        ],
      },
      variables: {
        anyOf: [
          {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "variables",
          },
          {
            type: "object",
            additionalProperties: {
              anyOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    env: {
                      type: "string",
                      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
                    },
                  },
                  required: ["env"],
                  additionalProperties: false,
                  secret: true,
                },
              ],
            },
          },
        ],
      },
      conversations: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "conversations",
      },
      mcpServers: {
        type: "object",
        properties: {},
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                command: {
                  type: "string",
                },
                arguments: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                environment: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                variables: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["command"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                url: {
                  type: "string",
                },
                headers: {
                  type: "object",
                  properties: {},
                  additionalProperties: {
                    type: "string",
                  },
                },
                bearerTokenVariable: {
                  type: "string",
                },
                oauth: {
                  anyOf: [
                    {
                      const: "login",
                    },
                    {
                      type: "object",
                      properties: {
                        clientIdVariable: {
                          type: "string",
                        },
                        clientSecretVariable: {
                          type: "string",
                        },
                        scopes: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["clientIdVariable", "clientSecretVariable"],
                      additionalProperties: false,
                    },
                  ],
                },
                tools: {
                  type: "object",
                  properties: {
                    include: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    exclude: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  additionalProperties: false,
                },
                startupTimeoutMs: {
                  type: "number",
                },
              },
              required: ["url"],
              additionalProperties: false,
            },
          ],
        },
      },
      profile: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "profile",
      },
    },
    additionalProperties: false,
  },
  "agent.composed": {
    anyOf: [
      {
        type: "object",
        properties: {
          harness: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "harness",
          },
          model: {
            anyOf: [
              {
                type: "string",
              },
              {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  reasoning: {
                    anyOf: [
                      {
                        const: "none",
                      },
                      {
                        const: "minimal",
                      },
                      {
                        const: "low",
                      },
                      {
                        const: "medium",
                      },
                      {
                        const: "high",
                      },
                      {
                        const: "xhigh",
                      },
                      {
                        const: "max",
                      },
                    ],
                  },
                  maxOutputTokens: {
                    type: "number",
                  },
                },
                required: ["name"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["harness"],
        additionalProperties: false,
      },
      {
        type: "object",
        properties: {
          harness: {
            type: "object",
            properties: {
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "harness",
          },
          model: {
            anyOf: [
              {
                type: "string",
              },
              {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  reasoning: {
                    anyOf: [
                      {
                        const: "none",
                      },
                      {
                        const: "minimal",
                      },
                      {
                        const: "low",
                      },
                      {
                        const: "medium",
                      },
                      {
                        const: "high",
                      },
                      {
                        const: "xhigh",
                      },
                      {
                        const: "max",
                      },
                    ],
                  },
                  maxOutputTokens: {
                    type: "number",
                  },
                },
                required: ["name"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["harness", "model"],
        additionalProperties: false,
      },
    ],
  },
  "transport.local": {
    type: "object",
    properties: {
      directory: {
        type: "string",
        hostPath: true,
      },
    },
    required: ["directory"],
    additionalProperties: false,
  },
};
export const nativeRecipeFactoryParameters: Readonly<
  Record<string, readonly string[]>
> = {
  "steering.controller": [],
  "harness.outpost": [],
  "modelProvider.openai": [],
  "modelProvider.anthropic": [],
  "decisionProvider.system-one": [],
  "tool.custom": [],
  "tool.subagent": [],
  "toolset.custom": [],
  "toolset.files": [],
  "toolset.edit": [],
  "toolset.git": [],
  "toolset.search": [],
  "toolset.shell": [],
  "permissions.rules": [],
  "hook.custom": [],
  "skill.custom": [],
  "context.custom": [],
  "context.truncate": [],
  "context.summarize": [],
  "instructions.source": [],
  "instructions.mcp": [],
  "agent.fallback": [],
  "agent.replay": [],
  "response.json": [],
  "response.text": [],
  "decision.questions": [],
  "routing.decision": [],
  "conversations.transport": [],
  "conversations.harness": [],
  "conversations.claude": [],
  "conversations.codex": [],
  "conversations.copilot": [],
  "conversations.kimi": [],
  "conversations.transcript": [],
  "conversations.bundle": [],
  "sandboxProvider.docker": [],
  "sandboxProvider.podman": [],
  "sandboxProvider.local": [],
  "sandboxProvider.vercel": ["connect"],
  "sandboxProvider.daytona": ["connect"],
  "sandboxProvider.firecracker": [],
  "profile.portable": [],
  "secretSource.vault": [],
  "secretSource.aws": [],
  "secretSource.azure": [],
  "secretSource.gcp": [],
  "secretSource.onepassword": [],
  "secretSource.infisical": [],
  "harness.codex": [],
  "harness.claude": [],
  "harness.agy": [],
  "harness.copilot": [],
  "harness.kimi": [],
  "agent.composed": [],
  "transport.local": [],
};
