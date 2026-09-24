import { isIP } from "node:net";
import { egressFields } from "./egress.constants.ts";
import { invariant } from "./errors.ts";
import type { EgressPolicy } from "./egress.types.ts";

function entries(
  value: unknown,
  label: string,
  validate: (entry: string) => boolean,
): string[] {
  if (value === undefined) return [];
  invariant(Array.isArray(value), `${label} must be an array`);
  const items = Array.from(value);
  invariant(
    items.every((entry) => typeof entry === "string" && validate(entry)),
    `Invalid ${label} entry`,
  );
  return [...new Set<string>(items)];
}

function domain(value: string): boolean {
  const name = value.startsWith("*.") ? value.slice(2) : value;
  return (
    name.length <= 253 &&
    !isIP(name) &&
    name.includes(".") &&
    name
      .split(".")
      .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))
  );
}

function cidr(value: string): boolean {
  const parts = value.split("/");
  if (parts.length !== 2) return false;
  const version = isIP(parts[0]!);
  return (
    version !== 0 &&
    /^(0|[1-9][0-9]*)$/.test(parts[1]!) &&
    Number(parts[1]) <= (version === 4 ? 32 : 128) &&
    !parts[0]!.includes("%")
  );
}

export function validateEgress(value: unknown): EgressPolicy | undefined {
  if (value === undefined) return undefined;
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    "egress must be a policy object",
  );
  invariant("mode" in value, "egress requires a mode");
  if (value.mode === "deny-all") {
    invariant(
      Object.keys(value).every((key) => key === "mode"),
      "deny-all does not accept allowlist fields",
    );
    return { mode: "deny-all" };
  }
  invariant(
    value.mode === "allowlist",
    "egress mode must be deny-all or allowlist",
  );
  invariant(
    Object.keys(value).every((key) => egressFields.includes(key)),
    "Unknown egress policy field",
  );
  const domains = entries(
    "domains" in value ? value.domains : undefined,
    "egress domains",
    domain,
  );
  const allowCidrs = entries(
    "allowCidrs" in value ? value.allowCidrs : undefined,
    "egress allowCidrs",
    cidr,
  );
  const denyCidrs = entries(
    "denyCidrs" in value ? value.denyCidrs : undefined,
    "egress denyCidrs",
    cidr,
  );
  invariant(
    domains.length + allowCidrs.length > 0,
    "egress allowlist requires an allowed domain or CIDR; use deny-all to block everything",
  );
  return { mode: "allowlist", domains, allowCidrs, denyCidrs };
}
