import { speculate, createLocalTransport } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { scripted, emit } from "../helpers.ts";
const repository = process.argv[2]!;
const directory = process.argv[3]!;
const local = createLocalSandboxProvider();
const phase = process.argv[4] ?? "validation";
const best = phase.startsWith("best-");
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
          if (phase === "cleanup" || phase === "best-cleanup")
            await interrupt();
          await lease.release();
        },
      };
    },
  },
  durability: {
    transporter: createLocalTransport({ directory }),
    runId: "crash",
    version: "1",
  },
  candidates: [
    {
      key: "candidate",
      agent: scripted(emit("done")),
      request: { brief: { text: "fixture" } },
    },
    ...(best
      ? [
          {
            key: "later",
            agent: scripted(emit("later")),
            request: { brief: { text: "fixture" } },
          },
        ]
      : []),
  ],
  budget: { attempts: best ? 3 : 2 },
  ...(best
    ? {
        concurrency: 1,
        select: "best" as const,
        async score() {
          if (phase === "best-scoring") await interrupt();
          return 1;
        },
      }
    : {}),
  async validate() {
    if (phase === "validation") await interrupt();
    return true;
  },
});
