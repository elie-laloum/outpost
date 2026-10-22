import { hostAgentHomes } from "./fixtures/host-environment.constants.ts";

// Preloaded with --import so that no test module reads the host CLI homes.
for (const variable of hostAgentHomes) delete process.env[variable];
