import type { ModelProvider } from "@elie-laloum/outpost";

export function createRepetitiveModel(): ModelProvider {
  let call = 0;
  return {
    name: "offline-repetition-demo",
    async request(request) {
      const usage = { input: 100, cached: 0, output: 10 };
      if (
        JSON.stringify(request.messages).includes("Inspect README.md instead")
      )
        return {
          text: "Changed approach after the watchdog instruction. <outpost>done</outpost>",
          usage,
        };
      if (++call > 4)
        return { text: "Finished polling. <outpost>done</outpost>", usage };
      return {
        text: "",
        usage,
        content: [
          {
            type: "tool-call",
            id: `call-${call}`,
            name: "shell",
            input: { command: "git status --short" },
          },
        ],
      };
    },
  };
}
