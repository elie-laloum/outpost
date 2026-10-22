/** Format-3 starters offered by the editor; nothing is written until the drafts are saved. */
export const recipeEditorStarters = {
  ephemeral: {
    description:
      "Local commands in a temporary workspace, without Git or Docker",
    recipe: `version: 3
name: hello-files
tasks:
  - key: write
    command:
      executable: node
      arguments:
        - -e
        - "require('node:fs').writeFileSync('hello.txt', 'Hello from Outpost!')"
  - key: read
    after: [write]
    command:
      executable: node
      arguments: [-p, "require('node:fs').readFileSync('hello.txt', 'utf8')"]
`,
    config: `version: 3
workspace:
  kind: ephemeral
sandbox:
  provider: local
`,
  },
  directory: {
    description: "Copy a directory into Docker and publish JSON results",
    recipe: `version: 3
name: process-files
tasks:
  - key: process
    command:
      executable: node
      arguments: ["-e", "require('node:fs').writeFileSync('result.json', '{}')"]
`,
    config: `version: 3
workspace:
  kind: directory
  directory: ./documents
  access: copy
sandbox:
  provider: docker
  image: outpost-harness:dev
outputs:
  - paths: ["**/*.json"]
    destination: ./documents
    policy: update
`,
  },
  git: {
    description: "An agent commits a change on a named branch, then tests run",
    recipe: `version: 3
name: fix-and-check
description: Implement a requested change, then run the project tests.
inputs:
  goal:
    type: string
    description: The change to implement.
tasks:
  - key: fix
    agent: coder
    brief: "Implement this change and commit it: {{ inputs.goal }}"
  - key: verify
    after: [fix]
    command:
      executable: npm
      arguments: [test]
`,
    config: `version: 3
workspace:
  kind: git
  repository: .
  branch:
    mode: named
    name: outpost/first-task
sandbox:
  provider: docker
  image: outpost-codex:dev
agents:
  coder:
    harness: codex
    authentication: account
`,
  },
} as const;

export const recipeEditorDefaults = {
  history: 100,
  layoutBytes: 1_048_576,
  extensionBytes: 1_048_576,
} as const;
