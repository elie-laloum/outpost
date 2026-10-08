export const nativeRecipeSchemas: Readonly<
  Record<string, Readonly<Record<string, unknown>>>
> = {
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
              },
              runtime: {
                $ref: "#/$defs/option16",
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
              },
              runtime: false,
              image: {
                $ref: "#/$defs/option17",
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
              },
              runtime: {
                $ref: "#/$defs/option16",
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
              },
              runtime: false,
              image: {
                $ref: "#/$defs/option17",
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
          $ref: "#/$defs/option13",
        },
      },
      option16: {
        anyOf: [
          {
            $ref: "#/$defs/option14",
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
      option17: {
        anyOf: [
          {
            $ref: "#/$defs/option14",
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
                    const: "fail",
                  },
                  {
                    const: "warn",
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
                                    const: "stderr",
                                  },
                                  {
                                    const: "stdout",
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
                              const: "timeout",
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
                              const: "guard",
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
                              const: "workspace",
                            },
                            {
                              const: "conflict",
                            },
                            {
                              const: "response",
                            },
                            {
                              const: "session",
                            },
                            {
                              const: "provider",
                            },
                            {
                              const: "limit",
                            },
                            {
                              const: "steering",
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
            $ref: "#/$defs/option2",
          },
          hostReady: {
            $ref: "#/$defs/option2",
          },
          sandboxReady: {
            $ref: "#/$defs/option2",
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
          hostPath: true,
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
        type: "array",
        items: {
          $ref: "#/$defs/option3",
        },
      },
      option3: {
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
            $ref: "#/$defs/option4",
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
          },
        },
        required: ["executable"],
        additionalProperties: false,
      },
      option4: {
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
