export class TriggerPayloadError extends Error {
  constructor() {
    super("Verified webhook payload is invalid");
    this.name = "TriggerPayloadError";
  }
}

export function decodeTriggerPayload<T>(decode: () => T): T {
  try {
    return decode();
  } catch {
    throw new TriggerPayloadError();
  }
}
