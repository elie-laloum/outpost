export const sandboxDiagnosticDefaults = Object.freeze({
  maximumDeadlineMs: 60_000,
  command:
    "process.stdout.write('outpost-stdout'); process.stderr.write('outpost-stderr'); process.exitCode = 7",
  home: "const fs = require('node:fs'); fs.accessSync(process.argv[1], fs.constants.R_OK | fs.constants.W_OK); if (!fs.statSync(process.argv[1]).isDirectory()) process.exit(1)",
});
