import { defineJsonResponse, dispatch } from "@elie-laloum/outpost";
import { z } from "zod";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const verdict = defineJsonResponse({
  tag: "verdict",
  schema: z.object({ approved: z.boolean(), reasons: z.array(z.string()) }),
  repairs: 2,
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  response: verdict,
  brief: { text: "Review the last commit. End with a <verdict> block." },
});

// result.value is typed from the schema: { approved: boolean; reasons: string[] }
if (!result.value.approved) console.log(result.value.reasons);
