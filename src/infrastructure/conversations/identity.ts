import { invariant } from "../../domain/errors.ts";

export function projectKey(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, "-");
}

export function validId(id: string): void {
  invariant(/^[A-Za-z0-9_-]+$/.test(id), "Invalid conversation identifier");
}
