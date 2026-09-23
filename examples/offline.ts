import { task, workflow } from "../src/index.ts";

const sources = ["configuration", "execution", "recovery"].map((name) =>
  task({
    key: name,
    perform: async ({ signal }) => {
      signal.throwIfAborted();
      return { name, checked: true };
    },
  }),
);

const report = task({
  key: "report",
  after: sources,
  perform: (context) => sources.map((source) => context.value(source)),
});

const plan = workflow("offline-example", [...sources, report]);
const result = await plan.start({ concurrency: 3 });
result.unwrap();
console.log(JSON.stringify(result.value(report), null, 2));
console.log(plan.diagram());
