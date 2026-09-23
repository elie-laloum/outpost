# Examples

Run from a Git repository with Node.js 24+ after installing development dependencies.

- `node examples/offline.ts`: typed parallel workflow without credentials or containers.
- `node examples/review.ts "Your objective"`: Codex implementation and Claude review in one Docker sandbox. Build the image using the CLI and configure both agent credentials first.
- `node examples/remote.ts`: Vercel analysis with a validated tagged response. Requires Vercel authentication and Codex credentials.

These examples import local source for development. Consumer projects use `@elie-laloum/outpost` and its `/providers/*` exports instead. The CLI generates self-contained consumer scripts with those package imports.
