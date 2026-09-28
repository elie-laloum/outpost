export const replayRecordingDefaults = Object.freeze({
  maxBytes: 8 * 1024 * 1024,
  attributes: "* -diff\n",
});

export const commitIdentity = /^(.*) <([^<>]*)> (\d+ [+-]\d{4})$/;
