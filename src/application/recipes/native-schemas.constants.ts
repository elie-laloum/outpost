export const nativeRecipeSchemas: Readonly<
  Record<string, Readonly<Record<string, unknown>>>
> = {
  "observation.hub": {
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
      sinks: {
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
          component: "sink",
        },
      },
      scope: {
        type: "object",
        properties: {
          executionId: {
            type: "string",
          },
          taskKey: {
            type: "string",
          },
          attempt: {
            type: "number",
          },
          dispatchId: {
            type: "string",
          },
          pass: {
            type: "number",
          },
          subagentId: {
            type: "string",
          },
          candidate: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
      capacity: {
        type: "number",
      },
      deliveryTimeoutMs: {
        type: "number",
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
    },
    additionalProperties: false,
  },
  "sandboxProvider.mounted": {
    type: "object",
    properties: {
      name: {
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
      acquire: {
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
        contract: "sandboxProvider.mounted.acquire",
      },
    },
    required: ["name", "acquire"],
    additionalProperties: false,
  },
  "sandboxProvider.remote": {
    type: "object",
    properties: {
      name: {
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
      acquire: {
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
        contract: "sandboxProvider.remote.acquire",
      },
    },
    required: ["name", "acquire"],
    additionalProperties: false,
  },
  "resolver.agent": {
    type: "object",
    properties: {
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
      verify: {
        type: "object",
        properties: {
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
            contract: "resolver.agent.verify.observe",
          },
        },
        required: ["executable"],
        additionalProperties: false,
      },
      instructions: {
        type: "string",
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
        contract: "resolver.agent.observe",
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
    },
    required: ["agent", "sandboxProvider", "verify"],
    additionalProperties: false,
  },
  "sink.reporter": {
    type: "object",
    properties: {
      label: {
        type: "string",
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
      quiet: {
        anyOf: [
          {
            const: false,
          },
          {
            const: true,
          },
        ],
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
        contract: "sink.reporter.write",
      },
    },
    additionalProperties: false,
  },
  "sink.custom": {
    type: "object",
    properties: {
      handlers: {
        type: "object",
        properties: {
          "model-route": {
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
            contract: "sink.custom.handlers.model-route",
          },
          subagent: {
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
            contract: "sink.custom.handlers.subagent",
          },
          "message-usage": {
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
            contract: "sink.custom.handlers.message-usage",
          },
          stderr: {
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
            contract: "sink.custom.handlers.stderr",
          },
          stopped: {
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
            contract: "sink.custom.handlers.stopped",
          },
          steer: {
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
            contract: "sink.custom.handlers.steer",
          },
          reasoning: {
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
            contract: "sink.custom.handlers.reasoning",
          },
          "file-change": {
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
            contract: "sink.custom.handlers.file-change",
          },
          "model-request": {
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
            contract: "sink.custom.handlers.model-request",
          },
          "model-response": {
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
            contract: "sink.custom.handlers.model-response",
          },
          "model-retry": {
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
            contract: "sink.custom.handlers.model-retry",
          },
          "model-error": {
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
            contract: "sink.custom.handlers.model-error",
          },
          hook: {
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
            contract: "sink.custom.handlers.hook",
          },
          "instructions-loaded": {
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
            contract: "sink.custom.handlers.instructions-loaded",
          },
          "skills-loaded": {
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
            contract: "sink.custom.handlers.skills-loaded",
          },
          "tool-output": {
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
            contract: "sink.custom.handlers.tool-output",
          },
          phase: {
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
            contract: "sink.custom.handlers.phase",
          },
          summary: {
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
            contract: "sink.custom.handlers.summary",
          },
          warning: {
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
            contract: "sink.custom.handlers.warning",
          },
          text: {
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
            contract: "sink.custom.handlers.text",
          },
          "text-delta": {
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
            contract: "sink.custom.handlers.text-delta",
          },
          result: {
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
            contract: "sink.custom.handlers.result",
          },
          prompt: {
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
            contract: "sink.custom.handlers.prompt",
          },
          tool: {
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
            contract: "sink.custom.handlers.tool",
          },
          "tool-result": {
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
            contract: "sink.custom.handlers.tool-result",
          },
          step: {
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
            contract: "sink.custom.handlers.step",
          },
          "tool-denied": {
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
            contract: "sink.custom.handlers.tool-denied",
          },
          "stop-prevented": {
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
            contract: "sink.custom.handlers.stop-prevented",
          },
          compaction: {
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
            contract: "sink.custom.handlers.compaction",
          },
          conversation: {
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
            contract: "sink.custom.handlers.conversation",
          },
          usage: {
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
            contract: "sink.custom.handlers.usage",
          },
          failure: {
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
            contract: "sink.custom.handlers.failure",
          },
          quota: {
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
            contract: "sink.custom.handlers.quota",
          },
          fallback: {
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
            contract: "sink.custom.handlers.fallback",
          },
          finished: {
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
            contract: "sink.custom.handlers.finished",
          },
          raw: {
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
            contract: "sink.custom.handlers.raw",
          },
          stuck: {
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
            contract: "sink.custom.handlers.stuck",
          },
        },
        additionalProperties: false,
      },
      capacity: {
        type: "number",
      },
      deliveryTimeoutMs: {
        type: "number",
      },
      onError: {
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
        contract: "sink.custom.onError",
      },
    },
    required: ["handlers"],
    additionalProperties: false,
  },
  "sink.opentelemetry": {
    type: "object",
    properties: {
      tracer: {
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
      meter: {
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
      onError: {
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
        contract: "sink.opentelemetry.onError",
      },
    },
    required: ["tracer", "meter"],
    additionalProperties: false,
  },
  "speculation.options": {
    type: "object",
    properties: {
      durability: {
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
        required: ["transporter", "runId", "version"],
        additionalProperties: false,
      },
      cleanupMs: {
        type: "number",
      },
      repository: {
        type: "string",
        hostPath: true,
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
      candidates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: {
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
            request: {
              type: "object",
              properties: {
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
                  $ref: "#/$defs/option0",
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
                  contract: "speculation.options.candidates.*.request.observe",
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
                  contract: "speculation.options.candidates.*.request.warn",
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
                  contract:
                    "speculation.options.candidates.*.request.diagnostic",
                },
              },
              required: ["brief"],
              additionalProperties: false,
            },
          },
          required: ["key", "agent", "request"],
          additionalProperties: false,
        },
      },
      concurrency: {
        type: "number",
      },
      select: {
        anyOf: [
          {
            const: "first",
          },
          {
            const: "best",
          },
        ],
      },
      score: {
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
        contract: "speculation.options.score",
      },
      budget: {
        type: "object",
        properties: {
          prices: {
            $ref: "#/$defs/option0",
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
      sandbox: {
        type: "object",
        properties: {
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
                      $ref: "#/$defs/option1",
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
                      contract:
                        "speculation.options.sandbox.hooks.workspaceReady.*.observe",
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
                      $ref: "#/$defs/option1",
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
                      contract:
                        "speculation.options.sandbox.hooks.hostReady.*.observe",
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
                      $ref: "#/$defs/option1",
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
                      contract:
                        "speculation.options.sandbox.hooks.sandboxReady.*.observe",
                    },
                  },
                  required: ["executable"],
                  additionalProperties: false,
                },
              },
            },
            additionalProperties: false,
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
          conversationHome: {
            type: "string",
            hostPath: true,
          },
        },
        additionalProperties: false,
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
        contract: "speculation.options.validate",
      },
    },
    required: [
      "repository",
      "sandboxProvider",
      "candidates",
      "budget",
      "validate",
    ],
    additionalProperties: false,
    $defs: {
      option0: {
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
      option1: {
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
  "integration.options": {
    type: "object",
    properties: {
      deadlineMs: {
        type: "number",
      },
      onConflict: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "resolver",
      },
    },
    additionalProperties: false,
  },
  "queued.options": {
    type: "object",
    properties: {
      queue: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "queue",
      },
      handler: {
        type: "string",
      },
      deadline: {
        type: "number",
      },
      pollMs: {
        type: "number",
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
        component: "callback",
        contract: "queued.options.input",
      },
      decode: {
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
        contract: "queued.options.decode",
      },
    },
    required: ["queue", "handler"],
    additionalProperties: false,
  },
  "queue.sqlite": {
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
  "queue.http": {
    type: "object",
    properties: {
      url: {
        type: "string",
      },
      token: {
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
            contract: "queue.http.token",
          },
        ],
      },
      timeoutMs: {
        type: "number",
      },
    },
    required: ["url", "token"],
    additionalProperties: false,
  },
  "queue.bullmq": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      connection: {
        type: "object",
        properties: {
          Connector: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          retryStrategy: {
            anyOf: [
              {
                type: "null",
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
                contract: "queue.bullmq.connection.retryStrategy",
              },
            ],
          },
          commandTimeout: {
            type: "number",
          },
          blockingTimeout: {
            type: "number",
          },
          blockingTimeoutGrace: {
            type: "number",
          },
          socketTimeout: {
            type: "number",
          },
          keepAlive: {
            type: "number",
          },
          noDelay: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          connectionName: {
            type: "string",
          },
          disableClientInfo: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          clientInfoTag: {
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
          db: {
            type: "number",
          },
          autoResubscribe: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          autoResendUnfulfilledCommands: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          reconnectOnError: {
            anyOf: [
              {
                type: "null",
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
                contract: "queue.bullmq.connection.reconnectOnError",
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
          stringNumbers: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          connectTimeout: {
            type: "number",
          },
          monitor: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          maxRetriesPerRequest: {
            anyOf: [
              {
                type: "null",
              },
              {
                type: "number",
              },
            ],
          },
          maxLoadingRetryTime: {
            type: "number",
          },
          enableAutoPipelining: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          autoPipeliningIgnoredCommands: {
            type: "array",
            items: {
              type: "string",
            },
          },
          offlineQueue: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          commandQueue: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          enableOfflineQueue: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          enableReadyCheck: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          lazyConnect: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          scripts: {
            type: "object",
            properties: {},
            additionalProperties: {
              type: "object",
              properties: {
                lua: {
                  type: "string",
                },
                numberOfKeys: {
                  type: "number",
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
              required: ["lua"],
              additionalProperties: false,
            },
          },
          keyPrefix: {
            type: "string",
          },
          showFriendlyErrorStack: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          name: {
            type: "string",
          },
          role: {
            anyOf: [
              {
                const: "master",
              },
              {
                const: "slave",
              },
            ],
          },
          tls: {
            type: "object",
            properties: {
              host: {
                type: "string",
              },
              port: {
                type: "number",
              },
              path: {
                type: "string",
              },
              socket: {
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
              checkServerIdentity: {
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
                contract: "queue.bullmq.connection.tls.checkServerIdentity",
              },
              servername: {
                type: "string",
              },
              session: {
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
              minDHSize: {
                type: "number",
              },
              lookup: {
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
                contract: "queue.bullmq.connection.tls.lookup",
              },
              timeout: {
                type: "number",
              },
              pskCallback: {
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
                contract: "queue.bullmq.connection.tls.pskCallback",
              },
              ALPNCallback: {
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
                contract: "queue.bullmq.connection.tls.ALPNCallback",
              },
              allowPartialTrustChain: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              ca: {
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
                          component: "object",
                        },
                      ],
                    },
                  },
                ],
              },
              cert: {
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
                          component: "object",
                        },
                      ],
                    },
                  },
                ],
              },
              sigalgs: {
                type: "string",
              },
              ciphers: {
                type: "string",
              },
              clientCertEngine: {
                type: "string",
              },
              crl: {
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
                          component: "object",
                        },
                      ],
                    },
                  },
                ],
              },
              dhparam: {
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
              ecdhCurve: {
                type: "string",
              },
              honorCipherOrder: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              key: {
                $ref: "#/$defs/option0",
              },
              privateKeyEngine: {
                type: "string",
              },
              privateKeyIdentifier: {
                type: "string",
              },
              maxVersion: {
                anyOf: [
                  {
                    const: "TLSv1.3",
                  },
                  {
                    const: "TLSv1.2",
                  },
                  {
                    const: "TLSv1.1",
                  },
                  {
                    const: "TLSv1",
                  },
                ],
              },
              minVersion: {
                anyOf: [
                  {
                    const: "TLSv1.3",
                  },
                  {
                    const: "TLSv1.2",
                  },
                  {
                    const: "TLSv1.1",
                  },
                  {
                    const: "TLSv1",
                  },
                ],
              },
              passphrase: {
                type: "string",
              },
              pfx: {
                $ref: "#/$defs/option1",
              },
              secureOptions: {
                type: "number",
              },
              secureProtocol: {
                type: "string",
              },
              sessionIdContext: {
                type: "string",
              },
              ticketKeys: {
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
              sessionTimeout: {
                type: "number",
              },
              secureContext: {
                type: "object",
                properties: {
                  context: {},
                },
                required: ["context"],
                additionalProperties: false,
              },
              enableTrace: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              requestCert: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              ALPNProtocols: {
                anyOf: [
                  {
                    type: "array",
                    items: {
                      type: "string",
                    },
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
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option8",
                  },
                  {
                    $ref: "#/$defs/option8",
                  },
                  {
                    type: "object",
                    properties: {
                      BYTES_PER_ELEMENT: {
                        type: "number",
                      },
                      buffer: {
                        $ref: "#/$defs/option5",
                      },
                      byteLength: {
                        type: "number",
                      },
                      byteOffset: {
                        type: "number",
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
                        contract:
                          "queue.bullmq.connection.tls.ALPNProtocols.at",
                      },
                      copyWithin: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.copyWithin",
                      },
                      every: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.every",
                      },
                      fill: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.fill",
                      },
                      filter: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.filter",
                      },
                      find: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.find",
                      },
                      findIndex: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.findIndex",
                      },
                      findLast: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.findLast",
                      },
                      findLastIndex: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.findLastIndex",
                      },
                      forEach: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.forEach",
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
                          "queue.bullmq.connection.tls.ALPNProtocols.includes",
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
                        contract:
                          "queue.bullmq.connection.tls.ALPNProtocols.indexOf",
                      },
                      join: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.join",
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
                          "queue.bullmq.connection.tls.ALPNProtocols.lastIndexOf",
                      },
                      length: {
                        type: "number",
                      },
                      map: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.map",
                      },
                      reduce: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.reduce",
                      },
                      reduceRight: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.reduceRight",
                      },
                      reverse: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.reverse",
                      },
                      set: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.set",
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
                        contract:
                          "queue.bullmq.connection.tls.ALPNProtocols.slice",
                      },
                      some: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.some",
                      },
                      sort: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.sort",
                      },
                      subarray: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.subarray",
                      },
                      toLocaleString: {
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
                      toReversed: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.toReversed",
                      },
                      toSorted: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.toSorted",
                      },
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
                      with: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.with",
                      },
                      entries: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.entries",
                      },
                      keys: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.keys",
                      },
                      values: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.values",
                      },
                    },
                    required: [
                      "BYTES_PER_ELEMENT",
                      "buffer",
                      "byteLength",
                      "byteOffset",
                      "at",
                      "copyWithin",
                      "every",
                      "fill",
                      "filter",
                      "find",
                      "findIndex",
                      "findLast",
                      "findLastIndex",
                      "forEach",
                      "includes",
                      "indexOf",
                      "join",
                      "lastIndexOf",
                      "length",
                      "map",
                      "reduce",
                      "reduceRight",
                      "reverse",
                      "set",
                      "slice",
                      "some",
                      "sort",
                      "subarray",
                      "toLocaleString",
                      "toReversed",
                      "toSorted",
                      "toString",
                      "valueOf",
                      "with",
                      "entries",
                      "keys",
                      "values",
                    ],
                    additionalProperties: false,
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    $ref: "#/$defs/option4",
                  },
                  {
                    type: "object",
                    properties: {
                      buffer: {
                        $ref: "#/$defs/option5",
                      },
                      byteLength: {
                        type: "number",
                      },
                      byteOffset: {
                        type: "number",
                      },
                      getFloat32: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getFloat32",
                      },
                      getFloat64: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getFloat64",
                      },
                      getInt8: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getInt8",
                      },
                      getInt16: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getInt16",
                      },
                      getInt32: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getInt32",
                      },
                      getUint8: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getUint8",
                      },
                      getUint16: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getUint16",
                      },
                      getUint32: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getUint32",
                      },
                      setFloat32: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setFloat32",
                      },
                      setFloat64: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setFloat64",
                      },
                      setInt8: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setInt8",
                      },
                      setInt16: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setInt16",
                      },
                      setInt32: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setInt32",
                      },
                      setUint8: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setUint8",
                      },
                      setUint16: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setUint16",
                      },
                      setUint32: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setUint32",
                      },
                      getBigInt64: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getBigInt64",
                      },
                      getBigUint64: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getBigUint64",
                      },
                      setBigInt64: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setBigInt64",
                      },
                      setBigUint64: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setBigUint64",
                      },
                      getFloat16: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.getFloat16",
                      },
                      setFloat16: {
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
                          "queue.bullmq.connection.tls.ALPNProtocols.setFloat16",
                      },
                    },
                    required: [
                      "buffer",
                      "byteLength",
                      "byteOffset",
                      "getFloat32",
                      "getFloat64",
                      "getInt8",
                      "getInt16",
                      "getInt32",
                      "getUint8",
                      "getUint16",
                      "getUint32",
                      "setFloat32",
                      "setFloat64",
                      "setInt8",
                      "setInt16",
                      "setInt32",
                      "setUint8",
                      "setUint16",
                      "setUint32",
                      "getBigInt64",
                      "getBigUint64",
                      "setBigInt64",
                      "setBigUint64",
                      "getFloat16",
                      "setFloat16",
                    ],
                    additionalProperties: false,
                  },
                ],
              },
              SNICallback: {
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
                contract: "queue.bullmq.connection.tls.SNICallback",
              },
              rejectUnauthorized: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              requestOCSP: {
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
          sentinelUsername: {
            type: "string",
          },
          sentinelPassword: {
            type: "string",
          },
          sentinels: {
            type: "array",
            items: {
              type: "object",
              properties: {
                port: {
                  type: "number",
                },
                host: {
                  type: "string",
                },
                family: {
                  type: "number",
                },
              },
              additionalProperties: false,
            },
          },
          sentinelRetryStrategy: {
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
            contract: "queue.bullmq.connection.sentinelRetryStrategy",
          },
          sentinelReconnectStrategy: {
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
            contract: "queue.bullmq.connection.sentinelReconnectStrategy",
          },
          preferredSlaves: {
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
                component: "callback",
                contract: "queue.bullmq.connection.preferredSlaves",
              },
              {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    port: {
                      type: "string",
                    },
                    ip: {
                      type: "string",
                    },
                    prio: {
                      type: "number",
                    },
                  },
                  required: ["port", "ip"],
                  additionalProperties: false,
                },
              },
              {
                type: "object",
                properties: {
                  port: {
                    type: "string",
                  },
                  ip: {
                    type: "string",
                  },
                  prio: {
                    type: "number",
                  },
                },
                required: ["port", "ip"],
                additionalProperties: false,
              },
            ],
          },
          disconnectTimeout: {
            type: "number",
          },
          sentinelCommandTimeout: {
            type: "number",
          },
          enableTLSForSentinelMode: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          sentinelTLS: {
            type: "object",
            properties: {
              host: {
                type: "string",
              },
              port: {
                type: "number",
              },
              path: {
                type: "string",
              },
              socket: {
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
              checkServerIdentity: {
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
                  "queue.bullmq.connection.sentinelTLS.checkServerIdentity",
              },
              servername: {
                type: "string",
              },
              session: {
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
              minDHSize: {
                type: "number",
              },
              lookup: {
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
                contract: "queue.bullmq.connection.sentinelTLS.lookup",
              },
              timeout: {
                type: "number",
              },
              pskCallback: {
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
                contract: "queue.bullmq.connection.sentinelTLS.pskCallback",
              },
              ALPNCallback: {
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
                contract: "queue.bullmq.connection.sentinelTLS.ALPNCallback",
              },
              allowPartialTrustChain: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              ca: {
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
                          component: "object",
                        },
                      ],
                    },
                  },
                ],
              },
              cert: {
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
                          component: "object",
                        },
                      ],
                    },
                  },
                ],
              },
              sigalgs: {
                type: "string",
              },
              ciphers: {
                type: "string",
              },
              clientCertEngine: {
                type: "string",
              },
              crl: {
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
                          component: "object",
                        },
                      ],
                    },
                  },
                ],
              },
              dhparam: {
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
              ecdhCurve: {
                type: "string",
              },
              honorCipherOrder: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              key: {
                $ref: "#/$defs/option0",
              },
              privateKeyEngine: {
                type: "string",
              },
              privateKeyIdentifier: {
                type: "string",
              },
              maxVersion: {
                anyOf: [
                  {
                    const: "TLSv1.3",
                  },
                  {
                    const: "TLSv1.2",
                  },
                  {
                    const: "TLSv1.1",
                  },
                  {
                    const: "TLSv1",
                  },
                ],
              },
              minVersion: {
                anyOf: [
                  {
                    const: "TLSv1.3",
                  },
                  {
                    const: "TLSv1.2",
                  },
                  {
                    const: "TLSv1.1",
                  },
                  {
                    const: "TLSv1",
                  },
                ],
              },
              passphrase: {
                type: "string",
              },
              pfx: {
                $ref: "#/$defs/option1",
              },
              secureOptions: {
                type: "number",
              },
              secureProtocol: {
                type: "string",
              },
              sessionIdContext: {
                type: "string",
              },
              ticketKeys: {
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
              sessionTimeout: {
                type: "number",
              },
              secureContext: {
                type: "object",
                properties: {
                  context: {},
                },
                required: ["context"],
                additionalProperties: false,
              },
              enableTrace: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              requestCert: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              ALPNProtocols: {
                anyOf: [
                  {
                    type: "array",
                    items: {
                      type: "string",
                    },
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
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option13",
                  },
                  {
                    $ref: "#/$defs/option13",
                  },
                  {
                    type: "object",
                    properties: {
                      BYTES_PER_ELEMENT: {
                        type: "number",
                      },
                      buffer: {
                        $ref: "#/$defs/option10",
                      },
                      byteLength: {
                        type: "number",
                      },
                      byteOffset: {
                        type: "number",
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
                        contract:
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.at",
                      },
                      copyWithin: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.copyWithin",
                      },
                      every: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.every",
                      },
                      fill: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.fill",
                      },
                      filter: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.filter",
                      },
                      find: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.find",
                      },
                      findIndex: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findIndex",
                      },
                      findLast: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findLast",
                      },
                      findLastIndex: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findLastIndex",
                      },
                      forEach: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.forEach",
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.includes",
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
                        contract:
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.indexOf",
                      },
                      join: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.join",
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.lastIndexOf",
                      },
                      length: {
                        type: "number",
                      },
                      map: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.map",
                      },
                      reduce: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reduce",
                      },
                      reduceRight: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reduceRight",
                      },
                      reverse: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reverse",
                      },
                      set: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.set",
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
                        contract:
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.slice",
                      },
                      some: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.some",
                      },
                      sort: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.sort",
                      },
                      subarray: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.subarray",
                      },
                      toLocaleString: {
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
                      toReversed: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.toReversed",
                      },
                      toSorted: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.toSorted",
                      },
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
                      with: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.with",
                      },
                      entries: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.entries",
                      },
                      keys: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.keys",
                      },
                      values: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.values",
                      },
                    },
                    required: [
                      "BYTES_PER_ELEMENT",
                      "buffer",
                      "byteLength",
                      "byteOffset",
                      "at",
                      "copyWithin",
                      "every",
                      "fill",
                      "filter",
                      "find",
                      "findIndex",
                      "findLast",
                      "findLastIndex",
                      "forEach",
                      "includes",
                      "indexOf",
                      "join",
                      "lastIndexOf",
                      "length",
                      "map",
                      "reduce",
                      "reduceRight",
                      "reverse",
                      "set",
                      "slice",
                      "some",
                      "sort",
                      "subarray",
                      "toLocaleString",
                      "toReversed",
                      "toSorted",
                      "toString",
                      "valueOf",
                      "with",
                      "entries",
                      "keys",
                      "values",
                    ],
                    additionalProperties: false,
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    $ref: "#/$defs/option9",
                  },
                  {
                    type: "object",
                    properties: {
                      buffer: {
                        $ref: "#/$defs/option10",
                      },
                      byteLength: {
                        type: "number",
                      },
                      byteOffset: {
                        type: "number",
                      },
                      getFloat32: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getFloat32",
                      },
                      getFloat64: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getFloat64",
                      },
                      getInt8: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getInt8",
                      },
                      getInt16: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getInt16",
                      },
                      getInt32: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getInt32",
                      },
                      getUint8: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getUint8",
                      },
                      getUint16: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getUint16",
                      },
                      getUint32: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getUint32",
                      },
                      setFloat32: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setFloat32",
                      },
                      setFloat64: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setFloat64",
                      },
                      setInt8: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setInt8",
                      },
                      setInt16: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setInt16",
                      },
                      setInt32: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setInt32",
                      },
                      setUint8: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setUint8",
                      },
                      setUint16: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setUint16",
                      },
                      setUint32: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setUint32",
                      },
                      getBigInt64: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getBigInt64",
                      },
                      getBigUint64: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getBigUint64",
                      },
                      setBigInt64: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setBigInt64",
                      },
                      setBigUint64: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setBigUint64",
                      },
                      getFloat16: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.getFloat16",
                      },
                      setFloat16: {
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
                          "queue.bullmq.connection.sentinelTLS.ALPNProtocols.setFloat16",
                      },
                    },
                    required: [
                      "buffer",
                      "byteLength",
                      "byteOffset",
                      "getFloat32",
                      "getFloat64",
                      "getInt8",
                      "getInt16",
                      "getInt32",
                      "getUint8",
                      "getUint16",
                      "getUint32",
                      "setFloat32",
                      "setFloat64",
                      "setInt8",
                      "setInt16",
                      "setInt32",
                      "setUint8",
                      "setUint16",
                      "setUint32",
                      "getBigInt64",
                      "getBigUint64",
                      "setBigInt64",
                      "setBigUint64",
                      "getFloat16",
                      "setFloat16",
                    ],
                    additionalProperties: false,
                  },
                ],
              },
              SNICallback: {
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
                contract: "queue.bullmq.connection.sentinelTLS.SNICallback",
              },
              rejectUnauthorized: {
                anyOf: [
                  {
                    const: false,
                  },
                  {
                    const: true,
                  },
                ],
              },
              requestOCSP: {
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
          natMap: {
            anyOf: [
              {
                type: "object",
                properties: {},
                additionalProperties: {
                  type: "object",
                  properties: {
                    host: {
                      type: "string",
                    },
                    port: {
                      type: "number",
                    },
                  },
                  required: ["host", "port"],
                  additionalProperties: false,
                },
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
                contract: "queue.bullmq.connection.natMap",
              },
            ],
          },
          updateSentinels: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          sentinelMaxConnections: {
            type: "number",
          },
          failoverDetector: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          port: {
            type: "number",
          },
          host: {
            type: "string",
          },
          family: {
            type: "number",
          },
          path: {
            type: "string",
          },
          skipVersionCheck: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          url: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
      prefix: {
        type: "string",
      },
      stalledIntervalMs: {
        type: "number",
      },
      onError: {
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
        contract: "queue.bullmq.onError",
      },
    },
    required: ["name", "connection"],
    additionalProperties: false,
    $defs: {
      option0: {
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
                  component: "object",
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
          },
        ],
      },
      option1: {
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
          {
            $ref: "#/$defs/option2",
          },
        ],
      },
      option2: {
        type: "array",
        items: {
          $ref: "#/$defs/option3",
        },
      },
      option3: {
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
          {
            type: "object",
            properties: {
              buf: {
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
              passphrase: {
                type: "string",
              },
            },
            required: ["buf"],
            additionalProperties: false,
          },
        ],
      },
      option4: {
        type: "object",
        properties: {
          BYTES_PER_ELEMENT: {
            type: "number",
          },
          buffer: {
            $ref: "#/$defs/option5",
          },
          byteLength: {
            type: "number",
          },
          byteOffset: {
            type: "number",
          },
          copyWithin: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.copyWithin",
          },
          every: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.every",
          },
          fill: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.fill",
          },
          filter: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.filter",
          },
          find: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.find",
          },
          findIndex: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.findIndex",
          },
          forEach: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.forEach",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.indexOf",
          },
          join: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.join",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.lastIndexOf",
          },
          length: {
            type: "number",
          },
          map: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.map",
          },
          reduce: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.reduce",
          },
          reduceRight: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.reduceRight",
          },
          reverse: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.reverse",
          },
          set: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.set",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.slice",
          },
          some: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.some",
          },
          sort: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.sort",
          },
          subarray: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.subarray",
          },
          toLocaleString: {
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
          entries: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.entries",
          },
          keys: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.keys",
          },
          values: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.values",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.includes",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.at",
          },
          findLast: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.findLast",
          },
          findLastIndex: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.findLastIndex",
          },
          toReversed: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.toReversed",
          },
          toSorted: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.toSorted",
          },
          with: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.with",
          },
        },
        required: [
          "BYTES_PER_ELEMENT",
          "buffer",
          "byteLength",
          "byteOffset",
          "copyWithin",
          "every",
          "fill",
          "filter",
          "find",
          "findIndex",
          "forEach",
          "indexOf",
          "join",
          "lastIndexOf",
          "length",
          "map",
          "reduce",
          "reduceRight",
          "reverse",
          "set",
          "slice",
          "some",
          "sort",
          "subarray",
          "toLocaleString",
          "toString",
          "valueOf",
          "entries",
          "keys",
          "values",
          "includes",
          "at",
          "findLast",
          "findLastIndex",
          "toReversed",
          "toSorted",
          "with",
        ],
        additionalProperties: false,
      },
      option5: {
        anyOf: [
          {
            $ref: "#/$defs/option6",
          },
          {
            $ref: "#/$defs/option7",
          },
        ],
      },
      option6: {
        type: "object",
        properties: {
          byteLength: {
            type: "number",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.buffer.slice",
          },
          maxByteLength: {
            type: "number",
          },
          resizable: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          resize: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.buffer.resize",
          },
          detached: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          transfer: {
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
              "queue.bullmq.connection.tls.ALPNProtocols.buffer.transfer",
          },
          transferToFixedLength: {
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
              "queue.bullmq.connection.tls.ALPNProtocols.buffer.transferToFixedLength",
          },
        },
        required: [
          "byteLength",
          "slice",
          "maxByteLength",
          "resizable",
          "resize",
          "detached",
          "transfer",
          "transferToFixedLength",
        ],
        additionalProperties: false,
      },
      option7: {
        type: "object",
        properties: {
          byteLength: {
            type: "number",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.buffer.slice",
          },
          growable: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          maxByteLength: {
            type: "number",
          },
          grow: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.buffer.grow",
          },
        },
        required: ["byteLength", "slice", "growable", "maxByteLength", "grow"],
        additionalProperties: false,
      },
      option8: {
        type: "object",
        properties: {
          BYTES_PER_ELEMENT: {
            type: "number",
          },
          buffer: {
            $ref: "#/$defs/option5",
          },
          byteLength: {
            type: "number",
          },
          byteOffset: {
            type: "number",
          },
          copyWithin: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.copyWithin",
          },
          entries: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.entries",
          },
          every: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.every",
          },
          fill: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.fill",
          },
          filter: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.filter",
          },
          find: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.find",
          },
          findIndex: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.findIndex",
          },
          forEach: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.forEach",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.includes",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.indexOf",
          },
          join: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.join",
          },
          keys: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.keys",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.lastIndexOf",
          },
          length: {
            type: "number",
          },
          map: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.map",
          },
          reduce: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.reduce",
          },
          reduceRight: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.reduceRight",
          },
          reverse: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.reverse",
          },
          set: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.set",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.slice",
          },
          some: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.some",
          },
          sort: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.sort",
          },
          subarray: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.subarray",
          },
          toLocaleString: {
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
          values: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.values",
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.at",
          },
          findLast: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.findLast",
          },
          findLastIndex: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.findLastIndex",
          },
          toReversed: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.toReversed",
          },
          toSorted: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.toSorted",
          },
          with: {
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
            contract: "queue.bullmq.connection.tls.ALPNProtocols.with",
          },
        },
        required: [
          "BYTES_PER_ELEMENT",
          "buffer",
          "byteLength",
          "byteOffset",
          "copyWithin",
          "entries",
          "every",
          "fill",
          "filter",
          "find",
          "findIndex",
          "forEach",
          "includes",
          "indexOf",
          "join",
          "keys",
          "lastIndexOf",
          "length",
          "map",
          "reduce",
          "reduceRight",
          "reverse",
          "set",
          "slice",
          "some",
          "sort",
          "subarray",
          "toLocaleString",
          "toString",
          "valueOf",
          "values",
          "at",
          "findLast",
          "findLastIndex",
          "toReversed",
          "toSorted",
          "with",
        ],
        additionalProperties: false,
      },
      option9: {
        type: "object",
        properties: {
          BYTES_PER_ELEMENT: {
            type: "number",
          },
          buffer: {
            $ref: "#/$defs/option10",
          },
          byteLength: {
            type: "number",
          },
          byteOffset: {
            type: "number",
          },
          copyWithin: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.copyWithin",
          },
          every: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.every",
          },
          fill: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.fill",
          },
          filter: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.filter",
          },
          find: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.find",
          },
          findIndex: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findIndex",
          },
          forEach: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.forEach",
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
            contract:
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.indexOf",
          },
          join: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.join",
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.lastIndexOf",
          },
          length: {
            type: "number",
          },
          map: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.map",
          },
          reduce: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reduce",
          },
          reduceRight: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reduceRight",
          },
          reverse: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reverse",
          },
          set: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.set",
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.slice",
          },
          some: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.some",
          },
          sort: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.sort",
          },
          subarray: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.subarray",
          },
          toLocaleString: {
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
          entries: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.entries",
          },
          keys: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.keys",
          },
          values: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.values",
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.includes",
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.at",
          },
          findLast: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findLast",
          },
          findLastIndex: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findLastIndex",
          },
          toReversed: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.toReversed",
          },
          toSorted: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.toSorted",
          },
          with: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.with",
          },
        },
        required: [
          "BYTES_PER_ELEMENT",
          "buffer",
          "byteLength",
          "byteOffset",
          "copyWithin",
          "every",
          "fill",
          "filter",
          "find",
          "findIndex",
          "forEach",
          "indexOf",
          "join",
          "lastIndexOf",
          "length",
          "map",
          "reduce",
          "reduceRight",
          "reverse",
          "set",
          "slice",
          "some",
          "sort",
          "subarray",
          "toLocaleString",
          "toString",
          "valueOf",
          "entries",
          "keys",
          "values",
          "includes",
          "at",
          "findLast",
          "findLastIndex",
          "toReversed",
          "toSorted",
          "with",
        ],
        additionalProperties: false,
      },
      option10: {
        anyOf: [
          {
            $ref: "#/$defs/option11",
          },
          {
            $ref: "#/$defs/option12",
          },
        ],
      },
      option11: {
        type: "object",
        properties: {
          byteLength: {
            type: "number",
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
            contract:
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.buffer.slice",
          },
          maxByteLength: {
            type: "number",
          },
          resizable: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          resize: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.buffer.resize",
          },
          detached: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          transfer: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.buffer.transfer",
          },
          transferToFixedLength: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.buffer.transferToFixedLength",
          },
        },
        required: [
          "byteLength",
          "slice",
          "maxByteLength",
          "resizable",
          "resize",
          "detached",
          "transfer",
          "transferToFixedLength",
        ],
        additionalProperties: false,
      },
      option12: {
        type: "object",
        properties: {
          byteLength: {
            type: "number",
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
            contract:
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.buffer.slice",
          },
          growable: {
            anyOf: [
              {
                const: false,
              },
              {
                const: true,
              },
            ],
          },
          maxByteLength: {
            type: "number",
          },
          grow: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.buffer.grow",
          },
        },
        required: ["byteLength", "slice", "growable", "maxByteLength", "grow"],
        additionalProperties: false,
      },
      option13: {
        type: "object",
        properties: {
          BYTES_PER_ELEMENT: {
            type: "number",
          },
          buffer: {
            $ref: "#/$defs/option10",
          },
          byteLength: {
            type: "number",
          },
          byteOffset: {
            type: "number",
          },
          copyWithin: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.copyWithin",
          },
          entries: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.entries",
          },
          every: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.every",
          },
          fill: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.fill",
          },
          filter: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.filter",
          },
          find: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.find",
          },
          findIndex: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findIndex",
          },
          forEach: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.forEach",
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.includes",
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
            contract:
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.indexOf",
          },
          join: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.join",
          },
          keys: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.keys",
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.lastIndexOf",
          },
          length: {
            type: "number",
          },
          map: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.map",
          },
          reduce: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reduce",
          },
          reduceRight: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reduceRight",
          },
          reverse: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.reverse",
          },
          set: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.set",
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.slice",
          },
          some: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.some",
          },
          sort: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.sort",
          },
          subarray: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.subarray",
          },
          toLocaleString: {
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
          values: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.values",
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.at",
          },
          findLast: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findLast",
          },
          findLastIndex: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.findLastIndex",
          },
          toReversed: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.toReversed",
          },
          toSorted: {
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
              "queue.bullmq.connection.sentinelTLS.ALPNProtocols.toSorted",
          },
          with: {
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
            contract: "queue.bullmq.connection.sentinelTLS.ALPNProtocols.with",
          },
        },
        required: [
          "BYTES_PER_ELEMENT",
          "buffer",
          "byteLength",
          "byteOffset",
          "copyWithin",
          "entries",
          "every",
          "fill",
          "filter",
          "find",
          "findIndex",
          "forEach",
          "includes",
          "indexOf",
          "join",
          "keys",
          "lastIndexOf",
          "length",
          "map",
          "reduce",
          "reduceRight",
          "reverse",
          "set",
          "slice",
          "some",
          "sort",
          "subarray",
          "toLocaleString",
          "toString",
          "valueOf",
          "values",
          "at",
          "findLast",
          "findLastIndex",
          "toReversed",
          "toSorted",
          "with",
        ],
        additionalProperties: false,
      },
    },
  },
  "service.worker": {
    type: "object",
    properties: {
      queue: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "queue",
      },
      pollMs: {
        type: "number",
      },
      worker: {
        type: "string",
      },
      handlers: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "object",
          properties: {
            $ref: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["$ref"],
          additionalProperties: false,
          component: "job",
        },
      },
      leaseMs: {
        type: "number",
      },
    },
    required: ["queue", "worker", "handlers"],
    additionalProperties: false,
  },
  "service.queue": {
    type: "object",
    properties: {
      queue: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "queue",
      },
      token: {
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
            contract: "service.queue.token",
          },
        ],
      },
      host: {
        type: "string",
      },
      port: {
        type: "number",
      },
    },
    required: ["queue", "token"],
    additionalProperties: false,
  },
  "service.triggers": {
    type: "object",
    properties: {
      maxBytes: {
        type: "number",
      },
      queue: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "queue",
      },
      port: {
        type: "number",
      },
      host: {
        type: "string",
      },
      onError: {
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
        contract: "service.triggers.onError",
      },
      routes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            on: {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "triggerMapper",
            },
            path: {
              type: "string",
            },
            source: {
              type: "object",
              properties: {
                $ref: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["$ref"],
              additionalProperties: false,
              component: "triggerSource",
            },
          },
          required: ["on", "path", "source"],
          additionalProperties: false,
        },
      },
    },
    required: ["queue", "routes"],
    additionalProperties: false,
  },
  "service.schedules": {
    type: "object",
    properties: {
      queue: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "queue",
      },
      onError: {
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
        contract: "service.schedules.onError",
      },
      schedules: {
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
          component: "schedule",
        },
      },
      maxLateMs: {
        type: "number",
      },
    },
    required: ["queue", "schedules"],
    additionalProperties: false,
  },
  "job.workflow": {
    type: "object",
    properties: {
      workflow: {
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
        contract: "job.workflow.workflow",
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
          version: {
            type: "string",
          },
          resume: {
            const: "retry-incomplete",
          },
        },
        required: ["store", "version"],
        additionalProperties: false,
      },
      start: {
        type: "object",
        properties: {
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
                contract: "job.workflow.start.telemetry.observe",
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
            contract: "job.workflow.start.observe",
          },
          timeoutMs: {
            type: "number",
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
        },
        additionalProperties: false,
      },
    },
    required: ["workflow", "checkpoint"],
    additionalProperties: false,
  },
  "job.recipe": {
    type: "object",
    properties: {
      file: {
        type: "string",
        hostPath: true,
      },
      config: {
        type: "string",
        hostPath: true,
      },
      retryIncomplete: {
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
    required: ["file", "config"],
    additionalProperties: false,
  },
  "cron.schedule": {
    type: "object",
    properties: {
      expression: {
        type: "string",
      },
      timeZone: {
        type: "string",
      },
    },
    required: ["expression"],
    additionalProperties: false,
  },
  "schedule.cron": {
    type: "object",
    properties: {
      input: {
        anyOf: [
          {
            type: "null",
          },
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
          {
            type: "array",
            items: {},
          },
          {
            type: "object",
            properties: {},
            additionalProperties: {},
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
            contract: "schedule.cron.input",
          },
        ],
      },
      handler: {
        type: "string",
      },
      name: {
        type: "string",
      },
      cron: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "cron",
      },
      runId: {
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
        contract: "schedule.cron.runId",
      },
    },
    required: ["handler", "name", "cron"],
    additionalProperties: false,
  },
  "triggerMapper.job": {
    type: "object",
    properties: {
      handler: {
        type: "string",
      },
      runIdPrefix: {
        type: "string",
      },
      kinds: {
        type: "array",
        items: {
          type: "string",
        },
      },
      actions: {
        type: "array",
        items: {
          type: "string",
        },
      },
      input: {
        anyOf: [
          {
            type: "null",
          },
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
          {
            type: "array",
            items: {},
          },
          {
            type: "object",
            properties: {},
            additionalProperties: {},
          },
        ],
      },
    },
    required: ["handler"],
    additionalProperties: false,
  },
  "triggerSource.github": {
    type: "object",
    properties: {
      secret: {
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
            contract: "triggerSource.github.secret",
          },
        ],
      },
    },
    required: ["secret"],
    additionalProperties: false,
  },
  "triggerSource.gitlab": {
    anyOf: [
      {
        type: "object",
        properties: {
          signingToken: {
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
                contract: "triggerSource.gitlab.signingToken",
              },
            ],
          },
          toleranceMs: {
            type: "number",
          },
        },
        required: ["signingToken"],
        additionalProperties: false,
      },
      {
        type: "object",
        properties: {
          token: {
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
                contract: "triggerSource.gitlab.token",
              },
            ],
          },
        },
        required: ["token"],
        additionalProperties: false,
      },
    ],
  },
  "triggerSource.slack": {
    type: "object",
    properties: {
      signingSecret: {
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
            contract: "triggerSource.slack.signingSecret",
          },
        ],
      },
      toleranceMs: {
        type: "number",
      },
    },
    required: ["signingSecret"],
    additionalProperties: false,
  },
  "triggerSource.standard": {
    type: "object",
    properties: {
      secret: {
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
            contract: "triggerSource.standard.secret",
          },
        ],
      },
      toleranceMs: {
        type: "number",
      },
      source: {
        type: "string",
      },
    },
    required: ["secret"],
    additionalProperties: false,
  },
  "transport.s3": {
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
      bucket: {
        type: "string",
      },
      prefix: {
        type: "string",
      },
      deleteMode: {
        anyOf: [
          {
            const: "conditional",
          },
          {
            const: "tombstone",
          },
        ],
      },
    },
    required: ["client", "bucket"],
    additionalProperties: false,
  },
  "checkpointStore.transport": {
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
    },
    required: ["transporter"],
    additionalProperties: false,
  },
  "taskCacheStore.transport": {
    type: "object",
    properties: {
      maxBytes: {
        type: "number",
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
    required: ["transporter"],
    additionalProperties: false,
  },
  "artifactStore.transport": {
    type: "object",
    properties: {
      maxBytes: {
        type: "number",
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
    required: ["transporter"],
    additionalProperties: false,
  },
  "artifact.json": {
    type: "object",
    properties: {
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
            contract: "artifact.json.schema",
          },
        ],
      },
      name: {
        type: "string",
      },
      version: {
        type: "string",
      },
    },
    required: ["jsonSchema", "name", "version"],
    additionalProperties: false,
  },
  "artifact.binary": {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      version: {
        type: "string",
      },
    },
    required: ["name", "version"],
    additionalProperties: false,
  },
  "verifier.ed25519": {
    type: "object",
    properties: {
      keys: {
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
        contract: "verifier.ed25519.keys",
      },
    },
    required: ["keys"],
    additionalProperties: false,
  },
  "sink.run": {
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
      id: {
        type: "string",
      },
      kind: {
        anyOf: [
          {
            const: "dispatch",
          },
          {
            const: "workflow",
          },
        ],
      },
      heartbeatMs: {
        type: "number",
      },
      abandonAfterMs: {
        type: "number",
      },
      resume: {
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
    required: ["transporter", "id", "kind"],
    additionalProperties: false,
  },
  "interactive.options": {
    type: "object",
    properties: {
      repository: {
        type: "string",
        hostPath: true,
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
      brief: {
        type: "string",
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
      timeoutMs: {
        type: "number",
      },
      actors: {
        type: "array",
        items: {
          type: "string",
        },
      },
      maxTurns: {
        type: "number",
      },
    },
    required: ["repository", "agent", "brief", "actors"],
    additionalProperties: false,
  },
  "gate.options": {
    type: "object",
    properties: {
      authentication: {
        const: "signed",
      },
      kind: {
        anyOf: [
          {
            const: "pause",
          },
          {
            const: "approval",
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
  "artifactTask.options": {
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
        component: "artifactStore",
      },
      contract: {
        type: "object",
        properties: {
          $ref: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["$ref"],
        additionalProperties: false,
        component: "artifact",
      },
      parents: {
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
        contract: "artifactTask.options.parents",
      },
      produce: {
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
        contract: "artifactTask.options.produce",
      },
    },
    required: ["store", "contract"],
    additionalProperties: false,
  },
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
                const: "pause",
              },
              {
                const: "approval",
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
              $ref: {
                type: "string",
                minLength: 1,
              },
            },
            required: ["$ref"],
            additionalProperties: false,
            component: "taskCacheStore",
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
      timeoutMs: {
        type: "number",
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
      repository: {
        type: "string",
        hostPath: true,
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
                                    const: "finished",
                                  },
                                  {
                                    const: "started",
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
                                    const: "stuck",
                                  },
                                  {
                                    const: "deadline",
                                  },
                                  {
                                    const: "completion",
                                  },
                                  {
                                    const: "idle-timeout",
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
                                    const: "steer",
                                  },
                                  {
                                    const: "warn",
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
                                        const: "finished",
                                      },
                                      {
                                        const: "started",
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
                              const: "prompt",
                            },
                            {
                              const: "quota",
                            },
                            {
                              const: "stuck",
                            },
                            {
                              const: "steering",
                            },
                            {
                              const: "response",
                            },
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
                              const: "replay",
                            },
                            {
                              const: "aborted",
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
                      const: "quota",
                    },
                    {
                      const: "unavailable",
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
      conversationHome: {
        type: "string",
        hostPath: true,
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
                const: "quota",
              },
              {
                const: "unavailable",
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
            properties: {},
            additionalProperties: {},
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
            component: "validator",
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
              const: "quota",
            },
            {
              const: "unavailable",
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
              name: {
                type: "string",
              },
              timeout: {
                type: "number",
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
              name: {
                type: "string",
              },
              timeout: {
                type: "number",
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
                                    const: "finished",
                                  },
                                  {
                                    const: "started",
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
                                    const: "stuck",
                                  },
                                  {
                                    const: "deadline",
                                  },
                                  {
                                    const: "completion",
                                  },
                                  {
                                    const: "idle-timeout",
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
                                    const: "steer",
                                  },
                                  {
                                    const: "warn",
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
                                        const: "finished",
                                      },
                                      {
                                        const: "started",
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
                              const: "prompt",
                            },
                            {
                              const: "quota",
                            },
                            {
                              const: "stuck",
                            },
                            {
                              const: "steering",
                            },
                            {
                              const: "response",
                            },
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
                              const: "replay",
                            },
                            {
                              const: "aborted",
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
                      const: "quota",
                    },
                    {
                      const: "unavailable",
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
                const: "quota",
              },
              {
                const: "unavailable",
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
  "sandboxProvider.mounted": [],
  "sandboxProvider.remote": [],
  "resolver.agent": [],
  "sink.reporter": [],
  "sink.custom": [],
  "sink.opentelemetry": [],
  "queue.sqlite": [],
  "queue.http": [],
  "queue.bullmq": [],
  "service.worker": [],
  "service.queue": [],
  "service.triggers": [],
  "service.schedules": [],
  "job.workflow": [],
  "job.recipe": [],
  "cron.schedule": [],
  "schedule.cron": [],
  "triggerMapper.job": [],
  "triggerSource.github": [],
  "triggerSource.gitlab": [],
  "triggerSource.slack": [],
  "triggerSource.standard": [],
  "transport.s3": [],
  "checkpointStore.transport": [],
  "taskCacheStore.transport": [],
  "artifactStore.transport": [],
  "artifact.json": [],
  "artifact.binary": [],
  "verifier.ed25519": [],
  "sink.run": [],
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
