export const starterRecipe = `version: 2
name: fix-and-check
description: Implement a requested change, then run the project tests.
recipeVersion: "1.0.0"
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
`;

export const starterRecipeConfiguration = `version: 1
repository: .
sandbox:
  provider: docker
  image: outpost:latest
branch:
  mode: integrate
agents:
  coder:
    harness: codex
    authentication: account
`;

export const starterFileRecipe = `version: 3
name: process-files
tasks:
  - key: process
    command:
      executable: node
      arguments: ["-e", "require('node:fs').writeFileSync('result.json', '{}')"]
`;

export const starterFileConfigurations = {
  ephemeral: `version: 3
workspace: { kind: ephemeral }
sandbox:
  provider: docker
  image: outpost:dev
outputs:
  - paths: ["**/*.json"]
    destination: ./results
    policy: create
`,
  directory: `version: 3
workspace:
  kind: directory
  directory: ./documents
  access: copy
sandbox:
  provider: docker
  image: outpost:dev
outputs:
  - paths: ["**/*.json"]
    destination: ./documents
    policy: update
`,
} as const;
