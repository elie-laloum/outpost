import { invariant } from "./errors.ts";
import type {
  CompiledRule,
  HarnessPermissionRule,
  HarnessPermissions,
  HarnessPermissionsOptions,
  PermissionDecision,
  ToolResources,
} from "./permissions.types.ts";

const RULE_FIELDS = new Set(["effect", "tools", "paths", "commands", "reason"]);
const allowed: PermissionDecision = Object.freeze({ allowed: true });

export function defineHarnessPermissions(
  options: HarnessPermissionsOptions,
): HarnessPermissions {
  invariant(
    options !== null &&
      typeof options === "object" &&
      Array.isArray(options.rules),
    "Permissions require a rules array",
  );
  const fallback = options.default ?? "allow";
  invariant(
    fallback === "allow" || fallback === "deny",
    'Permission default must be "allow" or "deny"',
  );
  const compiled = options.rules.map(compileRule);
  return Object.freeze({
    kind: "permissions",
    rules: Object.freeze(compiled.map(({ rule }) => rule)),
    default: fallback,
    evaluate(tool: string, resources: ToolResources): PermissionDecision {
      const index = compiled.findIndex((entry) =>
        applies(entry, tool, resources),
      );
      const rule = compiled[index]?.rule;
      if (rule?.effect === "allow") return allowed;
      if (rule)
        return {
          allowed: false,
          reason: rule.reason ?? `Denied by permission rule ${index + 1}`,
        };
      if (fallback === "allow") return allowed;
      return { allowed: false, reason: "Denied by default permissions" };
    },
  });
}

export function normalizeResourcePath(path: string): string | undefined {
  const segments: string[] = [];
  const posix = path.replaceAll("\\", "/");
  if (posix.startsWith("/") || /^[A-Za-z]:\//.test(posix)) return undefined;
  for (const segment of posix.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment !== "..") {
      segments.push(segment);
      continue;
    }
    if (!segments.length) return undefined;
    segments.pop();
  }
  return segments.join("/");
}

function compileRule(rule: HarnessPermissionRule): CompiledRule {
  invariant(
    rule !== null &&
      typeof rule === "object" &&
      Object.keys(rule).every((key) => RULE_FIELDS.has(key)),
    "Permission rules accept effect, tools, paths, commands and reason",
  );
  invariant(
    rule.effect === "allow" || rule.effect === "deny",
    'Permission effect must be "allow" or "deny"',
  );
  invariant(
    rule.reason === undefined ||
      (typeof rule.reason === "string" && rule.reason.trim()),
    "Permission reason must be nonempty text",
  );
  return Object.freeze({
    rule: Object.freeze({ ...rule }),
    ...patterns("tools", rule.tools, (value) => glob(value, "[^]*")),
    ...patterns("paths", rule.paths, (value) => glob(value, "[^/]*")),
    ...patterns("commands", rule.commands, (value) => glob(value, "[^]*")),
  });
}

function patterns(
  key: "tools" | "paths" | "commands",
  values: readonly string[] | undefined,
  compile: (value: string) => RegExp,
) {
  if (values === undefined) return {};
  invariant(
    Array.isArray(values) &&
      values.length > 0 &&
      values.every((value) => typeof value === "string" && value.trim()),
    `Permission ${key} must be a nonempty list of patterns`,
  );
  return { [key]: Object.freeze(values.map(compile)) };
}

function glob(pattern: string, star: string): RegExp {
  let source = "";
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index]!;
    if (character === "*" && pattern[index + 1] === "*") {
      const directory = pattern[index + 2] === "/";
      source += directory ? "(?:[^]*/)?" : "[^]*";
      index += directory ? 2 : 1;
      continue;
    }
    source += globTokens[character]?.(star) ?? escape(character);
  }
  return new RegExp(`^${source}$`);
}

const globTokens: Readonly<Record<string, (star: string) => string>> = {
  "*": (star) => star,
  "?": () => "[^/]",
};

function escape(character: string): string {
  return character.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

function applies(
  entry: CompiledRule,
  tool: string,
  resources: ToolResources,
): boolean {
  if (entry.tools && !entry.tools.some((pattern) => pattern.test(tool)))
    return false;
  if (entry.commands) {
    const command = resources.command;
    if (command === undefined) return false;
    if (!entry.commands.some((pattern) => pattern.test(command))) return false;
  }
  if (!entry.paths) return true;
  const paths = (resources.paths ?? []).map(normalizeResourcePath);
  if (!paths.length) return false;
  const matches = (path: string | undefined) =>
    path !== undefined && entry.paths!.some((pattern) => pattern.test(path));
  return entry.rule.effect === "allow"
    ? paths.every(matches)
    : paths.some(matches);
}
