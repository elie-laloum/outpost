/** Identifies Outpost to `codex app-server` during initialization. */
export const codexAppClient = Object.freeze({
  name: "outpost",
  title: "Outpost",
  version: "1",
});

/** Request id prefixes; the event decoder ignores rejected steering requests by prefix. */
export const codexAppRequests = Object.freeze({
  initialize: "outpost-initialize",
  thread: "outpost-thread",
  turn: "outpost-turn",
  steer: "outpost-steer",
});

export const codexAppUnsupportedRequest = Object.freeze({
  code: -32601,
  message: "Outpost does not answer interactive Codex requests",
});
