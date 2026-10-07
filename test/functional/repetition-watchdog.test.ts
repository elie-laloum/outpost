import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createSteering,
  defineHarnessSubagent,
  createHarness,
  createHarnessShellTools,
  createSandbox,
  dispatch,
  defineTextResponse,
  OutpostError,
} from "../../src/index.ts";
import type {
  AgentObservation,
  ModelProvider,
  WatchdogOptions,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";

const repetition = { window: 20, maxRepeats: 3 };
const repeated = `for(let n=0;n<3;n++) console.log(JSON.stringify({kind:'tool',name:'shell',input:{command:'ls'},callId:String(n)}));`;

test("CLI repetition stops the process, preserves dirty work and permits warm reuse", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  const box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  t.after(() => box.close());
  await assert.rejects(
    box.dispatch({
      agent: scripted(
        `import fs from 'node:fs';fs.writeFileSync('saved.txt','keep');${repeated}setInterval(()=>{},1000);`,
      ),
      brief: { text: "work" },
      watchdog: { repetition, onStuck: "stop" },
      observe: (event) => events.push(event),
    }),
    (error: unknown) => error instanceof OutpostError && error.code === "stuck",
  );
  assert.equal(await readFile(join(root, "saved.txt"), "utf8"), "keep");
  assert.ok(
    events.some(
      (event) => event.kind === "stopped" && event.reason === "stuck",
    ),
  );
  const next = await box.dispatch({
    agent: scripted(emit("reused")),
    brief: { text: "continue" },
  });
  assert.equal(next.text, "reused");
});

test("warning policy keeps a CLI running, and disabled detection preserves repetition", async (t) => {
  const root = await repository(t);
  for (const watchdog of [
    undefined,
    { repetition, onStuck: "warn" } as const,
  ]) {
    const warnings: string[] = [];
    const result = await dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: scripted(repeated + emit("done")),
      brief: { text: "work" },
      logging: false,
      ...(watchdog ? { watchdog } : {}),
      warn: (message) => warnings.push(message),
    });
    assert.equal(result.text, "done");
    assert.equal(warnings.length, watchdog ? 1 : 0);
  }
});

test("CLI watchdog resumes with a new instruction and retains final response instructions", async (t) => {
  const root = await repository(t);
  const prompts: string[] = [];
  const events: AgentObservation[] = [];
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
    agent: scripted((input) => {
      prompts.push(input.text ?? "");
      if (input.continuation) return emit("<answer>changed</answer>");
      return `console.log(JSON.stringify({kind:'conversation',id:'loop'}));${repeated}setInterval(()=>{},1000);`;
    }),
    brief: { text: "work" },
    response: defineTextResponse({ tag: "answer" }),
    watchdog: {
      repetition,
      onStuck: { instruction: "Try a different approach." },
    },
    observe: (event) => events.push(event),
  });
  assert.equal(result.value, "changed");
  assert.equal(result.turns.length, 2);
  assert.ok(prompts[1]?.includes("Try a different approach."));
  assert.ok(
    prompts[1]!.indexOf("Try a different approach.") <
      prompts[1]!.lastIndexOf("<answer>"),
  );
  assert.ok(
    events.some((event) => event.kind === "steer" && event.mode === "resumed"),
  );
});

function loopingModel(respondToInstruction: boolean): ModelProvider {
  let call = 0;
  return {
    name: "fixture",
    async request(request) {
      if (
        respondToInstruction &&
        JSON.stringify(request.messages).includes("Try a different approach.")
      )
        return {
          text: "Changed. <outpost>done</outpost>",
          usage: { input: 10, cached: 0, output: 1 },
        };
      return {
        text: "",
        usage: { input: 10, cached: 0, output: 1 },
        content: [
          {
            type: "tool-call",
            id: String(++call),
            name: "shell",
            input: { command: "pwd" },
          },
        ],
      };
    },
  };
}

test("built-in harness detects before executing the repeated tool and can accept steering", async (t) => {
  const root = await repository(t);
  for (const onStuck of [
    "stop",
    { instruction: "Try a different approach." },
  ] satisfies WatchdogOptions["onStuck"][]) {
    const events: AgentObservation[] = [];
    const operation = dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      agent: createAgent({
        model: "fixture",
        harness: createHarness({
          modelProvider: loopingModel(true),
          tools: [createHarnessShellTools()],
        }),
      }),
      brief: { text: "work" },
      watchdog: { repetition, onStuck },
      observe: (event) => events.push(event),
    });
    if (onStuck === "stop")
      await assert.rejects(
        operation,
        (error: unknown) =>
          error instanceof OutpostError && error.code === "stuck",
      );
    if (typeof onStuck === "object") {
      const result = await operation;
      assert.equal(result.completed, true);
      assert.equal(result.usage.input, 40);
    }
    assert.ok(events.some((event) => event.kind === "stuck"));
    assert.equal(
      events.filter((event) => event.kind === "tool-result").length,
      onStuck === "stop" ? 2 : 3,
    );
  }
});

test("instruction interventions are bounded across resumed CLI turns", async (t) => {
  const root = await repository(t);
  let turns = 0;
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      agent: scripted(() => {
        turns++;
        return `console.log(JSON.stringify({kind:'conversation',id:'loop'}));${repeated}setInterval(()=>{},1000);`;
      }),
      brief: { text: "work" },
      watchdog: {
        repetition,
        onStuck: { instruction: "Change approach", maxInterventions: 2 },
      },
    }),
    (error: unknown) => error instanceof OutpostError && error.code === "stuck",
  );
  assert.equal(turns, 3);
});

test("an instruction that cannot be delivered fails explicitly", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      agent: scripted(repeated + emit("finished")),
      brief: { text: "work" },
      watchdog: { repetition, onStuck: { instruction: "Change approach" } },
    }),
    (error: unknown) =>
      error instanceof OutpostError && error.code === "steering",
  );
});

test("trailing activity without a newline still stops a completed CLI command", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      agent: scripted(
        `for(let n=0;n<2;n++)console.log(JSON.stringify({kind:'tool',name:'shell',input:'ls',callId:String(n)}));process.stdout.write(JSON.stringify({kind:'tool',name:'shell',input:'ls',callId:'last'}));`,
      ),
      brief: { text: "work" },
      watchdog: { repetition, onStuck: "stop" },
    }),
    (error: unknown) => error instanceof OutpostError && error.code === "stuck",
  );
});

test("stuck detection is independent of observer errors and redaction", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      agent: scripted(
        `for(const command of ['secret-a','secret-b','secret-c','secret-a','secret-a'])console.log(JSON.stringify({kind:'tool',name:'shell',input:command}));setInterval(()=>{},1000);`,
      ),
      brief: { text: "work" },
      redact: [/secret-[abc]/g],
      watchdog: { repetition, onStuck: "stop" },
      observe(event) {
        events.push(event);
        throw new Error("observer failed");
      },
    }),
    (error: unknown) => error instanceof OutpostError && error.code === "stuck",
  );
  assert.equal(events.filter((event) => event.kind === "tool").length, 5);
  const alert = events.find((event) => event.kind === "stuck");
  assert.equal(alert?.repeats, 3);
  assert.equal(JSON.stringify(alert).includes("secret-"), false);
});

test("a repetitive built-in subagent receives the watchdog instruction in its own history", async (t) => {
  const root = await repository(t);
  const child = createAgent({
    model: "child",
    harness: createHarness({
      modelProvider: loopingModel(true),
      tools: [createHarnessShellTools()],
    }),
  });
  let step = 0;
  const parent: ModelProvider = {
    name: "parent",
    async request() {
      if (++step > 1) return { text: "Reviewed. <outpost>done</outpost>" };
      return {
        text: "",
        content: [
          {
            type: "tool-call",
            id: "delegate",
            name: "review",
            input: { prompt: "Review the repository" },
          },
        ],
      };
    },
  };
  const events: AgentObservation[] = [];
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
    agent: createAgent({
      model: "parent",
      harness: createHarness({
        modelProvider: parent,
        tools: [
          defineHarnessSubagent({
            name: "review",
            description: "Review the repository",
            agent: child,
          }),
        ],
      }),
    }),
    brief: { text: "work" },
    watchdog: {
      repetition,
      onStuck: { instruction: "Try a different approach." },
    },
    observe: (event) => events.push(event),
  });
  assert.equal(result.completed, true);
  const alert = events.find((event) => event.kind === "stuck");
  assert.ok(alert?.subagentId);
  assert.ok(
    events.some(
      (event) =>
        event.kind === "steer" && event.subagentId === alert.subagentId,
    ),
  );
});

test("watchdog instructions share a caller steering controller without taking ownership", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
    steering,
    agent: createAgent({
      model: "fixture",
      harness: createHarness({
        modelProvider: loopingModel(true),
        tools: [createHarnessShellTools()],
      }),
    }),
    brief: { text: "work" },
    watchdog: {
      repetition,
      onStuck: { instruction: "Try a different approach." },
    },
  });
  assert.equal(result.completed, true);
  assert.equal(steering.state, "idle");
  steering.close();
});
