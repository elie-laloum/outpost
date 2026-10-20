export const copilotRpcBridge = String.raw`
const {spawn}=require("node:child_process");
const {createInterface}=require("node:readline");
const child=spawn("copilot",JSON.parse(process.argv[1]),{stdio:["pipe","pipe","inherit"]});
const limit=8*1024*1024;
let buffer=Buffer.alloc(0),failed=false;
function fail(){
  if(failed)return;
  failed=true;
  process.stderr.write("Invalid Copilot RPC transport\n");
  child.kill("SIGTERM");
  process.exitCode=1;
}
child.on("error",fail);
child.stdin.on("error",fail);
process.stdout.on("error",fail);
child.on("close",(code)=>{process.exitCode=failed?1:(code??1);process.stdin.destroy();});
child.stdout.on("data",chunk=>{
  buffer=Buffer.concat([buffer,chunk]);
  for(;;){
    const end=buffer.indexOf("\r\n\r\n");
    if(end<0){if(buffer.length>8192)fail();return;}
    const header=buffer.subarray(0,end).toString("ascii");
    const match=/^Content-Length: (\d+)$/im.exec(header);
    if(!match||end>8192)return fail();
    const size=Number(match[1]);
    if(!Number.isSafeInteger(size)||size>limit)return fail();
    if(buffer.length<end+4+size)return;
    try{process.stdout.write(JSON.stringify(JSON.parse(buffer.subarray(end+4,end+4+size).toString("utf8")))+"\n");}
    catch{return fail();}
    buffer=buffer.subarray(end+4+size);
  }
});
child.stdout.on("end",()=>{if(buffer.length)fail();});
const input=createInterface({input:process.stdin,crlfDelay:Infinity});
input.on("line",line=>{
  if(failed)return;
  if(Buffer.byteLength(line)>limit)return fail();
  try{
    const message=JSON.parse(line);
    if(message.method==="session.create"||message.method==="session.resume")
      message.params={...message.params,workingDirectory:process.cwd()};
    const body=Buffer.from(JSON.stringify(message));
    child.stdin.write(Buffer.concat([Buffer.from("Content-Length: "+body.length+"\r\n\r\n"),body]));
  }catch{fail();}
});
input.on("close",()=>child.stdin.end());
`;

export const copilotRpcInitialId = "outpost-open";
