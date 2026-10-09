// Drawn Guide icons on a 24px grid: 1.6 stroke, round caps and joins, current color.
const shapes = {
  agent:
    '<rect x="4" y="8" width="16" height="12"/><path d="M12 8V4.5"/><circle cx="12" cy="3.5" r="1"/><path d="M9 13v2M15 13v2"/>',
  alert: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4M12 17h.01"/>',
  approve:
    '<rect x="3.5" y="3.5" width="17" height="17"/><path d="m8 12 3 3 5-6"/>',
  book: '<path d="M5 3.5h10.5l3.5 3.5v13.5H5z"/><path d="M9 9h6M9 12.5h6M9 16h3.5"/>',
  bookmark: '<path d="M6 3.5h12v17l-6-4-6 4z"/>',
  bot: '<rect x="6" y="6" width="12" height="12"/><path d="M9.5 2.5v3.5M14.5 2.5v3.5M9.5 18v3.5M14.5 18v3.5M2.5 9.5H6M2.5 14.5H6M18 9.5h3.5M18 14.5h3.5"/>',
  box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  braces:
    '<path d="M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1"/><path d="M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1"/>',
  branch:
    '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10"/><path d="M18 10c0 4.5-6 3.5-11 7.5"/>',
  ci: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 8v8M18 16V9a3 3 0 0 0-3-3h-4"/><path d="m13 3-3 3 3 3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cloud:
    '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.5 3.5 0 0 0 7 18.5z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  containers:
    '<rect x="3" y="9" width="8" height="8"/><rect x="13" y="9" width="8" height="8"/><path d="M7 9V5.5h10V9"/>',
  database:
    '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  download: '<path d="M12 3.5v11M7 10l5 5 5-5M5 20.5h14"/>',
  file: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/>',
  folder: '<path d="M3 6h6l2 2.5h10V19H3z"/>',
  fit: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  gauge: '<path d="M4 17.5a8 8 0 1 1 16 0"/><path d="m12 17.5 4-5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>',
  layers: '<path d="m12 3.5 9 5-9 5-9-5z"/><path d="m3 13.5 9 5 9-5"/>',
  lifebuoy:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  lines: '<path d="M4 6h16M4 12h11M4 18h7"/>',
  lock: '<rect x="5" y="11" width="14" height="10"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  minus: '<path d="M5 12h14"/>',
  message: '<path d="M4 4.5h16v11.5H9.5L4 20.5z"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="12"/><path d="M8 20.5h8M12 16v4.5"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  nodes:
    '<rect x="3" y="4" width="6" height="6"/><rect x="15" y="14" width="6" height="6"/><path d="M9 7h4a2 2 0 0 1 2 2v5"/>',
  package:
    '<rect x="3.5" y="7.5" width="17" height="13"/><path d="M3.5 7.5 6.5 3.5h11l3 4M10 11.5h4"/>',
  pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
  play: '<path d="m7.5 5 11 7-11 7z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3.5a6 6 0 0 1-12 0zM12 17.5V21"/>',
  puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z"/>',
  pulse: '<path d="M3 12h4l3-7.5 4 15 3-7.5h4"/>',
  question:
    '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.4M12 16.8h.01"/>',
  queue:
    '<path d="M8.5 6H21M8.5 12H21M8.5 18H21M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  repeat:
    '<path d="m17 2.5 3 3-3 3"/><path d="M4 11.5v-2a4 4 0 0 1 4-4h12"/><path d="m7 21.5-3-3 3-3"/><path d="M20 12.5v2a4 4 0 0 1-4 4H4"/>',
  replay: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v5h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  server:
    '<rect x="4" y="4" width="16" height="7"/><rect x="4" y="13" width="16" height="7"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  shuffle:
    '<path d="M16 3.5h4.5V8M4 20 20.5 3.5M20.5 16v4.5H16M15 15l5.5 5.5M4 4l5 5"/>',
  sliders:
    '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  split:
    '<path d="M12 21v-9.5M12 11.5 6 4M12 11.5 18 4"/><path d="M3.5 4h5M15.5 4h5"/>',
  stack:
    '<path d="m12 4 9 4-9 4-9-4z"/><path d="m3 12 9 4 9-4"/><path d="m3 16 9 4 9-4"/>',
  steer: '<path d="M3.5 11 20.5 3.5 13 20.5 11 13z"/>',
  terminal: '<path d="m4.5 17 6-5-6-5M12.5 19h7"/>',
  "terminal-window":
    '<rect x="3" y="4" width="18" height="16"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  timer:
    '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2 2M10 2.5h4"/>',
  trash:
    '<path d="M4 7h16M10 11v6M14 11v6"/><path d="m6 7 1 13.5h10L18 7M9 7V3.5h6V7"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.2"/><path d="M16.5 14a5 5 0 0 1 4.5 5"/>',
  variable:
    '<path d="M8 4c-3 3-3 13 0 16M16 4c3 3 3 13 0 16"/><path d="m10 9 4 6M14 9l-4 6"/>',
  wrench:
    '<path d="M15 3.5a5 5 0 0 0-5.3 6.8L3.5 16.5l4 4 6.2-6.2A5 5 0 0 0 20.5 9l-3.2 1-3.3-3.3z"/>',
  bolt: '<path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12z"/>',
};

// Guide page slug -> icon; cells linking elsewhere fall back to the compass.
const pageIcons = {
  introduction: "compass",
  "how-it-works": "compass",
  setup: "download",
  "first-request": "play",
  "first-workflow": "nodes",
  "development-workflow": "branch",
  "fix-failing-ci": "ci",
  "review-on-label": "message",
  "nightly-maintenance": "moon",
  "multi-repository-change": "folder",
  "compete-agents": "split",
  briefs: "book",
  workspaces: "folder",
  "typed-responses": "braces",
  "sandbox-sessions": "terminal",
  "environment-setup": "sliders",
  conversations: "message",
  "limits-and-cancellation": "timer",
  steering: "steer",
  progress: "pulse",
  "choose-an-agent": "agent",
  authentication: "key",
  "claude-code": "agent",
  codex: "agent",
  "copilot-cli": "agent",
  "kimi-code": "agent",
  antigravity: "agent",
  "mcp-servers": "plug",
  "mcp-oauth": "key",
  "fallback-agents": "shuffle",
  harness: "bot",
  "model-providers": "bot",
  "harness-tools": "wrench",
  "harness-permissions": "shield",
  subagents: "users",
  "harness-context": "lines",
  "choose-a-sandbox": "box",
  containers: "containers",
  "agent-images": "layers",
  "cloud-sandboxes": "cloud",
  "host-process": "monitor",
  firecracker: "server",
  "environment-variables": "variable",
  isolation: "shield",
  "network-restrictions": "globe",
  "private-git": "lock",
  "typed-workflows": "nodes",
  "task-dependencies": "nodes",
  "concurrency-and-retries": "repeat",
  "verification-loops": "repeat",
  "multiple-repositories": "folder",
  speculation: "split",
  budgets: "gauge",
  "task-cache": "database",
  artifacts: "package",
  "durable-runs": "bookmark",
  "quota-pauses": "pause",
  approvals: "approve",
  "interactive-tasks": "question",
  "unattended-runs": "queue",
  "ci-automation": "ci",
  "job-queues": "queue",
  "redis-workers": "stack",
  "cron-schedules": "clock",
  webhooks: "bolt",
  "observe-and-recover": "pulse",
  storage: "database",
  "object-storage": "cloud",
  journals: "book",
  observability: "pulse",
  "record-replay": "replay",
  diagnostics: "search",
  "error-handling": "alert",
  recovery: "lifebuoy",
  retention: "trash",
  security: "shield",
  cli: "terminal-window",
  "integration-ports": "puzzle",
  "custom-agents": "puzzle",
  "conversation-formats": "message",
  "custom-sandbox-providers": "puzzle",
};

export function iconForHref(href) {
  const slug = String(href ?? "").match(
    /(?:^|\/)([a-z0-9-]+)\/?(?:#.*)?$/,
  )?.[1];
  return pageIcons[slug] ?? "compass";
}

const cardIcons = [
  [/\b(usage|budget|limit|limite|count|compt)/, "gauge"],
  [/\b(git|branch|branche|commit|worktree)/, "branch"],
  [/\b(auth|credential|identifiant|token|jeton|ssh|acl)|\bcles?\b/, "key"],
  [
    /\b(permission|privilege|trust|trusted|confiance|safe|secur|isolat|check|valid|verif|control|baseline|reference)/,
    "shield",
  ],
  [/\b(network|reseau|tap|route)/, "globe"],
  [/\b(docker|podman|container|conteneur)/, "containers"],
  [/\b(cloud|remote|distant)/, "cloud"],
  [/\b(image|base|kernel|noyau|rootfs)/, "layers"],
  [/\b(model|modele|anthropic|openai)/, "bot"],
  [/\b(agent|child|enfant|parent|deleg)/, "agent"],
  [/\b(tool|outil|hook)/, "wrench"],
  [/\b(host|hote|machine|linux|kvm|server|serveur)/, "server"],
  [
    /\b(home|foyer|directory|repertoire|workspace|espace|repository|depot|mount|mont)/,
    "folder",
  ],
  [/\b(environment|environnement|config)/, "sliders"],
  [/\b(fail|failure|error|erreur|echec|reject|rejet|exhaust|epuis)/, "alert"],
  [
    /\b(cancel|annul|stop|arret|close|closing|ferm|retire|retirer|revoke|revoqu)/,
    "pause",
  ],
  [/\b(pause|wait|attend|attente)/, "clock"],
  [/\b(deadline|delai|echeance|lease|bail)/, "timer"],
  [/\b(recover|recovery|restor|reparer|recuper)/, "lifebuoy"],
  [/\b(replay|rejou|re-emit|reem)/, "replay"],
  [/\b(retry|retries|resume|repr|again|round|tour|reuse|reutilis)/, "repeat"],
  [/\b(download|telecharg|bring|rapatr)/, "download"],
  [/\b(upload|send|envoy|submit|soumet|publish|publi|enqueue|enfil)/, "steer"],
  [/\b(save|sauv|store|stor|stock|cache|redis|transport)/, "database"],
  [/\b(question|answer|repond|reponse|result|output|sortie)/, "message"],
  [
    /\b(prompt|brief|instruction|script|file|fichier|format|byte|octet)/,
    "file",
  ],
  [
    /\b(process|processus|exit|sortir|invoke|command|commande)|\bcli\b/,
    "terminal",
  ],
  [/\b(observ|monitor|surveill)/, "pulse"],
  [/\b(inspect|read|lire|look|compar|discover|decouvr)/, "search"],
  [
    /\b(approve|accept|appro|decid|complete|termin|finish|fin|done|keep|gard)/,
    "approve",
  ],
  [/\b(lock|unlock|owner|proprietaire|verrou|bind|lier)/, "lock"],
  [/\b(release|liber|remove|supprim|clear|effac)/, "trash"],
  [/\b(run|start|execut|demarr|lancer|attempt|tentative|use|utilis)/, "play"],
  [/\b(version|pinned|epingle|sha)/, "package"],
  [/\b(connect|connexion|mcp|port)/, "plug"],
  [/\b(add|ajout)/, "plus"],
  [/\b(scale|worker|travailleur|client)/, "users"],
];

export function iconForTitle(title) {
  const label = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return cardIcons.find(([pattern]) => pattern.test(label))?.[1] ?? "book";
}

export function icon(name) {
  const markup = iconMarkup(name);
  const children = [...markup.matchAll(/<(\w+)([^>]*?)\/>/g)].map(
    ([, tagName, attributes]) => ({
      type: "element",
      tagName,
      properties: Object.fromEntries(
        [...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [
          k,
          v,
        ]),
      ),
      children: [],
    }),
  );
  return {
    type: "element",
    tagName: "svg",
    properties: {
      className: ["guide-icon"],
      viewBox: "0 0 24 24",
      width: "20",
      height: "20",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ariaHidden: "true",
      focusable: "false",
    },
    children,
  };
}

export function iconMarkup(name) {
  return shapes[name] ?? shapes.compass;
}
