/** Runs argv[2..] with stdin fed from base64 lines appended to argv[1]; an empty line ends stdin. */
export const cloudInputScript = `const fs=require("node:fs");
const {spawn}=require("node:child_process");
const {constants}=require("node:os");
const [file,program,...args]=process.argv.slice(1);
const child=spawn(program,args,{stdio:["pipe","inherit","inherit"]});
let offset=0,pending="",ended=false;
child.stdin.on("error",()=>{});
const poll=()=>{
if(ended)return;
const data=fs.readFileSync(file);
if(data.length>offset){pending+=data.subarray(offset).toString("utf8");offset=data.length}
let end;
while((end=pending.indexOf("\\n"))>=0){
const line=pending.slice(0,end);pending=pending.slice(end+1);
if(!line){ended=true;child.stdin.end();return}
child.stdin.write(Buffer.from(line,"base64"));
}
setTimeout(poll,50);
};
poll();
child.on("error",error=>{process.stderr.write(error.message+"\\n");process.exit(error.code==="ENOENT"?127:126)});
child.on("close",(code,signal)=>process.exit(code??(signal?128+(constants.signals[signal]??0):127)));`;
