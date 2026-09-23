import { codex, dispatch, response } from "../src/index.ts";
import { vercel } from "../src/providers/vercel.ts";

const result = await dispatch({
  agent: codex(),
  provider: vercel(),
  branch: { mode: "named", name: "outpost/remote-analysis" },
  brief: {
    text: "Inspect the repository without modifying it. Return your findings inside <findings> tags.",
  },
  response: response.text({ tag: "findings", repairs: 1 }),
});

console.log(result.value);
