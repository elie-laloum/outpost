import { httpTransportCodes } from "./http-transport.constants.ts";

export function httpTransportFailure(error: unknown) {
  for (const value of [
    error,
    error instanceof Error ? error.cause : undefined,
  ]) {
    if (
      value &&
      typeof value === "object" &&
      "code" in value &&
      typeof value.code === "string" &&
      httpTransportCodes.has(value.code)
    )
      return {
        unavailable: "HTTP transport failure",
        transportCode: value.code,
      };
  }
  return { unavailable: "HTTP transport failure" };
}
