import { registerHooks } from "node:module";

// Preloaded with --import: prints every loaded module URL as the last stderr line.
const loaded: string[] = [];
registerHooks({
  load(url, context, next) {
    loaded.push(url);
    return next(url, context);
  },
});
process.on("exit", () => process.stderr.write(`${JSON.stringify(loaded)}\n`));
