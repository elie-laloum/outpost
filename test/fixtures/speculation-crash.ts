import { speculate, localTransport } from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { scripted, emit } from "../helpers.ts";
const repository = process.argv[2]!;
const directory = process.argv[3]!;
const local = localSandboxProvider();
const phase = process.argv[4] ?? "validation";
async function interrupt() {
  process.send?.("ready");
  await new Promise<void>(() => {
    setInterval(() => {}, 1000);
  });
}
await speculate({
  repository,
  sandboxProvider: {
    ...local,
    recover: async () => {},
    async acquire(context) {
      await context.registerRecovery?.("fixture-resource");
      if (phase === "allocation") await interrupt();
      const lease = await local.acquire(context);
      return {
        ...lease,
        async release() {
          if (phase === "cleanup") await interrupt();
          await lease.release();
        },
      };
    },
  },
  durability: {
    transporter: localTransport({ directory }),
    runId: "crash",
    version: "1",
  },
  candidates: [
    {
      key: "candidate",
      agent: scripted(emit("done")),
      request: { brief: { text: "fixture" } },
    },
  ],
  budget: { attempts: 2 },
  async validate() {
    if (phase === "validation") await interrupt();
    return true;
  },
});
