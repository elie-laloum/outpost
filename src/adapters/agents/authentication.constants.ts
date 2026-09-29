export const credentialRecipes = Object.freeze({
  tool: 'const {spawnSync}=require("node:child_process"); const {existsSync}=require("node:fs"); const {join}=require("node:path"); const {homedir}=require("node:os"); const [binary,...args]=process.argv.slice(1); const installed=join(homedir(),".outpost-tools","bin",binary); const result=spawnSync(existsSync(installed)?installed:binary,args,{stdio:"inherit",shell:process.platform==="win32"}); process.exit(result.status ?? 1);',
  antigravitySettings: '{"modelProvider":"gemini"}\n',
});

export const credentialVariables = Object.freeze({
  claude: { account: "CLAUDE_CODE_OAUTH_TOKEN", usage: "ANTHROPIC_API_KEY" },
  codex: { usage: "OPENAI_API_KEY" },
  antigravity: { usage: "GEMINI_API_KEY" },
  copilot: { account: "COPILOT_GITHUB_TOKEN" },
  kimi: { usage: "KIMI_API_KEY" },
} as const);

export const KIMI_LOGIN_DEADLINE_MS = 120_000;

export const hostCredentialSources = Object.freeze({
  claude: {
    path: "~/.claude/.credentials.json",
    home: { variable: "CLAUDE_CONFIG_DIR", path: ".credentials.json" },
  },
  codexMcp: {
    path: "~/.codex/.credentials.json",
    home: { variable: "CODEX_HOME", path: ".credentials.json" },
  },
});
