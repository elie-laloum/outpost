export const credentialRecipes = Object.freeze({
  tool: 'const {spawnSync}=require("node:child_process"); const {existsSync}=require("node:fs"); const {join}=require("node:path"); const {homedir}=require("node:os"); const [binary,...args]=process.argv.slice(1); const installed=join(homedir(),".outpost-tools","bin",binary); const result=spawnSync(existsSync(installed)?installed:binary,args,{stdio:"inherit",shell:process.platform==="win32"}); process.exit(result.status ?? 1);',
});
