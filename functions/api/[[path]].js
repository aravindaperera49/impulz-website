// Cloudflare Pages Function. Set DB D1 binding, ADMIN_PASSWORD and SESSION_SECRET as encrypted secrets.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const enc=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const sign=async(secret,data)=>{const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(data)))};
const equal=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0};
const getCookie=req=>(req.headers.get('Cookie')||'').match(/(?:^|;\s*)impulz_session=([^;]+)/)?.[1]||'';
const authed=async(req,env)=>{if(!env.SESSION_SECRET)return false;const cookie=getCookie(req),[exp,sig]=cookie.split('.');if(!/^\d+$/.test(exp)||Number(exp)<Date.now()||Number(exp)>Date.now()+86400000)return false;return equal(sig,await sign(env.SESSION_SECRET,exp))};
const now=()=>Date.now(),uid=()=>crypto.randomUUID();
async function handle({request,env}) {
 const url=new URL(request.url),route=url.pathname.replace(/^\/api\/?/,'').replace(/\/$/,'');const method=request.method;
 if(!env.DB)return json({error:'Database not configured yet'},503);
 if(method==='GET'&&route==='testimonials'){const data=await env.DB.prepare("SELECT CASE WHEN permission='anonymous' THEN 'Anonymous Client' ELSE name END AS name, CASE WHEN permission='anonymous' THEN '' ELSE company END AS company,rating,quote FROM testimonials WHERE status='approved' AND permission IN ('yes','anonymous') ORDER BY reviewed_at DESC LIMIT 100").all();return json({testimonials:data.results||[]})}
 if(method==='POST'&&route==='login'){
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return json({error:'Admin credentials not configured'},503);
  const b=await request.json().catch(()=>({}));const user=String(b.username||''),pass=String(b.password||'');
  const userOk=equal(user,env.ADMIN_USERNAME||'impulzadmin');const passOk=equal(await hash(pass),await hash(env.ADMIN_PASSWORD));
  if(!userOk||!passOk)return json({error:'Incorrect credentials'},401);
  const exp=String(now()+8*3600000),sig=await sign(env.SESSION_SECRET,exp);
  const res=json({ok:true});res.headers.append('Set-Cookie',`impulz_session=${exp}.${sig}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);return res;
 }
 if(method==='POST'&&route==='logout'){const res=json({ok:true});res.headers.append('Set-Cookie','impulz_session=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return res}
 if(method==='GET'&&route==='invite'){const token=url.searchParams.get('token')||'';if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Invalid invitation'},404);const row=await env.DB.prepare('SELECT client_name,company,expires_at,used_at,revoked_at FROM invitations WHERE token_hash=?').bind(await hash(token)).first();if(!row||row.expires_at<now()||row.used_at||row.revoked_at)return json({error:'This invitation is invalid, expired or already used'},404);return json({client_name:row.client_name,company:row.company})}
 if(method==='POST'&&route==='submit'){
  const b=await request.json().catch(()=>({}));const token=String(b.token||''),name=String(b.name||'').trim(),company=String(b.company||'').trim(),quote=String(b.quote||'').trim(),rating=Number(b.rating),permission=String(b.permission||'');
  if(!/^[a-f0-9]{64}$/.test(token)||!name||name.length>100||company.length>120||quote.length<15||quote.length>2000||!Number.isInteger(rating)||rating<1||rating>5||!['yes','anonymous','no'].includes(permission))return json({error:'Please complete all required fields'},400);
  const tokenHash=await hash(token),row=await env.DB.prepare('SELECT id FROM invitations WHERE token_hash=? AND expires_at>? AND used_at IS NULL AND revoked_at IS NULL').bind(tokenHash,now()).first();
  if(!row)return json({error:'Invitation unavailable'},409);
  const id=uid(),ts=now();
  const result=await env.DB.batch([
   env.DB.prepare('UPDATE invitations SET used_at=? WHERE id=? AND used_at IS NULL AND revoked_at IS NULL AND expires_at>?').bind(ts,row.id,ts),
   env.DB.prepare('INSERT INTO testimonials (id,invitation_id,name,company,rating,quote,permission,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,row.id,name,company,rating,quote,permission,'pending',ts)
  ]).catch(()=>null);
  if(!result||result[0]?.meta?.changes!==1)return json({error:'Invitation already used. Contact IMPULZ for help.'},409);
  return json({ok:true});
 }
 if(!await authed(request,env))return json({error:'Please sign in'},401);
 if(method==='GET'&&route==='admin'){const [inv,rev]=await Promise.all([env.DB.prepare('SELECT id,client_name,company,expires_at,used_at,revoked_at,created_at FROM invitations ORDER BY created_at DESC LIMIT 100').all(),env.DB.prepare('SELECT id,name,company,rating,quote,permission,status,created_at FROM testimonials ORDER BY created_at DESC LIMIT 200').all()]);return json({invitations:inv.results||[],testimonials:rev.results||[]})}
 if(method==='POST'&&route==='admin/invite'){const b=await request.json().catch(()=>({}));const name=String(b.name||'').trim(),company=String(b.company||'').trim();if(!name||name.length>100||company.length>120)return json({error:'Enter a valid client name'},400);const token=hex(crypto.getRandomValues(new Uint8Array(32)));await env.DB.prepare('INSERT INTO invitations (id,token_hash,client_name,company,expires_at,created_at) VALUES (?,?,?,?,?,?)').bind(uid(),await hash(token),name,company,now()+30*86400000,now()).run();return json({url:url.origin+'/review.html?invite='+token})}
 if(method==='POST'&&route==='admin/status'){const b=await request.json().catch(()=>({}));if(!['approved','rejected','pending'].includes(b.status))return json({error:'Invalid status'},400);const result=await env.DB.prepare("UPDATE testimonials SET status=?,reviewed_at=? WHERE id=? AND (permission!='no' OR ?!='approved')").bind(b.status,now(),b.id,b.status).run();return json({ok:result.meta.changes>0})}
 if(method==='POST'&&route==='admin/revoke'){const b=await request.json().catch(()=>({}));await env.DB.prepare('UPDATE invitations SET revoked_at=? WHERE id=? AND used_at IS NULL').bind(now(),b.id).run();return json({ok:true})}
 return json({error:'Not found'},404);
}
export async function onRequest(context){try{if(context.request.method==='OPTIONS')return json({error:'Not allowed'},405);return await handle(context)}catch(e){console.error('Testimonial API error',e);return json({error:'Unable to process request'},500)}}
