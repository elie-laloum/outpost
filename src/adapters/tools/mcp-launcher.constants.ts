// Runs inside the sandbox: checks declared variables, then hands stdio to the server.
export const mcpLauncher = `
const { spawn } = require("node:child_process");
const config = JSON.parse(process.argv[1]);
for (const name of config.variables) {
  if (!process.env[name]) {
    process.stderr.write("Missing " + name + " for MCP server " + config.server + ". Declare it in .outpost/.env or the sandbox provider variables.\\n");
    process.exit(78);
  }
}
const child = spawn(config.command, config.arguments, { stdio: "inherit" });
child.on("error", (error) => {
  process.stderr.write(error.message + "\\n");
  process.exit(127);
});
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"])
  process.on(signal, () => child.kill(signal));
`;
