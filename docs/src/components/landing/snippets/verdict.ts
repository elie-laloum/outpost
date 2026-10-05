import { defineJsonResponse, dispatch } from "@elie-laloum/outpost";
import { z } from "zod";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const verdict = defineJsonResponse({
  tag: "verdict",
  schema: z.object({ approved: z.boolean(), reasons: z.array(z.string()) }),
  // Two more turns to fix an answer the schema rejects, same conversation.
  repairs: 2,
});

// Outpost sends the brief unchanged, so it has to show the shape it wants.
const instructions = `Review the last commit.
End with <verdict>{"approved": true, "reasons": []}</verdict>.`;

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  response: verdict,
  brief: { text: instructions },
});

// result.value is typed from the schema: { approved: boolean; reasons: string[] }
if (!result.value.approved) console.log(result.value.reasons);
