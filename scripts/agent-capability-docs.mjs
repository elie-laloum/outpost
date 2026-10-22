import { access, readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";
import { builtInAgents } from "../src/adapters/agents/catalog.ts";
import { generatedFiles } from "./generated-files.mjs";

const generated = generatedFiles({
  script: "agent-capability-docs.mjs",
  outputs: [
    "the capability tables of docs/src/content/docs/{,fr/}guide/choose-an-agent.md",
  ],
  sources: ["the agent descriptors and adapters in src/adapters/agents"],
});

const languages = {
  en: {
    path: "docs/src/content/docs/guide/choose-an-agent.md",
    yes: "Yes",
    no: "No",
    modelRequired: "Yes, with an explicit model",
    harness: "Built-in harness",
    signIn: {
      heading: "### Sign in",
      columns: ["Account login", "Account token in a variable", "API key"],
    },
    continuation: {
      heading: "### Continue work",
      columns: ["Resume in a new sandbox", "Fork", "Steering mode"],
    },
  },
  fr: {
    path: "docs/src/content/docs/fr/guide/choose-an-agent.md",
    yes: "Oui",
    no: "Non",
    modelRequired: "Oui, avec un modèle explicite",
    harness: "Harness intégré",
    signIn: {
      heading: "### Se connecter",
      columns: [
        "Connexion au compte",
        "Jeton de compte dans une variable",
        "Clé d’API",
      ],
    },
    continuation: {
      heading: "### Poursuivre le travail",
      columns: [
        "Reprise dans une nouvelle sandbox",
        "Fork",
        "Mode de réorientation",
      ],
    },
  },
};

function agentCapabilities(agent) {
  const adapter = agent.harness().bind();
  const choice = (value) =>
    agent.authentication.find((item) => item.value === value);
  const usage = choice("usage");
  return {
    label: agent.label,
    guide: agent.guide,
    account: choice("account") !== undefined,
    token: choice("account-token") !== undefined,
    apiKey: usage === undefined ? "no" : usage.requiresModel ? "model" : "yes",
    resume: adapter.capture !== false && agent.conversations !== undefined,
    fork: adapter.forkable !== false,
    steering: adapter.liveInput ? "injected" : "resumed",
  };
}

// The built-in loop is not a catalog CLI; its features are fixed by createHarness().
const harness = {
  guide: "harness",
  account: false,
  token: false,
  apiKey: "yes",
  resume: true,
  fork: true,
  steering: "injected",
};

const agents = builtInAgents
  .map(agentCapabilities)
  .sort((left, right) => left.label.localeCompare(right.label, "en"));
for (const agent of agents)
  await access(
    new URL(
      `../docs/src/content/docs/guide/${agent.guide}.md`,
      import.meta.url,
    ),
  ).catch(() => {
    throw new Error(`No Guide page matches ${agent.label}: ${agent.guide}.md`);
  });

function table(columns, rows) {
  return [
    `| Agent | ${columns.join(" | ")} |`,
    `| --- | ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function tables(text) {
  const rows = [...agents, { ...harness, label: text.harness }];
  const answer = (value) => (value ? text.yes : text.no);
  const apiKey = { yes: text.yes, no: text.no, model: text.modelRequired };
  return {
    signIn: table(
      text.signIn.columns,
      rows.map((row) => [
        `[${row.label}](../${row.guide}/)`,
        answer(row.account),
        answer(row.token),
        apiKey[row.apiKey],
      ]),
    ),
    continuation: table(
      text.continuation.columns,
      rows.map((row) => [
        row.label,
        answer(row.resume),
        answer(row.fork),
        `\`${row.steering}\``,
      ]),
    ),
  };
}

// Replaces the first Markdown table between a heading and the next heading.
function replaceTable(markdown, heading, replacement, path) {
  const lines = markdown.split("\n");
  const start = lines.indexOf(heading);
  if (start < 0) throw new Error(`${path} has no "${heading}" heading`);
  const first = lines.findIndex(
    (line, index) => index > start && /^(#|\|)/.test(line),
  );
  if (first < 0 || !lines[first].startsWith("|"))
    throw new Error(`${path} has no table under "${heading}"`);
  let end = first;
  while (lines[end]?.startsWith("|")) end++;
  lines.splice(first, end - first, replacement);
  return lines.join("\n");
}

for (const text of Object.values(languages)) {
  const url = new URL(`../${text.path}`, import.meta.url);
  const current = await readFile(url, "utf8");
  const content = tables(text);
  let updated = replaceTable(
    current,
    text.signIn.heading,
    content.signIn,
    text.path,
  );
  updated = replaceTable(
    updated,
    text.continuation.heading,
    content.continuation,
    text.path,
  );
  const formatted = await prettier.format(updated, {
    ...(await prettier.resolveConfig(url.pathname)),
    parser: "markdown",
  });
  if (process.argv.includes("--write")) await writeFile(url, formatted);
  else if (current !== formatted) throw new Error(generated.stale(text.path));
}
generated.describe();
