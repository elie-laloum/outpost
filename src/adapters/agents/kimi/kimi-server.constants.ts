export const kimiServerBridge = String.raw`
const {spawn}=require("node:child_process");
const {createInterface}=require("node:readline");
const {randomUUID}=require("node:crypto");
const child=spawn("kimi",["web","--host","127.0.0.1","--port","0","--no-open"],{stdio:["ignore","pipe","pipe"]});
let banner="",origin,token,sessionId,model,ws,closed=false,failed=false,ending=false;
let processing=Promise.resolve();
const outstanding=new Set(),accepted=new Set();
const emit=event=>process.stdout.write(JSON.stringify({role:"outpost-server",...event})+"\n");
const stop=()=>{if(ending)return;ending=true;clearTimeout(startup);ws?.close();child.kill("SIGTERM");};
const fail=code=>{
  if(failed)return;
  failed=true;
  emit({type:"failure",message:"Kimi server protocol failed ("+String(code)+")"});
  process.exitCode=1;
  stop();
};
child.on("error",()=>fail("start"));
child.on("close",(code)=>{
  if(!ending)fail("unexpected-exit");
  process.exitCode=code!==0&&code!==null?code:(failed?1:0);
  process.stdin.destroy();
});
process.stdout.on("error",()=>fail("output"));
const startup=setTimeout(()=>fail("startup-timeout"),30000);
let ready;
const readyPromise=new Promise(resolve=>{ready=resolve;});
function output(chunk){
  if(origin)return;
  banner=(banner+chunk.toString()).slice(-65536);
  const match=/http:\/\/127\.0\.0\.1:(\d+)\/?[^\s]*#token=([A-Za-z0-9_-]+)/.exec(banner);
  if(!match)return;
  origin="http://127.0.0.1:"+match[1];token=match[2];banner="";
  clearTimeout(startup);ready();
}
child.stdout.on("data",output);
child.stderr.on("data",output);
async function request(path,body){
  const response=await fetch(origin+"/api/v1"+path,{
    method:body===undefined?"GET":"POST",
    headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    signal:AbortSignal.timeout(20000),redirect:"error",
  });
  if(!response.ok)throw new Error("http-"+response.status);
  let bytes=0,text="";
  const decoder=new TextDecoder();
  for await(const chunk of response.body){
    bytes+=chunk.length;if(bytes>8*1024*1024)throw new Error("response-limit");
    text+=decoder.decode(chunk,{stream:true});
  }
  const value=JSON.parse(text+decoder.decode());
  if(value.code!==0)throw new Error("api-"+String(value.code));
  return value.data;
}
function acknowledge(id){
  if(typeof id!=="string"||!outstanding.has(id)||accepted.has(id))return;
  accepted.add(id);emit({type:"accepted"});
}
async function connect(){
  await new Promise((resolve,reject)=>{
    const rejectSubscription=code=>{clearTimeout(timer);reject(new Error(code));};
    const timer=setTimeout(()=>rejectSubscription("subscribe-timeout"),20000);
    ws=new WebSocket(origin.replace("http:","ws:")+"/api/v1/ws",["kimi-code.bearer."+token]);
    ws.addEventListener("error",()=>rejectSubscription("websocket"));
    ws.addEventListener("close",()=>{clearTimeout(timer);if(!ending){rejectSubscription("websocket");fail("websocket-closed");}});
    ws.addEventListener("message",({data})=>{
      try{
        if(typeof data!=="string"||Buffer.byteLength(data)>8*1024*1024)throw new Error("frame-limit");
        const frame=JSON.parse(data);
        if(frame.type==="server_hello")ws.send(JSON.stringify({type:"client_hello",id:"open",payload:{subscriptions:[sessionId]}}));
        if(frame.type==="ping")ws.send(JSON.stringify({type:"pong",payload:frame.payload}));
        if(frame.type==="ack"&&frame.id==="open"){
          clearTimeout(timer);
          if(frame.code!==0||!frame.payload?.accepted_subscriptions?.includes(sessionId)||frame.payload?.resync_required?.includes(sessionId))return rejectSubscription("subscription");
          resolve();return;
        }
        if(frame.type==="resync_required")throw new Error("event-gap");
        const event=frame.payload;
        if(!event||event.sessionId!==sessionId||event.agentId&&event.agentId!=="main")return;
        if(event.type==="turn.started")acknowledge(event.promptId);
        if(event.type==="prompt.steered"){
          for(const id of event.promptIds??[]){acknowledge(id);outstanding.delete(id);}
        }
        emit({type:"event",event});
        if(event.type==="prompt.completed"||event.type==="prompt.aborted"){
          if(!outstanding.delete(event.promptId))return;
          if(event.type==="prompt.aborted"||event.reason&&event.reason!=="completed")return fail("prompt-failed");
          if(!outstanding.size)emit({type:"finished"});
          if(closed&&!outstanding.size)stop();
        }
      }catch{fail("event");}
    });
  });
}
async function send(input){
  await readyPromise;
  if(failed)throw new Error("startup");
  if(!sessionId){
    model=input.model??(input.session?undefined:(await request("/config")).default_model);
    sessionId=input.session??(await request("/sessions",{metadata:{cwd:process.cwd()}})).id;
    if(typeof sessionId!=="string"||!/^[A-Za-z0-9_-]+$/.test(sessionId))throw new Error("session");
    if(input.session)await request("/sessions/"+sessionId+"/status");
    emit({type:"conversation",id:sessionId});
    await connect();
  }
  const id=randomUUID();
  outstanding.add(id);
  const result=await request("/sessions/"+sessionId+"/prompts",{
    prompt_id:id,content:[{type:"text",text:input.text}],permission_mode:"auto",
    ...(model?{model}:{}),
  });
  if(result.status==="queued")
    await request("/sessions/"+sessionId+"/prompts/"+id+":steer",{});
}
const input=createInterface({input:process.stdin,crlfDelay:Infinity});
input.on("line",line=>{
  processing=processing.then(()=>{
    if(Buffer.byteLength(line)>1024*1024)throw new Error("input-limit");
    return send(JSON.parse(line));
  }).catch(error=>fail(/^(api-\d+|http-\d+|subscription|subscribe-timeout|websocket|session|startup)$/.test(error.message)?error.message:"request"));
});
input.on("close",()=>{
  closed=true;
  void processing.then(()=>{if(!outstanding.size)stop();});
});
`;
