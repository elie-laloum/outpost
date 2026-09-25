export const authenticationRecipes = {
  codex: {
    environment: "OPENAI_API_KEY=\n",
    login:
      'const {spawnSync}=require("node:child_process"); const {existsSync}=require("node:fs"); const {join}=require("node:path"); const {homedir}=require("node:os"); const installed=join(homedir(),".outpost-tools","bin","codex"); const result=spawnSync(existsSync(installed)?installed:"codex",["login","--with-api-key"],{stdio:"inherit",shell:process.platform==="win32"}); process.exit(result.status ?? 1);',
    seed: 'const {mkdirSync,writeFileSync,readFileSync,chmodSync}=require("node:fs"); const {join}=require("node:path"); const {homedir}=require("node:os"); const directory=join(homedir(),".codex"); mkdirSync(directory,{recursive:true,mode:0o700}); const target=join(directory,"auth.json"); writeFileSync(target,readFileSync(0),{mode:0o600}); chmodSync(target,0o600);',
  },
  claude: { environment: "ANTHROPIC_API_KEY=\n" },
  gemini: { environment: "GEMINI_API_KEY=\n" },
} as const;
