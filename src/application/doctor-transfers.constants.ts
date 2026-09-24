export const transferDiagnosticRecipe = Object.freeze({
  base64: "AAECA/7/AG91dHBvc3QK",
  create: "require('node:fs').mkdirSync(process.argv[1])",
  verify:
    "const fs = require('node:fs'); if (fs.readFileSync(process.argv[1]).toString('base64') !== process.argv[2]) process.exit(1)",
  cleanup:
    "require('node:fs').rmSync(process.argv[1], { recursive: true, force: true })",
});
