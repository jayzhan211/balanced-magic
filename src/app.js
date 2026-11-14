// ===================== 小工具 =====================
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SUBD='₀₁₂₃₄₅₆₇₈₉';
const fsub=f=>f.replace(/([A-Za-z\)])(\d+)/g,(m,a,d)=>a+[...d].map(x=>SUBD[x]).join(''));
const nm=id=>IT[id][0], fm=id=>fsub(IT[id][1]);
const isRaw=id=>!!IT[id][4];
function parseGroup(s){const st=[{}];let i=0;while(i<s.length){const ch=s[i];
 if(ch==='('){st.push({});i++;continue}
 if(ch===')'){i++;let n='';while(/\d/.test(s[i]||''))n+=s[i++];const g=st.pop(),k=+(n||1);for(const e in g)st[st.length-1][e]=(st[st.length-1][e]||0)+g[e]*k;continue}
 const mm=s.slice(i).match(/^([A-Z][a-z]?)(\d*)/);i+=mm[0].length;st[st.length-1][mm[1]]=(st[st.length-1][mm[1]]||0)+ +(mm[2]||1)}
 return st[0]}
const PF={};
function atoms(id){if(PF[id])return PF[id];const t={};IT[id][1].split('·').forEach(p=>{const mm=p.match(/^(\d+)(.*)$/);const k=mm?+mm[1]:1;const g=parseGroup(mm?mm[2]:p);for(const e in g)t[e]=(t[e]||0)+g[e]*k});return PF[id]=t}
const gcd=(a,b)=>b?gcd(b,a%b):a;
const shuffle=(a,r=Math.random)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600)}
function confetti(){const e=['✨','⚗️','🧪','🌟','💧','🔥'];for(let i=0;i<18;i++){const s=document.createElement('div');s.className='conf';s.textContent=e[i%e.length];s.style.left=Math.random()*100+'vw';s.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),3000)}}
function ago(ts){const m=Math.round((Date.now()-ts)/6e4);if(m<1)return'剛剛';if(m<60)return m+' 分鐘前';const h=Math.round(m/60);if(h<24)return h+' 小時前';return Math.round(h/24)+' 天前'}
let TEST=false,TOFF=0,TCLOUD=false;try{TEST=localStorage.getItem('mb_test')==='1';TCLOUD=TEST&&localStorage.getItem('mb_tcloud')==='1';TOFF=TEST?+(localStorage.getItem('mb_toff')||0):0}catch(e){}
function todayStr(off=0){const d=new Date(Date.now()+8*36e5+(TOFF-off)*864e5);return d.toISOString().slice(0,10)}
const RXM={};RX.forEach(r=>RXM[r[0]]=r);
const BDM={};BD.forEach(b=>BDM[b[0]]=b);

// ===================== 身分（單字花園同款：連點標題 5 下切換） =====================
const NM={j:'傑',her:'彣'};
const HOME={j:'n',her:'s'};
let ROLE='her';try{ROLE=localStorage.getItem('mb_role')==='j'?'j':'her'}catch(e){}
const ME=()=>ROLE, PA=()=>ROLE==='j'?'her':'j';
const meN=()=>NM[ME()], paN=()=>NM[PA()];
const KEY=()=>(TEST?'mb_test_':'mb_save_')+ROLE;
// 存檔世代：換世代＝全部重新開始（舊的雲端資料、這台裝置上的正式進度都不再讀取）
const EPOCH='2026-11-14-start';
try{if(localStorage.getItem('mb_epoch')!==EPOCH){['mb_save_j','mb_save_her'].forEach(k=>localStorage.removeItem(k));localStorage.setItem('mb_epoch',EPOCH)}}catch(e){}

// ===================== 存檔 =====================
function defSave(){return{v:1,inv:{caco3:4,h2o:6,c:4,mal:2},rep:0,solved:{},miss:0,made:{},don:{},quiz:{},ev:[],out:[],claimed:[],daily:null,dhist:{},qst:[0,0],us:{},qwrong:[],qrecent:[],lastVisit:0,prevVisit:0,intro:false,svt:0,seenB:{},asks:[],replies:{},askSeen:{},nb:[],nn:{},nbSeen:0,role:'',rs:{},rsDay:{},focusA:[],pdOk:['',0],goalDay:'',work:{}}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY()));if(s&&s.v)return Object.assign(defSave(),s)}catch(e){}return defSave()}
let save=load();
function clean(){
 for(const k in save.inv){if(!IT[k]||!(save.inv[k]>0))delete save.inv[k]}
 for(const k in save.solved)if(!RXM[k])delete save.solved[k];
 for(const b in save.don){if(!BDM[b]){delete save.don[b];continue}for(const i in save.don[b])if(!IT[i])delete save.don[b][i]}
}
clean();
function _persist(){try{localStorage.setItem(KEY(),JSON.stringify(save))}catch(e){}}
function persist(){save.svt=Date.now();_persist();scheduleSync()}
const inv=id=>save.inv[id]||0;
function addInv(id,n){save.inv[id]=Math.max(0,inv(id)+n);if(!save.inv[id])delete save.inv[id]}
function pushEv(e){e.t=Date.now();save.ev.unshift(e);save.ev=save.ev.slice(0,24)}

// ===================== 夥伴（Firebase 同步；沒有 Firebase 時單機也能玩） =====================
let P=null; // 夥伴的公開資料
const SY={on:false,db:null,timer:null,last:'',st:'off',err:'',needLogin:false,user:null};
// 傑用 Google 登入（同單字花園）：彣不用登入，打開就是彣
const J_UID='f7hVLG34t7ayjacQSG2jPWiCn4A2'; // 傑第一次登入後，把帳號 UID 填在這裡＆ firestore.rules，就只認這個帳號
const isJUser=u=>!!u&&!u.isAnonymous&&(!J_UID||u.uid===J_UID);
const DOCP=()=>TCLOUD?PAIR+'T':PAIR;
function setSt(x,e){SY.st=x;if(e)SY.err=String(e).slice(0,120);const el=$('syncst');if(el)el.innerHTML=stIcon()}
function stIcon(){return{off:'📴',conn:'⏳',ok:'☁️',push:'⏳',err:'⚠️'}[SY.st]||'📴'}
function sanitize(d){
 if(!d||typeof d!=='object')return null;
 const n=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(+v||0)));
 const don={};if(d.don&&typeof d.don==='object')for(const b in d.don){if(!BDM[b]||typeof d.don[b]!=='object')continue;don[b]={};for(const i in d.don[b])if(IT[i])don[b][i]=n(d.don[b][i],0,9999)}
 const ev=(Array.isArray(d.ev)?d.ev:[]).slice(0,24).map(e=>({k:String(e.k||'').slice(0,8),t:n(e.t,0,9e15),b:BDM[e.b]?e.b:undefined,it:IT[e.it]?e.it:undefined,r:RXM[e.r]?e.r:undefined,a:APPM[e.a]?e.a:undefined,u:U2A[e.u]?e.u:undefined,n:n(e.n,0,9999),s:n(e.s,0,3)}));
 const out=(Array.isArray(d.out)?d.out:[]).slice(0,30).filter(g=>g&&IT[g.it]).map(g=>({id:String(g.id).slice(0,24),it:g.it,n:n(g.n,1,999),t:n(g.t,0,9e15)}));
 const dl=d.daily&&typeof d.daily==='object'?{d:String(d.daily.d||'').slice(0,10),ans:(Array.isArray(d.daily.ans)?d.daily.ans:[]).slice(0,3).map(x=>n(x,0,3)),ok:(Array.isArray(d.daily.ok)?d.daily.ok:[]).slice(0,3).map(Boolean)}:null;
 const dh={};if(d.dhist&&typeof d.dhist==='object')for(const k in d.dhist)if(/^\d{4}-\d\d-\d\d$/.test(k))dh[k]=n(d.dhist[k],0,3);
 const uc={};if(d.uc&&typeof d.uc==='object')for(const k in d.uc)if(U2A[k])uc[k]=n(d.uc[k],0,1e6);
 const clip=(x,L)=>String(x||'').slice(0,L);
 const ask=(Array.isArray(d.ask)?d.ask:[]).slice(0,12).filter(a=>a&&Array.isArray(a.o)&&a.o.length===4).map(a=>({id:clip(a.id,24),q:clip(a.q,700),o:a.o.map(x=>clip(x,120)),a:n(a.a,0,3),ex:clip(a.ex,600),t:U2A[a.t]?a.t:'',lv:n(a.lv,1,3),un:clip(a.un,8),ts:n(a.ts,0,9e15)}));
 const rp={};if(d.rep2&&typeof d.rep2==='object')for(const k in d.rep2){const r=d.rep2[k];if(r&&typeof r==='object')rp[clip(k,24)]={p:n(r.p,0,3),ok:!!r.ok,h:r.h==null?-1:n(r.h,-1,HINTS.length-1),ts:n(r.ts,0,9e15)}}
 const pd=Array.isArray(d.pd)?[clip(d.pd[0],10),n(d.pd[1],0,9999)]:['',0];
 const nb=(Array.isArray(d.nb)?d.nb:[]).slice(0,80).filter(a=>a&&Array.isArray(a.o)&&a.o.length===4).map(a=>({id:clip(a.id,24),q:clip(a.q,700),o:a.o.map(x=>clip(x,120)),a:n(a.a,0,3),ex:clip(a.ex,600),t:U2A[a.t]?a.t:'',lv:n(a.lv,1,3),un:clip(a.un,8),ts:n(a.ts,0,9e15)}));
 const nn={};if(d.nn&&typeof d.nn==='object')for(const k in d.nn){const x=d.nn[k];if(x&&typeof x==='object')nn[clip(k,24)]={txt:clip(x.txt,80),ts:n(x.ts,0,9e15)}}
 const rs={};if(d.rs&&typeof d.rs==='object')for(const k in d.rs)if(BDM[k])rs[k]=1;
 const fl=(Array.isArray(d.fl)?d.fl:[]).slice(0,60).filter(f=>f&&Array.isArray(f.o)).map(f=>({id:clip(f.id,24),q:clip(f.q,500),o:f.o.slice(0,4).map(x=>clip(x,120)),a:n(f.a,0,3),t:clip(f.t,12),why:clip(f.why,12),note:clip(f.note,120),ts:n(f.ts,0,9e15)}));
 return{fl,nb,nn,role:d.role==='sch'||d.role==='art'?d.role:'',rs,uc,ask,rep2:rp,pd,don,ev,out,daily:dl,dhist:dh,rep:n(d.rep,0,1e7),solved:n(d.solved,0,999),cards:n(d.cards,0,999),wname:String(d.wname||'').slice(0,12),ts:n(d.ts,0,9e15),claimed:(Array.isArray(d.claimed)?d.claimed:[]).slice(-60).map(x=>String(x).slice(0,24))};
}
function pub(){
 const dh={};Object.keys(save.dhist).sort().slice(-21).forEach(k=>dh[k]=save.dhist[k]);
 const uc={};for(const u in save.us)uc[u]=save.us[u][0];
 const rp={};Object.keys(save.replies).slice(-30).forEach(k=>rp[k]=save.replies[k]);
 return{ep:EPOCH,pv:3,fl:(save.fl||[]).slice(0,60),nb:save.nb.slice(0,80),nn:save.nn,role:myRole(),rs:save.rs,uc,ask:save.asks.slice(0,12),rep2:rp,pd:save.pdOk,don:save.don,ev:save.ev.slice(0,24),out:save.out.slice(0,30),daily:save.daily,dhist:dh,rep:save.rep,solved:Object.keys(save.solved).length,cards:Object.keys(save.quiz).length,claimed:save.claimed.slice(-60)};
}
function scheduleSync(){if(!SY.on)return;setSt('push');clearTimeout(SY.timer);SY.timer=setTimeout(pushMine,2000)}
async function pushMine(){
 if(!SY.on)return;clearTimeout(SY.timer);if(SY.needLogin){setSt('err','傑還沒用 Google 登入，進度不會上傳');return}
 if(SY.myCloud)adoptCloud(SY.myCloud);
 const p=pub(),sv=JSON.stringify(save),key=JSON.stringify(p)+sv;if(key===SY.last){setSt('ok');return}
 try{await SY.db.doc(`balance/${DOCP()}/players/${ME()}`).set({...p,sv,svt:save.svt||Date.now(),ts:Date.now()});SY.last=key;SY.okAt=Date.now();setSt('ok')}catch(e){console.warn('sync',e);setSt('err',e&&e.message||e)}
}
// ===== 雲端合併：本機和雲端的進度合在一起，只會多不會少 =====
const activity=x=>((x.qst||[0,0])[0]+(x.qst||[0,0])[1])+Object.keys(x.solved||{}).length*2+Object.values(x.don||{}).reduce((t,o)=>t+Object.values(o||{}).reduce((a,b)=>a+(+b||0),0),0);
const J=x=>JSON.parse(JSON.stringify(x));
function mergeSaves(L,C){
 if(!C||typeof C!=='object'||!C.v)return L;if(!L||!L.v)return Object.assign(defSave(),C);
 const aL=activity(L),aC=activity(C),base=(aC>aL||(aC===aL&&(+C.svt||0)>(+L.svt||0)))?C:L,oth=base===L?C:L;
 const o=J(Object.assign(defSave(),base)),mx=(a,b)=>Math.max(+a||0,+b||0);
 const uni=(a,b)=>Object.assign({},b||{},a||{});
 o.solved=uni(L.solved,C.solved);o.quiz=uni(L.quiz,C.quiz);o.rs=uni(L.rs,C.rs);o.tutSeen=uni(L.tutSeen,C.tutSeen);o.askSeen=uni(L.askSeen,C.askSeen);o.replies=uni(L.replies,C.replies);
 o.made={};for(const k of new Set([...Object.keys(L.made||{}),...Object.keys(C.made||{})]))o.made[k]=mx((L.made||{})[k],(C.made||{})[k]);
 o.don={};for(const b of new Set([...Object.keys(L.don||{}),...Object.keys(C.don||{})])){o.don[b]={};const x=(L.don||{})[b]||{},y=(C.don||{})[b]||{};for(const i of new Set([...Object.keys(x),...Object.keys(y)]))o.don[b][i]=mx(x[i],y[i])}
 o.us={};for(const u of new Set([...Object.keys(L.us||{}),...Object.keys(C.us||{})])){const x=(L.us||{})[u]||[0,0],y=(C.us||{})[u]||[0,0];o.us[u]=[mx(x[0],y[0]),mx(x[1],y[1])]}
 o.dhist={};for(const k of new Set([...Object.keys(L.dhist||{}),...Object.keys(C.dhist||{})]))o.dhist[k]=mx((L.dhist||{})[k],(C.dhist||{})[k]);
 o.qst=[mx((L.qst||[])[0],(C.qst||[])[0]),mx((L.qst||[])[1],(C.qst||[])[1])];
 for(const k of ['rep','miss','tut','nbSeen','svt','lastVisit'])o[k]=mx(L[k],C[k]);
 o.intro=!!(L.intro||C.intro);
 for(const k of ['goalDay'])o[k]=[L[k]||'',C[k]||''].sort().pop();
 o.work=uni(L.work,C.work);for(const k in o.work)o.work[k]=[(L.work||{})[k]||'',(C.work||{})[k]||''].sort().pop();
 for(const k of ['pdOk','pday']){const x=L[k]||['',0],y=C[k]||['',0];o[k]=x[0]===y[0]?[x[0],mx(x[1],y[1])]:(x[0]>y[0]?x:y)}
 const byId=(a,b,n)=>{const m={};[...(b||[]),...(a||[])].forEach(e=>{if(e&&e.id)m[e.id]=e});return Object.values(m).sort((p,q)=>(q.ts||q.t||0)-(p.ts||p.t||0)).slice(0,n)};
 o.nb=byId(L.nb,C.nb,80);o.fl=byId(L.fl,C.fl,60);o.out=byId(L.out,C.out,30);
 o.nn={};for(const k of new Set([...Object.keys(L.nn||{}),...Object.keys(C.nn||{})])){const x=(L.nn||{})[k],y=(C.nn||{})[k];o.nn[k]=!x?y:!y?x:((y.ts||0)>(x.ts||0)?y:x)}
 o.claimed=[...new Set([...(L.claimed||[]),...(C.claimed||[])])].slice(-80);
 const ev={};[...(L.ev||[]),...(C.ev||[])].forEach(e=>{if(e)ev[e.k+'|'+e.t]=e});o.ev=Object.values(ev).sort((p,q)=>q.t-p.t).slice(0,24);
 if(!o.role)o.role=oth.role||'';
 return o;
}
function adoptCloud(d){
 if(!d||typeof d.sv!=='string'||d.ep!==EPOCH)return false;let c;try{c=JSON.parse(d.sv)}catch(e){return false}if(!c||!c.v)return false;
 const before=JSON.stringify(save),a0=activity(save);const M=mergeSaves(save,c);if(JSON.stringify(M)===before)return false;
 save=M;clean();_persist();if(a0===0&&activity(save)>0)toast('☁️ 已從雲端找回你的進度');
 if(!$('modal').classList.contains('show'))render();else renderHead();return true;
}
async function restore(){
 try{const snap=await SY.db.doc(`balance/${DOCP()}/players/${ME()}`).get({source:'server'});if(snap.exists)adoptCloud(snap.data())}catch(e){console.warn('restore',e)}
}
function onPartner(raw){
 if(raw&&raw.ep!==EPOCH)raw=null;
 const prev=P;P=sanitize(raw);
 claimGifts();if(!prev){snapLv();claimWork()}else checkLv(false);checkGoal();
 if(prev&&P&&!document.hidden){const ne=P.ev.filter(e=>e.t>(prev.ev[0]?prev.ev[0].t:0));if(ne.length)toast(`${paN()}：${evText(ne[0],PA(),true)}`)}
 if(!$('modal').classList.contains('show'))render();else renderNav();
}
async function initSync(){
 if(TEST&&!TCLOUD){try{const fp=JSON.parse(localStorage.getItem('mb_testP_'+ROLE)||'null');if(fp){P=sanitize(fp);snapLv();render()}}catch(e){}return}
 const cfg=window.__FB_CONFIG;if(!cfg||!window.firebase){setSt('off');return}setSt('conn');
 try{firebase.initializeApp(cfg);const A=firebase.auth();
  try{await A.getRedirectResult()}catch(e){console.warn('redirect',e)}
  let u=await new Promise(res=>{const un=A.onAuthStateChanged(x=>{un();res(x)})});
  if(u&&!u.isAnonymous&&!isJUser(u)){await A.signOut();u=null;setTimeout(()=>toast('這個 Google 帳號不是傑的，已登出'),800)}
  if(!u){await A.signInAnonymously();u=A.currentUser}
  SY.user=u;
  if(isJUser(u)&&ROLE!=='j'&&!TCLOUD){try{localStorage.setItem('mb_role','j')}catch(e){}location.reload();return}
  SY.needLogin=ROLE==='j'&&!isJUser(u)&&!TCLOUD;
  SY.db=firebase.firestore();
  await restore();SY.on=true;
  SY.db.doc(`balance/${DOCP()}/players/${ME()}`).onSnapshot(x=>{if(x.metadata&&x.metadata.hasPendingWrites)return;SY.myCloud=x.exists?x.data():null;if(SY.myCloud)adoptCloud(SY.myCloud)},e=>console.warn('self',e));
  SY.db.doc(`balance/${DOCP()}/players/${PA()}`).onSnapshot(s=>{SY.pAt=Date.now();onPartner(s.exists?s.data():null)},e=>{console.warn('sync',e);setSt('err',e&&e.message||e)});
  pushMine();render();
 }catch(e){console.warn('sync init',e);setSt('err',e&&e.message||e)}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){save.lastVisit=Date.now();_persist();pushMine()}});
// 自動重試：失敗或斷網時，每 20 秒、恢復連線、回到畫面時都會自動再上傳一次
setInterval(()=>{if(SY.on&&(SY.st==='err'||SY.st==='push'))pushMine()},20000);
addEventListener('online',()=>{if(SY.on)pushMine()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&SY.on){SY.last='';pushMine()}});
addEventListener('pagehide',()=>{save.lastVisit=Date.now();_persist();pushMine()});

// ---- 送禮 ----
function claimGifts(){
 if(!P)return;let got=[];
 P.out.forEach(g=>{if(!save.claimed.includes(g.id)){save.claimed.push(g.id);addInv(g.it,g.n);got.push(g)}});
 if(got.length){save.claimed=save.claimed.slice(-80);persist();setTimeout(()=>{toast(`🎁 ${paN()}寄來了 ${got.map(g=>nm(g.it)+'×'+g.n).join('、')}`)},400)}
}
function sendGift(id,n){
 if(inv(id)<n||n<1)return;addInv(id,-n);
 const g={id:ME()+Date.now().toString(36),it:id,n,t:Date.now()};save.out.unshift(g);save.out=save.out.slice(0,30);
 pushEv({k:'gift',it:id,n});persist();toast(`📦 已寄出 ${nm(id)}×${n}，${paN()}下次上線就會收到`);
}

// ===================== 城鎮狀態 =====================
function donOf(src,b,i){return src&&src.don&&src.don[b]&&src.don[b][i]||0}
function prog(b){const need=BDM[b][4];let r={};for(const i in need){const a=donOf(save,b,i),p=donOf(P,b,i);r[i]={me:a,pa:p,need:need[i]}}return r}
function bDone(b){const p=prog(b);return Object.values(p).every(x=>x.me+x.pa>=x.need)}
function chDoneN(c){return BD.filter(b=>b[1]===c&&bDone(b[0])).length}
function chOpen(c){return true} // 四章一開始全部開放：想練哪一區就蓋哪一區
const curCh=()=>[4,3,2].find(chOpen)||1;
function bPct(b){const p=prog(b);let t=0,m=0,q=0;for(const i in p){t+=p[i].need;m+=Math.min(p[i].me,p[i].need);q+=Math.min(p[i].pa,Math.max(0,p[i].need-Math.min(p[i].me,p[i].need)))}return[m/t,q/t]}
const RANKS=[[0,'被召喚的學徒'],[40,'村裡的怪人'],[120,'工房主'],[260,'王都鍊金術師'],[450,'王室化學師'],[700,'賢者之塔的客人'],[1000,'異界的拉瓦節'],[1500,'森林學院的講師'],[2200,'異界的維勒']];
const rankOf=r=>RANKS.filter(x=>r>=x[0]).pop()[1];

// ===================== 事件文字 =====================
function evText(e,who,short){
 const b=e.b&&BDM[e.b],it=e.it&&IT[e.it];
 switch(e.k){
  case'don':return`把 ${it?nm(e.it):'?'}×${e.n} 送去「${b?b[3]:'?'}」`;
  case'build':return`完成了最後一塊磚——「${b?b[3]:'?'}」落成 ${b?b[2]:''}`;
  case'solve':return`第一次配平了 ${RXM[e.r]?eqText(RXM[e.r],true,true):'?'}`;
  case'gift':return`寄了 ${it?nm(e.it):'?'}×${e.n} 給${who===ME()?paN():meN()}`;
  case'alv':return`和${who===ME()?paN():meN()}一起把 ${APPM[e.a]?APPM[e.a].ic+APPM[e.a].nm:'?'} 教到了 Lv${e.n}${e.n>=GRAD?'（出師）':''}`;
  case'ask':return`請教了一題${e.u?'（'+e.u+'）':''}`;
  case'nb':return`收了一題進筆記本${e.u?'（'+e.u+'）':''}`;
  case'nn':return`在筆記本留了一則筆記`;
  case'rs':return`完成了研究課題，「${b?b[3]:'?'}」可以開工了 🔬`;
  case'reply':return`回覆了一題請教`;
  case'goal':return`今天和${who===ME()?paN():meN()}一起達成了每日目標 🎉`;
  case'card':return`解開了「${b?b[3]:'?'}」的原理卡`;
 }return'';
}

// ===================== 方程式 =====================
function eqText(r,bal=true,plain=false){
 const side=L=>L.map(([id,c])=>(bal&&c>1?(plain?c:`<span class="co">${c}</span>`):'')+fm(id)).join(' + ');
 return side(r[3])+(r[0]==='haber'||r[0]==='contact'?' ⇌ ':' → ')+side(r[4]);
}
function maxRuns(r){return Math.min(...r[3].map(([id,c])=>Math.floor(inv(id)/c)))}
function makers(id){return RX.filter(r=>chOpen(r[1])&&r[4].some(([x])=>x===id))}

// ===================== 畫面 =====================
let TAB='gather';
const TABS=[['gather','📝','練習'],['town','🏘️','小鎮'],['acad','🎓','學院'],['nbk','📒','筆記本'],['lab','⚗️','工房']];
function renderNav(){
 const aDot=0,nDot=nbNew()>0;
 $('nav').innerHTML=TABS.map(([k,ic,n])=>`<button class="${TAB===k?'on':''}" data-tab="${k}"><span>${ic}</span>${n}${k==='nbk'&&nDot?'<i class="dot"></i>':''}</button>`).join('');
 $('nav').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{TAB=b.dataset.tab;render();scrollTo(0,0)});
}
function renderHead(){
 $('subt').textContent=`${TEST?(TCLOUD?'☁️🧪雲端測試 · ':'🧪測試中 · '):''}${meN()}與${paN()}的小鎮 · ${BD.filter(b=>bDone(b[0])).length}/${BD.length} 棟`;
 const T=town();$('hstats').innerHTML=`<button data-a="sync" id="syncst" style="float:right;margin-left:6px;border:1px solid var(--line);background:var(--paper);border-radius:50%;width:30px;height:30px;font-size:14px;cursor:pointer">${stIcon()}</button><button data-a="help" style="float:right;margin-left:8px;border:1px solid var(--line);background:var(--paper);border-radius:50%;width:30px;height:30px;font-size:15px;cursor:pointer">❓</button><span style="white-space:nowrap">人口 <b>${T.pop}</b></span><br><span style="white-space:nowrap">今日 ${Math.min(teamToday(),GOAL)}/${GOAL}</span>`;bind($('hstats'));
}
function render(){if(TEST&&!$('tbadge')){const d=document.createElement('div');d.id='tbadge';d.innerHTML='🧪';d.title='測試工具';d.style.cssText='position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));width:44px;height:44px;border-radius:50%;background:#4a3412;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;z-index:20;box-shadow:0 3px 10px #0004;cursor:pointer';d.onclick=dbgPanel;document.body.appendChild(d)}renderHead();renderNav();if(TAB==='nbk'){setTimeout(()=>{if(nbNew()){save.nbSeen=Date.now();_persist();renderNav()}},800)}
 if(TAB==='acad'){save.tutSeen=save.tutSeen||{};if(!save.tutSeen.acad){save.tutSeen.acad=1;_persist()}}
 const h=(SY.needLogin?`<div class="banner" data-a="glogin" style="cursor:pointer;background:#fff3e6;border-color:#ffd59e">🔑 <b>這台裝置還沒登入，傑的進度不會存到雲端。點這裡用 Google 登入</b></div>`:'')+(['gather','town','acad','lab'].includes(TAB)?tutCard():'')+{town:vTown,lab:vLab,gather:vGather,acad:vAcademy,book:vBook,nbk:vNotebook}[TAB]();$('main').innerHTML=h;bind();
 $('foot').innerHTML=TAB==='book'?`<button data-a="help" style="margin-right:8px">📖 玩法介紹</button><button data-a="reset">${resetArm?'再按一次確認（只清除這台裝置與雲端上「你」的進度）':'重置我的進度'}</button>`:'';bind($('foot'))}

// ---- 城鎮 ----
function vTown(){
 let h='';
 const T=town();
 h+=townSVG();
 h+=`<div class="card"><div class="tagrow"><b style="font-family:'Noto Serif TC',serif;color:#6b4a1c">🏘️ 我們的小鎮</b><span class="small">人口 ${T.pop} · 心情 ${T.mood>.8?'😊':T.mood>.5?'🙂':T.mood>.3?'😐':'😟'}</span></div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:8px 0 4px;text-align:center">${NEEDS.map(([k,ic,l])=>`<div><div style="font-size:18px">${ic}</div><div style="height:34px;background:#eadfc6;border-radius:5px;position:relative;overflow:hidden;margin:2px 6px"><i style="position:absolute;left:0;right:0;bottom:0;height:${Math.round(T.sat[k]*100)}%;background:${T.sat[k]>.7?'var(--ok)':T.sat[k]>.35?'var(--gold2)':'var(--bad)'}"></i></div><div class="small">${l}</div></div>`).join('')}</div>
  <div class="small">鎮民心聲：${NEEDMSG[T.low]}${T.fix?`　→ 蓋「${T.fix[2]}${T.fix[3]}」會有幫助${unlocked(T.fix[0])?'':`（要先把 ${APPM[BX[T.fix[0]][0]].ic}${APPM[BX[T.fix[0]][0]].nm} 教到 Lv${BX[T.fix[0]][1]}）`}`:''}</div>
  <div style="margin-top:8px">${goalBar()}</div></div>`;
 if(P){const since=save.prevVisit||0,ne=P.ev.filter(e=>e.t>since).slice(0,4);
  if(ne.length)h+=`<div class="banner"><b>你不在的時候，${paN()}</b>：<br>${ne.map(e=>'・'+evText(e,PA())).join('<br>')}</div>`;}
 else h+=`<div class="banner small">${SY.on?`等${paN()}第一次來到這個世界……`:`（目前是單機模式：還沒連上${paN()}，進度只存在這台裝置）`}</div>`;
 [1,2,3,4].forEach(c=>{
  const list=BD.filter(b=>b[1]===c);
  if(!chOpen(c)){h+=`<div class="sec locked">🔒 ${CHN[c]}<small>上一章再完成 ${CHNEED[c]-chDoneN(c-1)} 棟建築就會開啟</small></div>`;return}
  h+=`<div class="sec">${CHN[c].split(' · ')[1]}<small>${chDoneN(c)}/${list.length}</small></div><div class="town">`;
  list.forEach(b=>{const d=bDone(b[0]),[m,q]=bPct(b[0]),ul=unlocked(b[0]);const can=ul&&!d&&Object.keys(b[4]).some(i=>inv(i)>0&&prog(b[0])[i].me+prog(b[0])[i].pa<b[4][i]);
   const qz=d&&!save.quiz[b[0]],x=BX[b[0]];
   h+=`<div class="bld ${d?'done':'wip'}" data-a="bld" data-v="${b[0]}" ${ul?'':'style="opacity:.55"'}>${can?'<span class="need">● 可捐</span>':''}${qz?'<span class="need">❓</span>':''}<div class="ic">${b[2]}</div><div class="nm">${b[3]}</div>${d?'<div class="small">落成</div>':ul?`<div class="bar"><i style="width:${(m+q)*100}%;background:linear-gradient(90deg,var(--me),var(--her))"></i></div>`:appLv(x[0])>=x[1]?`<div class="small">🔬 待研究</div>`:`<div class="small">🔒 ${APPM[x[0]].ic}${APPM[x[0]].nm} Lv${x[1]}</div>`}</div>`});
  h+=`</div>`;
 });
 // 動態
 const all=[...save.ev.map(e=>[e,ME()]),...(P?P.ev.map(e=>[e,PA()]):[])].sort((a,b)=>b[0].t-a[0].t).slice(0,12);
 if(all.length){h+=`<div class="sec">鎮上的消息</div><div class="card feed">${all.map(([e,w])=>`<div class="ev"><span class="${w===ME()?'who-me':'who-her'}">${NM[w]}</span><span>${evText(e,w)}</span><span class="t">${ago(e.t)}</span></div>`).join('')}</div>`}
 return h;
}
function openBld(id){
 const b=BDM[id],d=bDone(id),p=prog(id);
 let h=`<h3>${b[2]} ${b[3]}</h3><div class="muted">${b[5]}</div>`;
 const x=BX[id],ul=unlocked(id);
 h+=`<div class="small" style="margin-top:6px">對小鎮：${Object.entries(x[2]).map(([k,v])=>NEEDS.find(n=>n[0]===k)[1]+'+'+v).join(' ')}　·　需要 ${APPM[x[0]].ic}${APPM[x[0]].nm} Lv${x[1]}${ul?' ✓':`（目前 Lv${appLv(x[0])}）`}</div>`;
 if(appLv(x[0])>=x[1]&&!ul){modal(h+`<div class="ex">🔬 這棟需要先完成<b>研究課題</b>（3 題 ★★★，答對 2 題）。${myRole()==='sch'?'你是學者，可以開始研究。':`這是學者的工作${P&&P.role==='sch'?`，可以等${paN()}來做，或`:'，'}在學院把自己換成學者也行。`}</div>${myRole()==='sch'?`<button class="btn gold" data-a="rsgo" data-v="${id}">🔬 開始研究</button>`:''}<button class="btn ghost" data-a="close">關閉</button>`);return}
 if(!ul){modal(h+`<div class="ex">${APPM[x[0]].nm}還沒學到能蓋這棟的程度。再一起答對 ${ALV[x[1]-1]-appXP(x[0])} 題「${APPM[x[0]].tp}」就行了。</div><button class="btn gold" data-a="teach" data-v="${x[0]}">📝 去上${APPM[x[0]].nm}的課</button><button class="btn ghost" data-a="close">關閉</button>`);return}
 for(const i in p){const x=p[i],tot=x.me+x.pa,left=Math.max(0,x.need-tot);
  const a=Math.min(x.me,x.need),bb=Math.min(x.pa,x.need-a);
  h+=`<div class="need"><div class="lbl"><span>${nm(i)} <span class="small">${fm(i)}</span></span><span>${Math.min(tot,x.need)}/${x.need}</span></div><div class="bar"><i style="width:${(a+bb)/x.need*100}%;background:linear-gradient(90deg,var(--me),var(--her))"></i></div>`;
  if(!d&&left){const have=inv(i);
   h+=have?`<button class="btn gold" data-a="donate" data-v="${id}" data-i="${i}">捐出 ${Math.min(have,left)} 個（倉庫有 ${have}）</button>`
     :`<div class="small">倉庫裡沒有。${isRaw(i)?`去「練習」答題，獎勵會自動補這個原料（${SRC[IT[i][4]]}）`:makers(i).length?`工房做得出來：${makers(i).slice(0,3).map(r=>`<button class="chip" data-a="gorx" data-v="${r[0]}">${OPN[r[2]][1]} ${r[3].map(([x])=>nm(x)).join('+')}</button>`).join(' ')}`:'還沒學會怎麼做'}</div>`}
  h+=`</div>`}
 if(!d)h+=planHTML(id);
 if(d){
  h+=`<div class="plaque">🪧 ${NM.j} 與 ${NM.her} 一起蓋的</div>`;
  if(!save.quiz[id])h+=`<div class="ex" style="margin-top:10px">${b[5].split('：')[0]}還有一個問題想問你——答對就能拿到原理卡。</div><button class="btn gold" data-a="bquiz" data-v="${id}">回答「為什麼」</button>`;
  else h+=`<div class="card cardk" style="margin-top:10px"><h3>📘 ${b[7][0]}</h3><div class="small">${b[7][1]}</div></div>`;
 }
 h+=`<button class="btn ghost" data-a="close">關閉</button>`;
 modal(h);
}
function donate(id,i){
 const p=prog(id)[i],left=Math.max(0,p.need-p.me-p.pa),n=Math.min(inv(i),left);if(!n)return;
 const was=bDone(id);addInv(i,-n);save.don[id]=save.don[id]||{};save.don[id][i]=(save.don[id][i]||0)+n;save.rep+=n*2;
 pushEv({k:'don',b:id,it:i,n});
 if(!was&&bDone(id)){pushEv({k:'build',b:id});save.rep+=20;confetti();toast(`🎉「${BDM[id][3]}」落成了！`)}
 else toast(`已送出 ${nm(i)}×${n}`);
 persist();
 openBld(id);renderHead();
}
function bQuiz(id){
 const b=BDM[id],qz=b[6],opts=shuffle(qz.o);
 modal(`<h3>${b[2]} ${b[3]}</h3><div class="dq">${qz.q}</div>${opts.map(o=>`<button class="opt" data-a="bqa" data-v="${id}" data-o="${esc(o)}">${o}</button>`).join('')}<div id="qfb"></div>`);
}
function bQuizAns(id,o,btn){
 const b=BDM[id],qz=b[6],ok=o===qz.o[0];
 document.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.o===qz.o[0])x.classList.add('right')});
 if(!ok)btn.classList.add('wrong');
 let h=`<div class="ex">${ok?'<span class="ok">✓ 正確！</span> ':'<span class="bad">✗ 不太對。</span> '}${qz.ex}</div>`;
 if(ok){save.quiz[id]=1;save.rep+=10;pushEv({k:'card',b:id});persist();h+=`<div class="card cardk"><h3>📘 獲得原理卡：${b[7][0]}</h3><div class="small">${b[7][1]}</div></div><button class="btn gold" data-a="close">收下</button>`}
 else h+=`<button class="btn" data-a="bquiz" data-v="${id}">讀完了，再答一次</button>`;
 $('qfb').innerHTML=h;bind($('qfb'));
}

// ---- 工房 ----
function vLab(){
 let h='';
 const items=Object.keys(IT).filter(i=>inv(i)>0);
 h+=`<div class="sec">倉庫<small>點物質可以看說明、寄給${paN()}</small></div><div class="card"><div class="inv">${items.length?items.map(i=>`<span class="chip ${isRaw(i)?'raw':''}" data-a="item" data-v="${i}"><i class="sw" style="background:${IT[i][2]}"></i>${nm(i)}<b>${inv(i)}</b></span>`).join(''):'<span class="muted">空空的。去「採集」看看吧。</span>'}</div></div>`;
 [1,2,3,4].forEach(c=>{
  if(!chOpen(c))return;
  const list=RX.filter(r=>r[1]===c);
  h+=`<div class="sec">${CHN[c].split(' · ')[1]}的反應<small>已配平 ${list.filter(r=>save.solved[r[0]]).length}/${list.length}</small></div>`;
  list.sort((a,b)=>(maxRuns(b)>0)-(maxRuns(a)>0)).forEach(r=>{
   const s=!!save.solved[r[0]],m=maxRuns(r);
   const miss=r[3].filter(([id,c])=>inv(id)<c).map(([id,c])=>`${nm(id)}（${inv(id)}/${c}）`);
   h+=`<div class="card rx ${m?'':'no'}" data-a="rx" data-v="${r[0]}"><div class="tagrow"><span><span class="pill">${OPN[r[2]][1]} ${OPN[r[2]][0]}</span><span class="pill">${r[5]}</span></span>${s?'<span class="small">✓ 已配平</span>':'<span class="small" style="color:var(--her)">待配平</span>'}</div>
    <div class="eq">${s?eqText(r):unbal(r)}</div>${m?`<div class="can">材料足夠，可做 ${m} 次</div>`:`<div class="miss">還缺：${miss.join('、')}</div>`}</div>`;
  });
 });
 return h;
}
const unbal=r=>r[3].map(([id])=>`<span class="q">?</span>${fm(id)}`).join(' + ')+' → '+r[4].map(([id])=>`<span class="q">?</span>${fm(id)}`).join(' + ');
let BAL=null;
function openRx(id){const r=RXM[id];if(NOBAL[id]&&!save.solved[id]){save.solved[id]=1;persist();return openCraft(id,1,`<div class="ex">這個反應只數原子會有不只一組答案（C、H、O 三條式子裡有兩條其實是同一條），所以直接給你配平好的式子。</div>`)}if(!save.solved[id]){BAL={id,c:[...r[3],...r[4]].map(()=>1),tally:false,tries:0,msg:''};drawBal()}else openCraft(id,1)}
function tallyOf(r,c){const L={},R={};const n=r[3].length;[...r[3],...r[4]].forEach(([id],k)=>{const a=atoms(id),T=k<n?L:R;for(const e in a)T[e]=(T[e]||0)+a[e]*c[k]});return[L,R]}
function drawBal(){
 const r=RXM[BAL.id],n=r[3].length,sp=[...r[3],...r[4]];
 let eq='';sp.forEach(([id],k)=>{
  if(k===n)eq+=`<span class="arrow">→</span>`;else if(k)eq+=`<span class="plus">+</span>`;
  eq+=`<span class="sp"><span class="stp"><button data-a="cup" data-v="${k}">▲</button><b>${BAL.c[k]}</b><button data-a="cdn" data-v="${k}">▼</button></span><span class="f">${fm(id)}</span></span>`});
 let tb='';
 if(BAL.tally){const[L,R]=tallyOf(r,BAL.c),els=Object.keys(Object.assign({},L,R));
  tb=`<table class="tally"><tr><th></th>${els.map(e=>`<th>${e}</th>`).join('')}</tr><tr><th>左</th>${els.map(e=>`<td class="${L[e]===R[e]?'y':'n'}">${L[e]||0}</td>`).join('')}</tr><tr><th>右</th>${els.map(e=>`<td class="${L[e]===R[e]?'y':'n'}">${R[e]||0}</td>`).join('')}</tr></table>`}
 modal(`<h3>配平：${r[4].map(([i])=>nm(i)).join('、')}</h3><div class="small">${OPN[r[2]][1]} ${OPN[r[2]][0]}${CATALYST[r[0]]?'（'+CATALYST[r[0]]+'）':''}　·　調整係數，讓兩邊每種原子一樣多，而且是最簡整數比。</div>
 <div class="bal">${eq}</div>${tb}<div id="bmsg">${BAL.msg}</div>
 <button class="btn gold" data-a="bcheck">檢查</button><div class="row"><button class="btn" style="flex:1" data-a="btally">${BAL.tally?'隱藏原子計數':'💡 打開原子計數'}</button><button class="btn ghost" style="flex:1" data-a="close">先離開</button></div>`);
}
function balCheck(){
 const r=RXM[BAL.id],sp=[...r[3],...r[4]],want=sp.map(x=>x[1]);
 const[L,R]=tallyOf(r,BAL.c),els=Object.keys(Object.assign({},L,R)),off=els.filter(e=>L[e]!==R[e]);
 const g=BAL.c.reduce(gcd);
 if(!off.length&&g===1&&BAL.c.every((c,k)=>c===want[k])){
  const first=BAL.tries===0;save.solved[r[0]]=1;save.rep+=first?5:3;pushEv({k:'solve',r:r[0]});persist();
  toast(first?'一次就配平！聲望 +5':'配平成功！聲望 +3');
  openCraft(r[0],1,`<div class="ex"><span class="ok">✓ 配平了！</span> ${r[6]}</div>`);return}
 BAL.tries++;save.miss++;
 if(!off.length&&g>1)BAL.msg=`<div class="ex">原子都守恆了！但係數還能同除以 ${g}——要用<b>最簡整數比</b>。</div>`;
 else if(!off.length)BAL.msg=`<div class="ex">原子守恆了，但這不是這個反應實際的比例。</div>`;
 else{BAL.tally=true;BAL.msg=`<div class="ex"><span class="bad">還沒平衡：</span>${off.map(e=>`${e} 左邊 ${L[e]||0}、右邊 ${R[e]||0}`).join('；')}。${BAL.tries>=3?'<br>小技巧：先配只出現在兩種物質裡的元素，O 和 H 留到最後。':''}</div>`}
 persist();drawBal();
}
function openCraft(id,q,pre=''){
 const r=RXM[id],m=maxRuns(r);q=Math.max(1,Math.min(q,Math.max(1,m)));
 const line=(L,sign)=>L.map(([i,c])=>`${nm(i)} ${sign}${c*q}`).join('　');
 modal(`${pre}<h3>${OPN[r[2]][1]} ${r[4].map(([i])=>nm(i)).join('、')}</h3><div class="eq">${eqText(r)}</div>${CATALYST[r[0]]?`<div class="small">催化：${CATALYST[r[0]]}</div>`:''}
 <div class="small">${r[6]}</div>
 ${m?`<div class="qty"><button data-a="cq" data-v="${q-1}">−</button><b>${q}</b><button data-a="cq" data-v="${q+1}">＋</button><button class="btn" style="width:auto;margin:0;padding:6px 10px;font-size:13px" data-a="cq" data-v="${m}">最大 ${m}</button></div>
 <div class="ex">消耗：${line(r[3],'−')}<br>得到：${line(r[4],'＋')}</div><button class="btn gold" data-a="craft" data-v="${q}">開始反應 ×${q}</button>`
 :`<div class="ex">材料不夠：${r[3].map(([i,c])=>`${nm(i)} ${inv(i)}/${c}`).join('、')}</div>`}
 <button class="btn ghost" data-a="close">關閉</button>`);
 CRAFT=id;
}
let CRAFT=null;
function doCraft(rid,q){const r=RXM[rid];r[3].forEach(([i,c])=>addInv(i,-c*q));r[4].forEach(([i,c])=>addInv(i,c*q));const bonus=myRole()==='art'?q:0;if(bonus)addInv(r[4][0][0],bonus);
 const first=!save.made[r[0]];save.made[r[0]]=(save.made[r[0]]||0)+q;if(first)save.rep+=2;return bonus}
function craft(q){
 const r=RXM[CRAFT];if(maxRuns(r)<q)return;
 const bonus=doCraft(CRAFT,q);persist();
 toast(`${OPN[r[2]][1]} 得到 ${r[4].map(([i,c],k)=>nm(i)+'×'+(c*q+(k===0?bonus:0))).join('、')}${bonus?'（工匠加成）':''}`);
 openCraft(CRAFT,1);
}
function openItem(id){
 const it=IT[id];const uses=RX.filter(r=>chOpen(r[1])&&r[3].some(([x])=>x===id));const need=BD.filter(b=>chOpen(b[1])&&b[4][id]&&!bDone(b[0]));
 modal(`<h3><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${it[2]};border:1px solid #0002"></span> ${it[0]} <span class="small">${fm(id)}</span></h3>
 <div class="muted">${it[3]}</div><div class="small" style="margin-top:6px">倉庫：${inv(id)}${isRaw(id)?`　·　採集地：${SRC[it[4]]}`:''}</div>
 ${need.length?`<div class="small">鎮上需要：${need.map(b=>b[2]+b[3]).join('、')}</div>`:''}
 ${uses.length?`<div class="small">可用於：${uses.slice(0,4).map(r=>r[4].map(([x])=>nm(x)).join('、')).join('；')}</div>`:''}
 ${inv(id)?`<div class="sec" style="margin-top:12px">寄給${paN()}</div><div class="qty"><button data-a="gq" data-v="-1">−</button><b id="gn">1</b><button data-a="gq" data-v="1">＋</button></div><button class="btn gold" data-a="gift" data-v="${id}">📦 寄出</button>`:''}
 <button class="btn ghost" data-a="close">關閉</button>`);
}


// ---- 備料清單：缺的東西 → 依序要做哪些反應、還缺哪些原料 ----
function plan(bid){
 const v=Object.assign({},save.inv),steps=[],raw={};
 function need(id,n,d){if(n<=0)return;const have=v[id]||0,use=Math.min(have,n);v[id]=have-use;n-=use;if(n<=0)return;
  if(isRaw(id)||d>8||!BEST[id]){raw[id]=(raw[id]||0)+n;return}
  const r=BEST[id],out=r[4].find(x=>x[0]===id)[1],runs=Math.ceil(n/out);r[3].forEach(([i,c])=>need(i,c*runs,d+1));
  r[4].forEach(([o,m])=>v[o]=(v[o]||0)+m*runs);v[id]-=n;const last=steps[steps.length-1];if(last&&last[0]===r[0])last[1]+=runs;else steps.push([r[0],runs])}
 const p=prog(bid);for(const i in p){const left=p[i].need-p[i].me-p[i].pa;if(left>0)need(i,left,0)}
 const m=[];steps.forEach(([r,n])=>{const x=m.find(y=>y[0]===r);if(x)x[1]+=n;else m.push([r,n])});
 return{steps:m,raw};
}
function planHTML(bid){const{steps,raw}=plan(bid),rk=Object.keys(raw);
 if(!steps.length&&!rk.length)return`<div class="ex">✅ 材料都齊了，直接按上面的「捐出」。</div>`;
 let h=`<div class="card" style="background:#fffaf0;margin-top:10px"><b>🧾 備料清單</b>`;
 if(steps.length)h+=`<div class="small" style="margin:4px 0">依序要做的反應：</div>`+steps.map(([rid,n],k)=>{const r=RXM[rid],ok=!!save.solved[rid];return`<div class="small" style="margin:3px 0">${k+1}. ${OPN[r[2]][1]} ${r[3].map(([x])=>nm(x)).join(' + ')} → <b>${r[4].map(([x])=>nm(x)).join('、')}</b> ×${n} 次 ${ok?'<span class="ok">✓</span>':`<span class="bad">（要先配平）</span>`}</div>`}).join('');
 if(rk.length)h+=`<div class="small" style="margin-top:6px">還缺原料：${rk.map(i=>`<b>${nm(i)}</b> ×${raw[i]}`).join('、')}<br>→ 去「練習」答題，獎勵會優先補這些。</div>`;
 if(steps.length)h+=`<button class="btn gold" data-a="autocraft" data-v="${bid}">⚡ 照順序做（能做多少做多少）</button>`;
 return h+`</div>`}
function autoCraft(bid){
 const{steps}=plan(bid);const done=[];
 for(const[rid,n]of steps){const r=RXM[rid];
  if(!save.solved[rid]&&!NOBAL[rid]){persist();if(done.length)toast('已做：'+done.join('、'));BAL={id:rid,c:[...r[3],...r[4]].map(()=>1),tally:false,tries:0,msg:`<div class="ex">備料做到這一步，需要先配平這個反應。配平後再回建築按一次「照順序做」。</div>`};return drawBal()}
  if(NOBAL[rid])save.solved[rid]=1;
  const q=Math.min(n,maxRuns(r));if(q<=0)break;doCraft(rid,q);done.push(`${r[4].map(([x])=>nm(x))[0]}×${q}`);if(q<n)break}
 persist();toast(done.length?'⚡ 做好了：'+done.join('、'):'原料不夠，先去練習補原料吧');openBld(bid)}

// ---- 練習（主畫面）：選範圍 → 一題接一題 → 答對的獎勵自動換成鎮上最缺的原料 ----
let PQ=null;
// 每種物質用最少原料做出來的路線（預先算好）
const COST={},BEST={};
(function(){Object.keys(IT).forEach(i=>COST[i]=isRaw(i)?1:1e9);let ch=true,k=0;
 while(ch&&k++<50){ch=false;RX.forEach(r=>{if(NOBAL[r[0]]&&false)return;const c=r[3].reduce((t,[i,n])=>t+COST[i]*n,0);r[4].forEach(([o,m])=>{const v=c/m;if(v<COST[o]-1e-9){COST[o]=v;BEST[o]=r;ch=true}})})}})();
function rawNeeds(){ // 未完成建築缺的東西，展開成原料
 const need={};
 const add=(id,n,d)=>{if(n<=0||d>8)return;const have=inv(id);if(isRaw(id)){need[id]=(need[id]||0)+n;return}
  const r=BEST[id];if(!r)return;const out=r[4].find(x=>x[0]===id)[1],runs=Math.ceil(n/out);r[3].forEach(([i,c])=>add(i,Math.max(0,c*runs-(d===0?0:inv(i))),d+1))};
 BD.filter(b=>!bDone(b[0])&&unlocked(b[0])).sort((x,y)=>(bPct(y[0])[0]+bPct(y[0])[1])-(bPct(x[0])[0]+bPct(x[0])[1])||x[1]-y[1]).slice(0,3).forEach(b=>{const p=prog(b[0]);for(const i in p){const left=p[i].need-p[i].me-p[i].pa-inv(i);if(left>0)add(i,left,0)}});
 return need;
}
function rewardItem(){const need=rawNeeds(),ks=Object.keys(need).filter(i=>need[i]>inv(i));const pool=ks.length?ks:Object.keys(IT).filter(isRaw);
 // 自己地盤的原料優先一點
 const w=pool.map(i=>(ks.length?need[i]-inv(i):1)*(IT[i][4]===HOME[ME()]||IT[i][4]==='b'?1.5:1));let t=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){t-=w[i];if(t<=0)return pool[i]}return pool[0]}
function forWhat(id){const b=BD.filter(b=>!bDone(b[0])).find(b=>Object.keys(b[4]).some(i=>i===id||JSON.stringify(rawOf(i)).includes('"'+id+'"')));return b?b[3]:null}
function rawOf(id,d=0){if(isRaw(id)||d>8||!BEST[id])return[id];return BEST[id][3].flatMap(([i])=>rawOf(i,d+1))}
function scopeUnits(){const f=(save.focusA||[]).filter(a=>APPM[a]);return f.length?f.flatMap(a=>APPM[a].u):ALLU()}
function scopeLabel(){const f=(save.focusA||[]).filter(a=>APPM[a]);if(!f.length)return'弱點優先（全部學徒）';return f.map(a=>APPM[a].ic+APPM[a].nm).join('、')}
let SCOPE_OPEN=false;
function newPQ(){const p=pickQ();let Q;
 if(p.nbe){const e=p.nbe;Q={q:rich(e.q),o:e.o.map(rich),ex:rich(e.ex),t:e.t,lv:e.lv,un:e.un,qi:-1,nb:1};PQ={Q,right:Q.o[e.a],opts:shuffle(Q.o),done:false,nbd:true};return}
 if(p.gen)Q={q:p.gen.q,o:p.gen.o,ex:p.gen.ex,t:p.gen.t,lv:p.gen.lv,un:p.gen.u,qi:-1};else{const q=QB[p.bank];Q={q:q[0],o:q[1],ex:q[2],t:q[3],lv:q[4],un:'',qi:p.bank}}
 PQ={Q,right:Q.o[0],opts:shuffle(Q.o),done:false}}
function chipA(a){const on=(save.focusA||[]).includes(a.id);return`<span class="chip ${on?'':'zero'}" style="${on?'border-color:var(--gold);background:#fbefd3':''}" data-a="fa" data-v="${a.id}">${a.ic} ${a.nm}<b style="font-weight:400;font-size:11px">${a.tp} · Lv${appLv(a.id)}</b></span>`}
function vGather(){
 let h=`<div class="card"><div class="tagrow"><span><b>今天上誰的課？</b>　<span class="small">${scopeLabel()}</span></span><button class="btn" style="width:auto;margin:0;padding:4px 10px;font-size:13px" data-a="scope">${SCOPE_OPEN?'收起':'更改'}</button></div>`;
 if(SCOPE_OPEN){h+=`<div class="row" style="margin-top:8px"><button class="btn" style="flex:1;margin:0;padding:7px" data-a="fset" data-v="auto">弱點優先</button><button class="btn" style="flex:1;margin:0;padding:7px" data-a="fset" data-v="g">普化學徒</button><button class="btn" style="flex:1;margin:0;padding:7px" data-a="fset" data-v="o">有機學徒</button></div>
  <div class="small" style="margin:10px 0 4px">或勾選想教的學徒（每位負責幾個單元）</div><div class="inv">${APP.map(chipA).join('')}</div>`}
 h+=`<div style="margin-top:8px">${goalBar()}</div></div>`;
 const nw=nbNew();if(nw)h+=`<div class="banner" data-a="tab" data-v="nbk" style="cursor:pointer">📒 筆記本有 ${nw} 則${paN()}新寫的東西 →</div>`;
 if(!PQ)newPQ();const Q=PQ.Q,ap=APPM[U2A[Q.t]];
 h+=`<div class="card"><div class="small">${ap?`${ap.ic} ${ap.nm}的課　`:''}<span class="pill">${Q.t}</span><span class="pill">${'★'.repeat(Q.lv)}</span>${Q.qi>=0&&save.qwrong.includes(Q.qi)&&!PQ.done?'<span class="pill her">錯題複習</span>':''}${Q.nb?'<span class="pill her">📒 筆記本</span>':''}</div><div class="dq">${Q.q}</div>
  ${PQ.opts.map((o,k)=>`<button class="opt ${PQ.done?(o===PQ.right?'right':k===PQ.pick?'wrong':''):''}" data-a="pans" data-v="${k}" ${PQ.done?'disabled':''}>${o} ${Q.un}</button>`).join('')}`;
 if(PQ.done)h+=`<div class="ex">${PQ.ok?'<span class="ok">✓ 答對了！</span>':'<span class="bad">✗ 答錯了。</span>'} ${Q.ex}</div><div class="small" style="text-align:center">${PQ.rw}</div>
  <div class="row"><button class="btn gold" style="flex:2" data-a="pnext">下一題 →</button><button class="btn" style="flex:1" data-a="flag" ${PQ.flg?'disabled':''}>${PQ.flg?'已回報':'🚩 回報'}</button><button class="btn" style="flex:1" data-a="nbadd" ${PQ.nbd?'disabled':''}>${PQ.nbd?'已收 📒':'📒 收藏'}</button></div>`;
 h+=`</div><div class="small">今天你答了 ${(save.pday&&save.pday[0]===todayStr())?save.pday[1]:0} 題${save.qwrong.length?` · 錯題本 ${save.qwrong.length} 題（會再出現）`:''}<br>題目難度會跟著你自己的答對率調整，兩個人各自是各自的程度；不論誰答對，學徒都一樣長大。覺得有意思、容易錯的題目，按「📒 收藏」，兩個人都看得到，也可以在下面留筆記。</div>`;
 return h;
}
function pAns(k){
 if(!PQ||PQ.done)return;const Q=PQ.Q,ok=PQ.opts[k]===PQ.right;PQ.done=true;PQ.pick=k;PQ.ok=ok;
 const it=rewardItem(),home=IT[it][4]==='b'||IT[it][4]===HOME[ME()];
 let n=ok?(home?3:2)+(Q.lv>=3?1:0):1;if(ok&&myRole()==='art')n*=2;addInv(it,n);
 save.qst[ok?0:1]++;if(ok)save.rep+=Q.lv;recStat(Q.t,ok,Q.lv);if(ok&&myRole()==='sch'&&Q.lv>=2){const x=save.us[Q.t];x[0]++}
 const td=todayStr();save.pday=save.pday&&save.pday[0]===td?[td,save.pday[1]+1]:[td,1];if(ok)save.pdOk=save.pdOk[0]===td?[td,save.pdOk[1]+1]:[td,1];
 if(Q.qi>=0){save.qrecent.push(Q.qi);save.qrecent=save.qrecent.slice(-60);
  if(ok)save.qwrong=save.qwrong.filter(x=>x!==Q.qi);else if(!save.qwrong.includes(Q.qi))save.qwrong.push(Q.qi);}
 const fw=forWhat(it),ap=APPM[U2A[Q.t]];PQ.rw=`${ok&&ap?`${ap.ic}${ap.nm} 經驗 +${myRole()==='sch'&&Q.lv>=2?2:1}　·　`:''}獲得 ${nm(it)} ×${n}${fw?`（蓋「${fw}」用得到）`:''}`;
 persist();checkLv();checkGoal();render();
}
function uStat(u){return save.us[u]||[0,0]}
// 適性難度：每個單元一個難度分數（1.0–3.4，起始 2.0）。
// 答對 +0.12、答錯 −0.28 → 長期會停在答對率約 70% 的難度：不會太容易，也不會太難。
// 答比目前程度簡單的題，答對只加一點；答比較難的題答錯，只扣一點。
const TARGET=.7,UP=.12,DOWN=UP*TARGET/(1-TARGET);
function recStat(u,ok,lv){if(!u)return;save.uh=save.uh||{};(save.uh[u]=save.uh[u]||[]).push(ok?1:0);save.uh[u]=save.uh[u].slice(-10);const x=save.us[u]||[0,0];x[ok?0:1]++;save.us[u]=x;
 save.ur=save.ur||{};let r=save.ur[u]??2;const cur=Math.round(r),d=(lv||cur)-cur;
 r+=ok?UP*(d<0?.4:d>0?1.6:1):-DOWN*(d>0?.4:d<0?1.6:1);save.ur[u]=Math.max(1,Math.min(3.4,r))}
const uRating=u=>(save.ur&&save.ur[u])??2;
function lvFor(u){return Math.max(1,Math.min(3,Math.round(uRating(u))))}
function recentAcc(u){const h=(save.uh||{})[u]||[];return h.length?h.filter(Boolean).length/h.length:null}
const ALLU=()=>[...UNITS_G,...UNITS_O];
function pickQ(){
 {const nbq=nbAll().filter(e=>scopeUnits().includes(e.t)&&!(save.nbRecent||[]).includes(e.id));if(nbq.length&&Math.random()<.15){const e=nbq[Math.floor(Math.random()*nbq.length)];save.nbRecent=[...(save.nbRecent||[]),e.id].slice(-15);return{nbe:e}}}
 {const wr=save.qwrong.filter(i=>QB[i]&&scopeUnits().includes(QB[i][3]));if(wr.length&&Math.random()<.25)return{bank:wr[Math.floor(Math.random()*wr.length)]}}
 const us=scopeUnits(),w=us.map(u=>{const[a,b]=uStat(u),n=a+b;return 1+(n?2.5*b/n:0)+(n<3?.6:0)+(UNITS_G.includes(u)?.3:0)});
 let t=Math.random()*w.reduce((x,y)=>x+y,0),u=us[0];for(let i=0;i<us.length;i++){t-=w[i];if(t<=0){u=us[i];break}}
 const L=lvFor(u);
 const gens=GEN.filter(g=>g.u===u&&Math.abs(g.l-L)<=1);
 let bank=QB.map((q,i)=>i).filter(i=>QB[i][3]===u&&Math.abs(QB[i][4]-L)<=1&&QB[i][4]<=L+(uRating(u)-L>.3?1:0)&&!save.qrecent.includes(i));
 if(!bank.length)bank=QB.map((q,i)=>i).filter(i=>QB[i][3]===u&&!save.qrecent.includes(i));
 if(gens.length&&(!bank.length||Math.random()<.4)){const g=gens.filter(x=>x.l===L).length&&Math.random()<.8?gens.filter(x=>x.l===L):gens;return{gen:genQ(g[Math.floor(Math.random()*g.length)],Math.random)}}
 if(!bank.length)return{bank:Math.floor(Math.random()*QB.length)};
 const top=bank.filter(i=>QB[i][4]===L);const c=top.length&&Math.random()<.8?top:bank;return{bank:c[Math.floor(Math.random()*c.length)]};
}
// ---- 每日告示（兩人同一題，按日期決定） ----
function seedRng(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}let a=h>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dailyQs(d){const r=seedRng(d+'#balance');const gs=shuffle(GEN.filter(g=>g.l>=2),r).slice(0,2).map(g=>genQ(g,r));
 const org=+d.slice(-2)%2===1;let pool=QB.map((q,i)=>i).filter(i=>QB[i][4]>=2&&(QB[i][3].startsWith('有機')||QB[i][3]==='光譜')===org);const qi=pool[Math.floor(r()*pool.length)],q=QB[qi];
 const qs=[...gs,{q:q[0],o:q[1].slice(),ex:q[2],t:q[3],u:'',lv:q[4]}];
 return qs.map(g=>{const right=g.o[0];g.o=shuffle(g.o,r);g.a=g.o.indexOf(right);return g})}
let DQ=null;
function vDaily(){
 const d=todayStr(),qs=dailyQs(d),mine=save.daily&&save.daily.d===d?save.daily:null,his=P&&P.daily&&P.daily.d===d?P.daily:null;
 let h=`<div class="sec">鎮公所告示<small>${d.slice(5).replace('-','/')}</small></div><div class="small" style="margin:-4px 2px 8px">每天三題，${meN()}和${paN()}的題目一模一樣。</div>`;
 if(!mine||mine.ans.length<3){
  const k=mine?mine.ans.length:0,g=qs[k];
  h+=`<div class="card"><div class="small">第 ${k+1}/3 題　<span class="pill">${g.t}</span><span class="pill">${'★'.repeat(g.lv||2)}</span></div><div class="dq">${g.q}</div>${g.o.map((o,j)=>`<button class="opt" data-a="dans" data-v="${j}">${o} ${g.u}</button>`).join('')}<div id="qfb"></div></div>`;
  h+=`<div class="small">${his?`${paN()}今天已經做完了（做完才看得到${paN()}的答案）`:`${paN()}今天還沒做`}</div>`;
 } else {
  const sc=mine.ok.filter(Boolean).length,hs=his?his.ok.filter(Boolean).length:null;
  h+=`<div class="vs"><div class="p me">${meN()}<b>${sc}/3</b></div><div class="p her">${paN()}<b>${hs===null?'…':hs+'/3'}</b></div></div>`;
  qs.forEach((g,k)=>{h+=`<div class="card"><div class="small">第 ${k+1} 題　<span class="pill">${g.t}</span></div><div class="dq">${g.q}</div>
   <div>正解：<b>${g.o[g.a]} ${g.u}</b></div><div class="small">${meN()}：${mine.ok[k]?'✓':'✗ '+g.o[mine.ans[k]]}${his?`　·　${paN()}：${his.ok[k]?'✓':'✗ '+g.o[his.ans[k]]}`:''}</div><div class="ex">${g.ex}</div></div>`});
  if(!his)h+=`<div class="small">${paN()}做完後，這裡會顯示${paN()}每一題的答案。</div>`;
 }
 // 戰績
 const days=[...Array(7)].map((_,i)=>todayStr(6-i));
 const ph=P?P.dhist:{};
 h+=`<div class="sec">這週戰績</div><div class="card"><table class="hist" style="width:100%"><tr><td></td>${days.map(x=>`<td class="small">${x.slice(5).replace('-','/')}</td>`).join('')}</tr>
  <tr><td class="who-me">${meN()}</td>${days.map(x=>`<td>${save.dhist[x]??'·'}</td>`).join('')}</tr><tr><td class="who-her">${paN()}</td>${days.map(x=>`<td>${ph[x]??'·'}</td>`).join('')}</tr></table>
  <div class="small" style="text-align:center;margin-top:4px">本週合計　${meN()} ${days.reduce((s,x)=>s+(save.dhist[x]||0),0)}　：　${days.reduce((s,x)=>s+(ph[x]||0),0)} ${paN()}</div></div>`;
 return h;
}
function dAns(j,btn){
 const d=todayStr(),qs=dailyQs(d);if(!save.daily||save.daily.d!==d)save.daily={d,ans:[],ok:[]};
 const k=save.daily.ans.length;if(k>=3)return;const g=qs[k],ok=j===g.a;
 save.daily.ans.push(j);save.daily.ok.push(ok);if(ok)save.rep+=5;recStat(g.t,ok,g.lv);
 document.querySelectorAll('.opt').forEach((x,i)=>{x.disabled=true;if(i===g.a)x.classList.add('right')});if(!ok)btn.classList.add('wrong');
 const done=save.daily.ans.length===3;
 if(done){const s=save.daily.ok.filter(Boolean).length;save.dhist[d]=s;pushEv({k:'daily',s});if(s===3){save.rep+=5}}
 persist();
 $('qfb').innerHTML=`<div class="ex">${ok?'<span class="ok">✓ 正確</span>':'<span class="bad">✗ 錯了</span>'}　${g.ex}</div><button class="btn gold" data-a="dnext">${done?'看今天的結果':'下一題'}</button>`;bind($('qfb'));
 if(done&&save.daily.ok.every(Boolean))confetti();
}

// ---- 筆記 ----
let resetArm=false;
function unitRows(list){return list.map(u=>{const[a,b]=uStat(u),n=a+b,ra=recentAcc(u),acc=ra??(n?a/n:0);return[u,a,n,acc]}).sort((x,y)=>(x[2]?x[3]:2)-(y[2]?y[3]:2)).map(([u,a,n,acc])=>`<tr><td style="text-align:left">${u}</td><td>${n?a+'/'+n:'·'}</td><td style="width:40%"><div class="bar" style="height:7px;border-radius:4px;background:#eadfc6;overflow:hidden"><i style="display:block;height:100%;width:${acc*100}%;background:${acc>=.75?'var(--ok)':acc>=.5?'var(--gold2)':'var(--bad)'}"></i></div></td><td>${'★'.repeat(lvFor(u))}</td></tr>`).join('')}
function vBook(){
 let h=`<div class="sec">單元答對率<small>只有你自己看得到；最弱的排在最上面，出題時會多出這些單元</small></div><div class="card"><div class="small" style="margin-bottom:4px">普通化學</div><table class="hist" style="width:100%">${unitRows(UNITS_G)}</table><div class="small" style="margin:8px 0 4px">有機化學</div><table class="hist" style="width:100%">${unitRows(UNITS_O)}</table><div class="small" style="margin-top:6px">長條是最近 10 題的答對率；★ 是這個單元目前的出題難度。每答一題都會微調，目標是讓答對率停在 70% 左右：連續答對就升級，答不出來就降級。</div></div>`;
 const fls=flagList();
 h+=`<div class="sec">🚩 題目回報清單<small>${fls.length} 題（兩人合併）</small></div>`+(fls.length?`<div class="card small">${fls.slice(0,8).map(f=>`<div style="margin-bottom:6px">【${f.t}】${esc(f.why||'')} ${esc(f.note||'')}<br><span style="color:var(--dim)">${esc(f.q.slice(0,60))}…</span></div>`).join('')}<button class="btn gold" data-a="flagcopy">📋 全部複製（貼給 Claude 修）</button><textarea id="flbox" style="display:none;width:100%;height:140px;margin-top:6px;font-size:12px">${esc(flagText())}</textarea></div>`:`<div class="muted" style="margin-bottom:8px">練習時遇到有問題的題目，按「🚩 題目有問題」就會記在這裡。</div>`);
 h+=`<div class="sec">原理卡<small>${Object.keys(save.quiz).length}/${BD.length}</small></div>`;
 const cs=BD.filter(b=>save.quiz[b[0]]);
 h+=cs.length?cs.map(b=>`<div class="card cardk"><h3>📘 ${b[7][0]}</h3><div class="small">${b[2]} ${b[3]}　·　${b[7][1]}</div></div>`).join(''):`<div class="muted">建築落成後，回答委託人的「為什麼」就能拿到原理卡。</div>`;
 const sol=RX.filter(r=>save.solved[r[0]]);
 h+=`<div class="sec">配平過的方程式<small>${sol.length}/${RX.length}</small></div>`;
 h+=sol.map(r=>`<div class="card"><span class="pill">${r[5]}</span><div class="eq">${eqText(r)}</div><div class="small">${r[6]}</div></div>`).join('')||'<div class="muted">還沒有。</div>';
 h+=`<div class="sec">統計</div><div class="card small">練習：答對 ${save.qst[0]}、答錯 ${save.qst[1]}<br>配平失誤：${save.miss} 次</div>`;
 return h;
}


// ===================== 合作：學徒、小鎮、請教、每日共同目標 =====================
const ucOf=(src,u)=>src===save?uStat(u)[0]:(P&&P.uc[u])||0;
function appXP(a){return APPM[a].u.reduce((t,u)=>t+ucOf(save,u)+ucOf(P,u),0)}
function appLv(a){const x=appXP(a);let l=1;ALV.forEach((v,i)=>{if(x>=v)l=i+1});return l}
function unlocked(b){const x=BX[b];return!x||(appLv(x[0])>=x[1]&&(x[1]<3||rsDone(b)))}
const rsDone=b=>!!(save.rs[b]||(P&&P.rs[b]));
function town(){
 const built=BD.filter(b=>bDone(b[0]));const have={};NEEDS.forEach(([k])=>have[k]=0);
 built.forEach(b=>{const e=(BX[b[0]]||[0,0,{}])[2];for(const k in e)have[k]+=e[k]});
 const pop=30+built.length*12+have['居']*10,dem=1+pop/70;
 const sat={};NEEDS.forEach(([k])=>sat[k]=Math.min(1,have[k]/dem));
 const mood=NEEDS.reduce((t,[k])=>t+sat[k],0)/NEEDS.length;
 const low=NEEDS.map(([k])=>k).sort((a,b)=>sat[a]-sat[b])[0];
 const fix=BD.filter(b=>!bDone(b[0])&&BX[b[0]]&&BX[b[0]][2][low]).sort((x,y)=>(unlocked(y[0])-unlocked(x[0]))||(BX[x[0]][1]-BX[y[0]][1]))[0];
 return{built:built.length,pop,sat,mood,low,fix};
}
// ---- 每日共同目標 ----
function todayOk(src){const d=src===save?save.pdOk:(P&&P.pd);return d&&d[0]===todayStr()?d[1]:0}
const teamToday=()=>todayOk(save)+todayOk(P);
function checkGoal(){
 if(save.goalDay===todayStr()||teamToday()<GOAL)return;
 save.goalDay=todayStr();const got={};for(let i=0;i<3;i++){const it=rewardItem();got[it]=(got[it]||0)+2;addInv(it,2)}
 pushEv({k:'goal'});persist();confetti();
 setTimeout(()=>toast(`🎉 今天一起答對 ${GOAL} 題！鎮民送來 ${Object.keys(got).map(i=>nm(i)+'×'+got[i]).join('、')}`),300);
}
function goalBar(){const t=teamToday(),m=todayOk(save),pc=Math.min(1,t/GOAL);
 return`<div class="need" style="margin:2px 0"><div class="lbl"><span>今天一起答對</span><span>${Math.min(t,GOAL)}/${GOAL}${t>=GOAL?' ✓':''}</span></div><div class="bar"><i style="width:${pc*100}%;background:linear-gradient(90deg,var(--me),var(--her))"></i></div></div>`}
// ---- 出師的學徒每天寄回材料（離線也在工作） ----
function claimWork(){
 const td=todayStr(),msgs=[];
 APP.forEach(a=>{if(appLv(a.id)>=GRAD&&save.work[a.id]!==td){save.work[a.id]=td;const it=rewardItem();addInv(it,3);msgs.push(`${a.ic}${a.nm}寄回 ${nm(it)}×3`)}});
 if(msgs.length){persist();setTimeout(()=>toast('🎓 '+msgs.join('、')),800)}
}
// ---- 學徒升級提示 ----
let LV0={};
function snapLv(){APP.forEach(a=>LV0[a.id]=appLv(a.id))}
function checkLv(own=true){APP.forEach(a=>{const l=appLv(a.id);if(LV0[a.id]&&l>LV0[a.id]){if(own){pushEv({k:'alv',a:a.id,n:l});persist()}confetti();for(let k=LV0[a.id]+1;k<=l;k++)LVQ.push([a.id,k])}LV0[a.id]=l});if(LVQ.length&&!$('modal').classList.contains('show'))setTimeout(showLvQ,400)}
let LVQ=[];
function showLvQ(){if(!LVQ.length||$('modal').classList.contains('show'))return;const[id,l]=LVQ.shift(),a=APPM[id],grad=l===GRAD;
 modal(`<div style="text-align:center"><div style="font-size:64px;line-height:1.1">${a.ic}<span style="font-size:30px">${BADGE(l)}</span></div><h3>${grad?'🎓 畢業典禮':'🎉 升級了'}：${a.nm} Lv${l}</h3></div>
 <div class="ex" style="font-size:15px">${STORY[id][l-1]}</div>${grad?`<div class="plaque" style="display:block;text-align:center;font-size:14px">📜 畢業證書<br>${a.nm}　${a.tp}<br>指導老師：${NM.j}、${NM.her}</div><div class="small" style="margin-top:6px">出師後，${a.nm}每天都會寄材料回來。</div>`:''}
 <button class="btn gold" data-a="lvnext">${LVQ.length?'下一位 →':'好'}</button>`)}
// ---- 共同筆記本 ----
const plain=h=>String(h).replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ');
const rich=t=>esc(t).replace(/\n/g,'<br>');
function nbAll(){const m=save.nb.map(e=>({...e,by:ME()})),p=P?P.nb.map(e=>({...e,by:PA()})):[];return[...m,...p].sort((x,y)=>y.ts-x.ts)}
function nbNew(){if(!P)return 0;const t=save.nbSeen||0;return P.nb.filter(e=>e.ts>t).length+Object.values(P.nn).filter(x=>x.ts>t&&x.txt).length}
function flagQ(){if(!PQ||!PQ.done||PQ.flg)return;const Q=PQ.Q;modal(`<h3>🚩 回報題目</h3><div class="small">哪裡怪怪的？（會存在回報清單，之後一次整理給 Claude 修）</div>
 <div class="inv" style="margin:8px 0">${['答案錯了','選項不只一個對','題目看不懂','解說不清楚','太簡單','超出範圍'].map(t=>`<span class="chip zero" data-a="flagr" data-v="${t}">${t}</span>`).join('')}</div>
 <textarea id="flt" maxlength="120" placeholder="（可以補充說明）" style="width:100%;height:60px;border-radius:10px;border:1px solid var(--line);padding:8px;font-family:inherit;font-size:14px;background:#fffdf7"></textarea>
 <button class="btn gold" data-a="flagsave">送出回報</button><button class="btn ghost" data-a="close">取消</button>`)}
let FLR='';
function flagSave(){const Q=PQ.Q;save.fl=save.fl||[];save.fl.unshift({id:ME()+Date.now().toString(36),q:plain(Q.q).slice(0,500),o:PQ.opts.map(plain),a:PQ.opts.indexOf(PQ.right),t:Q.t,why:FLR,note:($('flt').value||'').slice(0,120),ts:Date.now()});save.fl=save.fl.slice(0,60);PQ.flg=true;FLR='';persist();toast('🚩 已記下，謝謝！');closeM()}
function flagList(){const all=[...(save.fl||[]).map(f=>({...f,by:ME()})),...(P&&P.fl?P.fl.map(f=>({...f,by:PA()})):[])].sort((a,b)=>b.ts-a.ts);return all}
function flagText(){return flagList().map((f,i)=>`#${i+1}【${f.t}】${f.why||''}${f.note?'：'+f.note:''}（${NM[f.by]}）\n題目：${f.q}\n選項：${f.o.map((o,k)=>(k===f.a?'✓':'')+o).join(' ｜ ')}`).join('\n\n')}
function nbAdd(){
 if(!PQ||!PQ.done||PQ.nbd)return;const Q=PQ.Q;
 save.nb.unshift({id:ME()+Date.now().toString(36),q:plain(Q.q),o:PQ.opts.map(plain),a:PQ.opts.indexOf(PQ.right),ex:plain(Q.ex),t:Q.t,lv:Q.lv,un:Q.un||'',ts:Date.now()});
 save.nb=save.nb.slice(0,80);PQ.nbd=true;pushEv({k:'nb',u:Q.t});persist();toast(`📒 收進筆記本了，${paN()}也看得到`);render();
}
// 舊版的「請教」轉成筆記本
if(save.asks&&save.asks.length){save.asks.forEach(a=>{if(!save.nb.some(e=>e.id===a.id))save.nb.push({id:a.id,q:a.q,o:a.o,a:a.a,ex:a.ex,t:a.t,lv:a.lv,un:a.un,ts:a.ts})});save.asks=[];_persist()}
let NBF='all',NBQ=null;
function vNotebook(){
 const all=nbAll(),us=[...new Set(all.map(e=>e.t))];
 let h=`<div class="sec">📒 我們的筆記本<small>${all.length} 題 · ${meN()}和${paN()}一起寫的</small></div>`;
 if(!all.length)return h+`<div class="card muted">還是空的。練習時遇到有意思、容易錯、想記住的題目，答完按「📒 收藏」。<br><br>收進來的題目兩個人都看得到，可以在下面互相留筆記，偶爾也會在練習時跳出來複習。</div>`;
 h+=`<div class="inv" style="margin-bottom:10px"><span class="chip ${NBF==='all'?'':'zero'}" data-a="nbf" data-v="all">全部</span>${us.map(u=>`<span class="chip ${NBF===u?'':'zero'}" data-a="nbf" data-v="${u}">${u.replace('有機・','')}</span>`).join('')}</div>`;
 all.filter(e=>NBF==='all'||e.t===NBF).forEach(e=>{
  const notes=[[ME(),save.nn[e.id]],[PA(),P&&P.nn[e.id]]].filter(x=>x[1]&&x[1].txt);
  const isNew=e.by===PA()&&e.ts>(save.nbSeen||0);
  h+=`<div class="card" ${isNew?'style="border-color:var(--her)"':''}><div class="small"><span class="pill">${e.t}</span><span class="pill">${'★'.repeat(e.lv)}</span>${isNew?'<span class="pill her">新</span>':''}<span class="${e.by===ME()?'who-me':'who-her'}">${NM[e.by]}</span> 收的 · ${ago(e.ts)}</div>
   <div class="dq" style="font-size:14.5px">${rich(e.q)}</div><div class="small">答案：<b>${rich(e.o[e.a])} ${esc(e.un)}</b></div>
   <details style="margin-top:4px"><summary class="small" style="cursor:pointer">看解說</summary><div class="ex">${rich(e.ex)}</div></details>
   ${notes.map(([w,x])=>`<div class="ex" style="border-left-color:${w===ME()?'var(--me)':'var(--her)'}">✏️ <span class="${w===ME()?'who-me':'who-her'}">${NM[w]}</span>：${esc(x.txt)}</div>`).join('')}
   <div class="row"><button class="btn" style="flex:1;margin-top:6px;padding:7px" data-a="nbtry" data-v="${e.id}">再練一次</button><button class="btn" style="flex:1;margin-top:6px;padding:7px" data-a="nbnote" data-v="${e.id}">${save.nn[e.id]&&save.nn[e.id].txt?'改我的筆記':'✏️ 留筆記'}</button></div></div>`});
 return h;
}
function nbNote(id){const cur=(save.nn[id]&&save.nn[id].txt)||'';
 modal(`<h3>✏️ 留筆記</h3><div class="small">寫一句自己的理解、記憶法、或提醒（80 字內）。${paN()}會看到。</div>
 <textarea id="nbt" maxlength="80" style="width:100%;height:80px;margin-top:8px;border-radius:10px;border:1px solid var(--line);padding:8px;font-family:inherit;font-size:15px;background:#fffdf7">${esc(cur)}</textarea>
 <div class="small" style="margin-top:6px">或點一句：</div><div class="inv" style="margin:6px 0">${HINTS.map(t=>`<span class="chip zero" data-a="nbh" data-v="${esc(t)}">${t}</span>`).join('')}</div>
 <button class="btn gold" data-a="nbsave" data-v="${id}">存起來</button><button class="btn ghost" data-a="close">取消</button>`)}
function nbSave(id){const t=($('nbt').value||'').trim().slice(0,80);if(t){save.nn[id]={txt:t,ts:Date.now()};pushEv({k:'nn'})}else delete save.nn[id];persist();toast(t?'✏️ 筆記存好了':'已刪除筆記');closeM()}
function nbTry(id){const e=nbAll().find(x=>x.id===id);if(!e)return;NBQ={e,opts:shuffle(e.o.map((o,i)=>i)),pick:null};drawNbTry()}
function drawNbTry(){const e=NBQ.e;let h=`<div class="small"><span class="pill">${e.t}</span>📒 筆記本</div><div class="dq">${rich(e.q)}</div>`+NBQ.opts.map(i=>`<button class="opt ${NBQ.pick!==null?(i===e.a?'right':i===NBQ.pick?'wrong':''):''}" data-a="nbp" data-v="${i}" ${NBQ.pick!==null?'disabled':''}>${rich(e.o[i])} ${esc(e.un)}</button>`).join('');
 if(NBQ.pick!==null)h+=`<div class="ex">${NBQ.pick===e.a?'<span class="ok">✓ 答對了！</span>':'<span class="bad">✗ 再看一次解說吧。</span>'} ${rich(e.ex)}</div>`;
 modal(h+`<button class="btn ghost" data-a="close">關閉</button>`)}
function nbPick(i){const e=NBQ.e;NBQ.pick=i;const ok=i===e.a;recStat(e.t,ok,e.lv);if(ok){const td=todayStr();save.pdOk=save.pdOk[0]===td?[td,save.pdOk[1]+1]:[td,1]}persist();checkLv();checkGoal();drawNbTry()}
// ---- 角色：學者 / 工匠 ----
const ROLES={sch:['🔬','學者','負責研究課題：Lv3 以上的建築要先完成研究才能蓋。答對 ★★ 以上的題目，學徒經驗 ×2。'],art:['🛠️','工匠','負責配平、量產和蓋房子。答對的材料獎勵 ×2，工房每次反應多做出一份主產物。']};
function myRole(){return save.role||(ME()==='her'?'sch':'art')}
function roleCard(){const r=ROLES[myRole()],pr=P&&P.role?ROLES[P.role]:null;
 return`<div class="card"><div class="tagrow"><b>你的角色：${r[0]} ${r[1]}</b><button class="btn" style="width:auto;margin:0;padding:4px 10px;font-size:13px" data-a="role2">換成${ROLES[myRole()==='sch'?'art':'sch'][1]}</button></div><div class="small" style="margin-top:4px">${r[2]}</div>${pr?`<div class="small" style="margin-top:6px">${paN()}：${pr[0]} ${pr[1]}</div>`:''}<div class="small" style="margin-top:4px;color:var(--dim)">角色隨時可以換；兩個人同一個角色也沒關係，只是分工比較有效率。</div></div>`}
// ---- 研究課題（學者）：三題 ★★★，答對兩題就完成 ----
let RS=null;
function rsQs(b){const ap=APPM[BX[b][0]],out=[];
 const bank=QB.map((q,i)=>i).filter(i=>ap.u.includes(QB[i][3])&&QB[i][4]>=3),gens=GEN.filter(g=>ap.u.includes(g.u)&&g.l>=2);
 const sb=shuffle(bank);while(out.length<3){if(gens.length&&(out.length===1||!sb.length)){const g=genQ(gens[Math.floor(Math.random()*gens.length)],Math.random);out.push({q:g.q,o:g.o,ex:g.ex,t:g.t,lv:3,un:g.u})}
  else if(sb.length){const q=QB[sb.pop()];out.push({q:q[0],o:q[1],ex:q[2],t:q[3],lv:q[4],un:''})}else{const q=QB[QB.map((q,i)=>i).filter(i=>ap.u.includes(QB[i][3]))[0]];out.push({q:q[0],o:q[1],ex:q[2],t:q[3],lv:q[4],un:''})}}
 return out.map(x=>({...x,right:x.o[0],opts:shuffle(x.o)}))}
function rsStart(b){if(myRole()!=='sch'){toast('研究課題要由「學者」來做（可以在學院換角色）');return}RS={b,qs:rsQs(b),k:0,ok:0,pick:null};drawRs()}
function drawRs(){const b=BDM[RS.b],q=RS.qs[RS.k];
 let h=`<h3>🔬 研究課題：${b[2]} ${b[3]}</h3><div class="small">第 ${RS.k+1}/3 題 · 答對 2 題就完成 · 目前答對 ${RS.ok}</div><div class="dq">${q.q}</div>`+q.opts.map((o,i)=>`<button class="opt ${RS.pick!==null?(o===q.right?'right':i===RS.pick?'wrong':''):''}" data-a="rsp" data-v="${i}" ${RS.pick!==null?'disabled':''}>${o} ${q.un}</button>`).join('');
 if(RS.pick!==null){h+=`<div class="ex">${q.opts[RS.pick]===q.right?'<span class="ok">✓</span>':'<span class="bad">✗</span>'} ${q.ex}</div>`;
  const fin=RS.ok>=2||RS.k===2;h+=fin?(RS.ok>=2?`<div class="ok" style="text-align:center">研究完成！「${b[3]}」可以開工了。</div><button class="btn gold" data-a="close">太好了</button>`:`<div class="bad" style="text-align:center">這次沒過，可以再挑戰一次（題目會換）。</div><button class="btn gold" data-a="rsgo" data-v="${RS.b}">再挑戰</button><button class="btn ghost" data-a="close">先休息</button>`):`<button class="btn gold" data-a="rsn">下一題 →</button>`}
 modal(h)}
function rsPick(i){const q=RS.qs[RS.k];RS.pick=i;const ok=q.opts[i]===q.right;if(ok)RS.ok++;recStat(q.t,ok,q.lv);if(ok){const td=todayStr();save.pdOk=save.pdOk[0]===td?[td,save.pdOk[1]+1]:[td,1]}
 if(RS.ok>=2&&!save.rs[RS.b]){save.rs[RS.b]=1;pushEv({k:'rs',b:RS.b});confetti()}persist();checkLv();checkGoal();drawRs()}
// ---- 學院 ----
function apCard(a,big){const l=appLv(a.id),x=appXP(a.id),nx=ALV[l]??null,pv=ALV[l-1];const pc=nx===null?1:(x-pv)/(nx-pv);
 return`<div class="card" ${big?'':`data-a="apv" data-v="${a.id}" style="cursor:pointer"`}><div class="row" style="flex-wrap:nowrap"><div style="font-size:38px;line-height:1;position:relative">${a.ic}${BADGE(l)?`<span style="position:absolute;right:-8px;bottom:-4px;font-size:18px">${BADGE(l)}</span>`:''}</div><div style="flex:1;min-width:0"><div class="tagrow"><b style="font-family:'Noto Serif TC',serif;font-size:16px;color:#6b4a1c">${a.nm}</b><span class="pill">Lv${l}${l>=GRAD?' · 出師':''}</span></div>
 <div class="small">${a.tp}</div><div class="need" style="margin:4px 0 0"><div class="bar"><i style="width:${pc*100}%;background:linear-gradient(90deg,var(--me),var(--her))"></i></div></div>
 <div class="small">${nx===null?'已經是大師了':`再一起答對 ${nx-x} 題升級`}</div></div></div>${big?`<div class="muted" style="margin-top:6px">${a.d}</div>`:`<div class="small" style="margin-top:6px;color:#7a6a52">💬 ${STORY[a.id][l-1].slice(0,38)}${STORY[a.id][l-1].length>38?'…':''}</div>`}</div>`}
function vAcademy(){
 let h=roleCard();
 h+=`<div class="sec">🎓 學徒們<small>兩個人答對的題目都算經驗，Lv${GRAD} 出師後每天會寄材料回來</small></div>`;
 APP.slice().sort((x,y)=>appXP(y.id)-appXP(x.id)).forEach(a=>h+=apCard(a));
 h+=`<button class="btn" data-a="tab" data-v="book">📘 我的學習紀錄（單元答對率、原理卡、配平過的方程式）</button>`;
 return h;
}
function openApp(id){const a=APPM[id];const units=a.u.map(u=>`<span class="chip zero">${u.replace('有機・','')}<b style="font-weight:400;font-size:11px">${'★'.repeat(lvFor(u))}</b></span>`).join('');
 const bs=Object.keys(BX).filter(b=>BX[b][0]===id).map(b=>`${BDM[b][2]}${BDM[b][3]} <span class="small">Lv${BX[b][1]}</span>`).join('、');
 const l=appLv(id);modal(`${apCard(a,true)}<div class="sec" style="margin-top:4px">📔 成長日記</div>${STORY[id].slice(0,l).map((t,i)=>`<div class="ex"><b>Lv${i+1}</b>　${t}</div>`).join('')}${l<7?`<div class="small" style="margin-bottom:8px">🔒 下一段在 Lv${l+1}（再一起答對 ${ALV[l]-appXP(id)} 題）</div>`:''}<div class="small">負責的單元（★ 是你目前在這單元的題目難度）</div><div class="inv" style="margin:6px 0 10px">${units}</div><div class="small">升級後能蓋：${bs||'—'}</div><button class="btn gold" data-a="teach" data-v="${id}">📝 上${a.nm}的課</button><button class="btn ghost" data-a="close">關閉</button>`);
}




// ===================== 會長大的小鎮插畫 =====================
const POS={house:[34,222],smithy:[72,240],granary:[108,214],lantern:[30,190],zincpot:[70,200],firewatch:[112,246],
 guild:[178,222],vault:[214,240],greenhouse:[246,214],bathhouse:[182,190],chapel:[216,186],mint:[250,246],academy:[276,206],
 thunder:[318,108],clinic:[302,238],farm:[336,250],acidworks:[300,178],bridge:[156,206],railway:[198,256],bakery:[274,244],beacon:[346,160],spire:[334,72],
 tavern:[28,150],soapery:[62,156],apothecary:[96,148],dyehouse:[128,160],minelamp:[22,122],orchard:[56,124],vinegary:[90,118],belltower:[122,104]};
const FOLK=['🧑‍🌾','👩‍🍳','🧒','👵','🧑‍🔧','👩‍🎨','🐕','👨‍🏫','🐈','👧','🧑‍🎓','🐓'];
function townSVG(){
 const T=town(),h=new Date(Date.now()+8*36e5).getUTCHours(),night=h<6||h>=19,dusk=h>=17&&h<19;
 const sky=night?['#1b2442','#3a4470']:dusk?['#f6b26b','#f9dfb0']:['#9fd0f0','#eaf6fb'];
 const lit=T.sat['光']>0;let g='';
 g+=`<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>`;
 g+=`<rect width="360" height="270" fill="url(#sk)"/>`;
 if(night){for(let i=0;i<22;i++){const x=(i*73)%360,y=(i*37)%70+5;g+=`<circle cx="${x}" cy="${y}" r="${i%3?0.8:1.3}" fill="#fff" class="tw" style="animation-delay:${(i%7)*.4}s"/>`}g+=`<circle cx="300" cy="30" r="12" fill="#f4f1d0"/><circle cx="305" cy="26" r="11" fill="${sky[0]}"/>`}
 else g+=`<circle cx="${dusk?60:300}" cy="${dusk?70:32}" r="14" fill="${dusk?'#f08a4b':'#ffe08a'}"/>`;
 g+=`<path d="M0 120 Q60 70 120 100 T240 95 T360 70 L360 270 L0 270Z" fill="${night?'#2c3a3a':'#a8c99a'}"/>`;
 g+=`<path d="M260 270 L280 120 Q320 40 360 90 L360 270Z" fill="${night?'#34413f':'#9bbf8c'}"/>`;
 g+=`<path d="M0 135 Q40 95 90 100 Q130 90 150 120 L150 170 L0 175Z" fill="${night?'#20352a':'#7fb07a'}"/>`;
 for(let i=0;i<9;i++)g+=`<text x="${8+i*16}" y="${100+(i%3)*6}" font-size="14">🌲</text>`;
 g+=`<rect x="0" y="170" width="360" height="100" fill="${night?'#3d4a3a':'#cfe0a8'}"/>`;
 g+=`<path d="M150 90 Q160 140 148 180 Q140 220 158 270" stroke="${night?'#2d4f6b':'#7cc1e4'}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
 g+=`<path d="M0 232 L360 228" stroke="${night?'#5a5040':'#e8d6a8'}" stroke-width="9"/>`;
 g+=[['霧谷村',40,264],['王都',214,268],['賢者之塔',300,58],['森林學院',40,92]].map(([t,x,y])=>`<text x="${x}" y="${y}" font-size="8" fill="${night?'#cfd8e8':'#6b4a1c'}" opacity=".75" text-anchor="middle">${t}</text>`).join('');
 BD.forEach(b=>{const p=POS[b[0]];if(!p)return;const d=bDone(b[0]),ul=unlocked(b[0]);
  if(d){if(night&&lit)g+=`<circle cx="${p[0]+6}" cy="${p[1]-6}" r="7" fill="#ffd76a" opacity=".35"/>`;
   g+=`<text x="${p[0]}" y="${p[1]}" font-size="20" text-anchor="middle" class="bb" data-a="bld" data-v="${b[0]}" style="cursor:pointer;animation-delay:${(p[0]%7)*.3}s">${b[2]}</text>`;
   if(['smithy','acidworks','zincpot','bakery'].includes(b[0]))g+=`<circle cx="${p[0]+5}" cy="${p[1]-20}" r="3" fill="#ddd" class="smk"/><circle cx="${p[0]+8}" cy="${p[1]-24}" r="2.4" fill="#eee" class="smk" style="animation-delay:.8s"/>`}
  else g+=`<text x="${p[0]}" y="${p[1]}" font-size="${ul?13:9}" text-anchor="middle" opacity="${ul?.75:.35}" data-a="bld" data-v="${b[0]}" style="cursor:pointer">${ul?'🚧':'·'}</text>`});
 const nf=Math.min(FOLK.length,Math.floor(T.built*1.2)+(T.built?1:0));
 for(let i=0;i<nf;i++){const y=226+(i%3)*5,dur=14+i*3;g+=`<text x="0" y="${y}" font-size="11" class="walk" style="animation-duration:${dur}s;animation-delay:-${i*2.3}s">${FOLK[i]}</text>`}
 if(night&&lit)for(let i=0;i<6;i++)g+=`<circle cx="${20+i*64}" cy="222" r="2.2" fill="#ffe08a"/><circle cx="${20+i*64}" cy="222" r="7" fill="#ffe08a" opacity=".25"/>`;
 return`<div class="card" style="padding:0;overflow:hidden"><svg viewBox="0 0 360 270" style="display:block;width:100%">${g}</svg>
 <div style="padding:8px 12px" class="small">${T.built?`${T.built} 棟建築、${T.pop} 位鎮民${night?(lit?' · 夜裡街燈亮著':' · 晚上一片漆黑，鎮民希望有燈'):''}`:'還是一片空地。蓋好第一棟房子，鎮民就會搬進來。'}　點地圖上的房子或 🚧 可以打開。</div></div>`;
}

// ===================== 新手任務 =====================
const TUT=[
 {t:'答對 3 題',d:'到「📝 練習」選一位學徒（例如 ⚖️阿秤），答對 3 題。',tab:'gather',ok:()=>save.qst[0]>=3},
 {t:'收一題進筆記本',d:'答完任何一題，按「📒 收藏」。',tab:'gather',ok:()=>save.nb.length>0},
 {t:'認識學院',d:'到「🎓 學院」看看你的角色和學徒們。',tab:'acad',ok:()=>!!(save.tutSeen&&save.tutSeen.acad)},
 {t:'第一次配平',d:'到「⚗️ 工房」找「石灰石 → 生石灰」，按 ▲▼ 調係數後按「檢查」。',tab:'lab',ok:()=>!!save.solved.lime},
 {t:'送材料給石屋',d:'到「🏘️ 小鎮」點石屋，用「🧾 備料清單」做好材料，再按「捐出」。',tab:'town',ok:()=>Object.keys(save.don.house||{}).length>0},
 {t:'蓋好石屋',d:'把石屋需要的東西捐齊（兩個人一起捐也算）。原料不夠就回練習答題。',tab:'town',ok:()=>bDone('house')},
];
function tutStep(){if(save.tut===99)return null;let k=save.tut||0;while(k<TUT.length&&TUT[k].ok())k++;
 if(k!==(save.tut||0)){const was=save.tut||0;save.tut=k;
  if(k>=TUT.length){save.tut=99;addInv('caco3',6);addInv('c',4);persist();setTimeout(()=>{confetti();toast('🎉 新手任務完成！送你石灰石×6、木炭×4')},300);return null}
  addInv(rewardItem(),2);persist();setTimeout(()=>toast(`✅ 新手任務：${TUT[k-1].t}　→ 下一步：${TUT[k].t}`),200)}
 return k<TUT.length?k:null}
function tutCard(){const k=tutStep();if(k===null)return'';const x=TUT[k];
 return`<div class="card" style="border:2px solid var(--gold2);background:#fffaf0"><div class="tagrow"><b>🧭 新手任務 ${k+1}/${TUT.length}：${x.t}</b><span class="small" data-a="tutskip" style="cursor:pointer;text-decoration:underline">略過</span></div>
 <div class="small" style="margin:4px 0 6px">${x.d}</div><div class="need" style="margin:0"><div class="bar"><i style="width:${k/TUT.length*100}%;background:var(--gold2)"></i></div></div>
 ${TAB!==x.tab?`<button class="btn gold" style="padding:7px" data-a="tab" data-v="${x.tab}">帶我去 →</button>`:''}</div>`}

// ===================== 玩法介紹 =====================
function openHelp(){
 const n=HOME[ME()]==='n';
 modal(`<h3>📖 玩法介紹</h3>
 <div class="muted">你和${paN()}被召喚到一個魔法全是化學的世界。鎮上的孩子想學，你們兩個是他們的老師。這是一起努力的遊戲，沒有輸贏。</div>
 <div class="sec" style="margin-top:12px">每次上線大概這樣玩</div>
 <div class="ex"><b>① 📝 練習</b>：選一位學徒，開始答題。<br>
 ・每一題都是在幫學徒上課；答對，學徒就長大一點，也會拿到蓋房子要用的原料。<br>
 ・題目難度會照<b>你自己</b>的答對率調整（大約答對七成的難度），所以兩個人程度不同也沒關係。<br>
 ・答完會看到解說；覺得有意思、容易錯的題目，按「📒 收藏」。</div>
 <div class="ex"><b>② 🎓 學院</b>：選角色、看學徒成長。<br>
 ・<b>角色</b>：🔬 學者負責「研究課題」（Lv3 以上的建築要先研究才能蓋），答對 ★★ 以上學徒經驗 ×2；🛠️ 工匠負責配平和蓋房子，材料獎勵 ×2、反應多做一份。角色隨時可換。<br>
 ・兩個人答對的題目都算同一位學徒的經驗。學徒升級才能蓋對應的建築；Lv${GRAD} 出師後，每天會自己寄材料回來。<br>
 ・最下面可以看自己的學習紀錄（只有你看得到）。</div>
 <div class="ex"><b>📒 筆記本</b>：兩個人收進來的題目都在這裡。<br>
 ・可以在題目下面留一句自己的筆記（記憶法、提醒），${paN()}會看到；${paN()}寫的也會出現。<br>
 ・「再練一次」可以直接重做；練習時也會偶爾跳出筆記本的題目複習。</div>
 <div class="ex"><b>③ 🏘️ 小鎮</b>：把材料送去蓋房子。<br>
 ・點建築看需要什麼；材料夠就按「捐出」。<br>
 ・缺的東西如果是原料，繼續練習就會拿到；如果要用反應做，點旁邊的按鈕會直接跳到工房。<br>
 ・上方七格是鎮民的需求（住、水、糧、醫、光、工、樂），「鎮民心聲」會告訴你現在最該蓋哪一棟。<br>
 ・灰色有 🔒 的建築，要先把對應的學徒教到指定等級；標「🔬 待研究」的要等學者完成研究課題。</div>
 <div class="ex"><b>④ ⚗️ 工房</b>：把原料變成建築要的東西。<br>
 ・第一次做某個反應要先<b>配平</b>：按 ▲▼ 調係數，讓兩邊每種原子一樣多。卡住時打開「原子計數」。<br>
 ・配平過一次之後，就可以直接照比例量產。<br>
 ・倉庫裡的東西可以點開寄給${paN()}（${n?'你在北方礦山，她在南方海岸':'你在南方海岸，他在北方礦山'}，兩邊產的原料不一樣）。</div>

 <div class="sec">每日目標</div>
 <div class="muted">每天兩個人合計答對 ${GOAL} 題，鎮民會送禮物給你們兩個。進度條在「練習」和「小鎮」最上面。</div>
 <div class="sec">第一次玩建議</div>
 <div class="muted">先到「練習」選 ⚖️阿秤 或 🍋檸檸 答幾題 → 到「小鎮」看石屋需要什麼 → 去「工房」配平「石灰石 → 生石灰」→ 把材料捐給石屋。</div>
 <button class="btn gold" data-a="close">開始玩</button>`);
}



function syncPanel(){const L={off:'📴 單機模式：沒有連上雲端（網路或 Firebase 沒載入），進度只存在這台裝置。',conn:'⏳ 正在連線……',ok:'☁️ 已同步。同步是自動的：每次有進度約 2 秒後上傳，對方的進度會即時傳過來。',push:'⏳ 有新進度，正在上傳……',err:'⚠️ 上傳失敗，會自動每 20 秒重試，網路恢復時也會自動補傳。'};
 modal(`<h3>同步狀態</h3><div class="ex">${L[SY.st]||L.off}${SY.st==='err'?`<br><span class="small">${esc(SY.err)}</span>`:''}</div>
 <div class="small">${SY.okAt?`上次成功上傳：${ago(SY.okAt)}`:'還沒上傳過'}<br>${P?`${paN()}最後一次存檔：${P.ts?ago(P.ts):'—'}`:`還沒收到${paN()}的資料（${paN()}可能還沒開過遊戲）`}${TEST?`<br>🧪 測試模式：${TCLOUD?'連著「雲端測試空間」，不會碰到真實存檔':'單機，不連雲端'}`:''}</div>
 ${SY.on?'<button class="btn" data-a="syncnow">立刻上傳一次</button>':''}<button class="btn ghost" data-a="close">關閉</button>`)}

// ===================== 🧪 測試模式（獨立存檔、不同步雲端） =====================
function dbgPanel(){
 if(!TEST){modal(`<h3>🧪 測試模式</h3><div class="muted">進入後會用<b>另一份獨立的存檔</b>，不連雲端、不影響你和${paN()}的真實進度。可以快轉學徒、蓋房子、模擬${paN()}的動作、跳到隔天，看看之後會長怎樣。離開測試模式就回到真實存檔。</div><button class="btn gold" data-a="dbgon">進入測試模式（單機）</button><button class="btn" data-a="dbgcloud">☁️ 進入「雲端測試」模式</button><div class="small" style="margin-top:6px">雲端測試：兩台裝置（或兩個瀏覽器）都進這個模式，一台選傑、一台選彣，就能真的測同步，用的是另一個雲端空間，不會碰到真實存檔。</div><button class="btn ghost" data-a="close">取消</button>`);return}
 const B=(a,t,v='')=>`<button class="btn" style="margin-top:6px;padding:9px" data-a="${a}" data-v="${v}">${t}</button>`;
 modal(`<h3>🧪 測試工具</h3><div class="small">${TCLOUD?'☁️ 雲端測試模式（會真的同步到測試空間）':'🧪 單機測試模式'} · 身分：${meN()}（連點標題 5 下可換）· 日期 ${todayStr()}${TOFF?`（快轉 ${TOFF} 天）`:''}</div>
 <div class="sec">學徒</div>${B('d_xp','每位學徒 +5 題答對（升一級左右）',5)}${B('d_xp','每位學徒 +30 題答對',30)}<div class="inv" style="margin-top:6px">${APP.map(a=>`<span class="chip" data-a="d_xp1" data-v="${a.id}">${a.ic}${a.nm} +10</span>`).join('')}</div>
 <div class="sec">材料與工房</div>${B('d_raw','原料各 +20')}${B('d_all','所有物質各 +10')}${B('d_solve','所有反應直接算已配平')}
 <div class="sec">小鎮</div>${B('d_b1','蓋好下一棟能蓋的')}${B('d_bu','蓋好所有已解鎖的')}${B('d_ball','全部 30 棟直接蓋好（無視鎖）')}
 <div class="sec">模擬${paN()}</div>${TCLOUD?B('d_tcwipe','清空我在雲端測試空間的存檔'):''}${TCLOUD?'':B('d_p','產生${paN()}的進度（答題、捐建築、今日答對 8 題）')}${TCLOUD?'':B('d_pnb','${paN()}收一題進筆記本')+B('d_pnn','${paN()}在我收的題目下留筆記')}${B('d_rs','所有研究課題直接完成')}
 <div class="sec">時間</div>${B('d_day','跳到明天（測每日目標、出師寄材料）')}
 <div class="sec">其他</div>${B('d_wipe','清空測試存檔，從頭開始')}<button class="btn gold" data-a="dbgoff">離開測試模式（回到真實存檔）</button><button class="btn ghost" data-a="close">關閉</button>`);
}
function dbgFakeP(){let fp=null;try{fp=JSON.parse(localStorage.getItem('mb_testP_'+ROLE)||'null')}catch(e){}return Object.assign({uc:{},ask:[],rep2:{},nb:[],nn:{},rs:{},role:ME()==='her'?'art':'sch',pd:['',0],don:{},ev:[],out:[],claimed:[],ts:Date.now()},fp||{})}
function dbgSaveP(fp){fp.ts=Date.now();try{localStorage.setItem('mb_testP_'+ROLE,JSON.stringify(fp))}catch(e){}const prev=P;P=sanitize(fp);if(!prev)snapLv();else checkLv(false);checkGoal()}
function dbgBuild(b){save.don[b[0]]=Object.assign({},b[4])}
function dbg(a,v){
 const done=t=>{persist();checkLv();checkGoal();claimWork();toast('🧪 '+t);dbgPanel();renderHead()};
 switch(a){
  case'dbgon':try{localStorage.setItem('mb_test','1');localStorage.setItem('mb_toff','0');localStorage.removeItem('mb_tcloud')}catch(e){}return location.reload();
  case'dbgcloud':try{localStorage.setItem('mb_test','1');localStorage.setItem('mb_toff','0');localStorage.setItem('mb_tcloud','1')}catch(e){}return location.reload();
  case'd_tcwipe':save=defSave();save.intro=true;_persist();SY.last='';pushMine();toast('🧪 雲端測試存檔已清空（另一台也要各自清）');closeM();return render();
  case'dbgoff':try{localStorage.removeItem('mb_test');localStorage.removeItem('mb_toff');localStorage.removeItem('mb_tcloud')}catch(e){}return location.reload();
  case'd_xp':APP.forEach(ap=>{for(let i=0;i<+v;i++){const u=ap.u[i%ap.u.length];const x=save.us[u]||[0,0];x[0]++;save.us[u]=x}});return done(`每位學徒 +${v}`);
  case'd_xp1':{const ap=APPM[v];for(let i=0;i<10;i++){const u=ap.u[i%ap.u.length];const x=save.us[u]||[0,0];x[0]++;save.us[u]=x}return done(`${ap.nm} +10`)}
  case'd_raw':Object.keys(IT).filter(isRaw).forEach(i=>addInv(i,20));return done('原料各 +20');
  case'd_all':Object.keys(IT).forEach(i=>addInv(i,10));return done('所有物質各 +10');
  case'd_solve':RX.forEach(r=>save.solved[r[0]]=1);return done('全部已配平');
  case'd_b1':{const b=BD.find(b=>!bDone(b[0])&&unlocked(b[0]));if(!b)return toast('沒有能蓋的了（先升學徒）');dbgBuild(b);pushEv({k:'build',b:b[0]});return done(`${b[3]} 落成`)}
  case'd_bu':BD.filter(b=>!bDone(b[0])&&unlocked(b[0])).forEach(dbgBuild);return done('已解鎖的全部蓋好');
  case'd_ball':BD.forEach(dbgBuild);return done('30 棟全部蓋好');
  case'd_p':{const fp=dbgFakeP();ALLU().forEach(u=>fp.uc[u]=(fp.uc[u]||0)+3+Math.floor(Math.random()*4));fp.pd=[todayStr(),8];
   const b=BD.find(b=>!bDone(b[0])&&unlocked(b[0]));if(b){fp.don[b[0]]={};const k=Object.keys(b[4])[0];fp.don[b[0]][k]=Math.ceil(b[4][k]/2);fp.ev.unshift({k:'don',b:b[0],it:k,n:fp.don[b[0]][k],t:Date.now()})}
   fp.ev.unshift({k:'goal',t:Date.now()-1});dbgSaveP(fp);return done(`${paN()}的進度已產生`)}
  case'd_pnb':{const fp=dbgFakeP();fp.nb=fp.nb||[];const qi=Math.floor(Math.random()*QB.length),q=QB[qi],o=shuffle(q[1]);
   fp.nb.unshift({id:'fk'+Date.now().toString(36),q:plain(q[0]),o:o.map(plain),a:o.indexOf(q[1][0]),ex:plain(q[2]),t:q[3],lv:q[4],un:'',ts:Date.now()});fp.ev.unshift({k:'nb',u:q[3],t:Date.now()});dbgSaveP(fp);return done(`${paN()}收了一題（看筆記本）`)}
  case'd_pnn':{const fp=dbgFakeP();fp.nn=fp.nn||{};let n=0;save.nb.forEach(e=>{if(!fp.nn[e.id]){fp.nn[e.id]={txt:HINTS[Math.floor(Math.random()*HINTS.length)],ts:Date.now()};n++}});if(n)fp.ev.unshift({k:'nn',t:Date.now()});dbgSaveP(fp);return done(n?`${paN()}留了 ${n} 則筆記`:'你還沒收題目進筆記本')}
  case'd_rs':BD.forEach(b=>{if(BX[b[0]]&&BX[b[0]][1]>=3)save.rs[b[0]]=1});return done('研究全部完成');
  case'd_day':TOFF++;try{localStorage.setItem('mb_toff',String(TOFF))}catch(e){}PQ=null;return done(`現在是 ${todayStr()}`);
  case'd_wipe':save=defSave();save.intro=true;try{localStorage.removeItem('mb_testP_'+ROLE)}catch(e){}P=null;LV0={};snapLv();_persist();toast('🧪 測試存檔已清空');closeM();return;
 }
}

// ===================== 事件綁定 =====================
function modal(h){const m=$('modal');m.innerHTML=`<div class="mbox">${h}</div>`;m.classList.add('show');bind(m)}
function closeM(){$('modal').classList.remove('show');$('modal').innerHTML='';render()}
$('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeM()});
let GN=1;
function bind(root=document){
 root.querySelectorAll('[data-a]').forEach(el=>{if(el._b)return;el._b=1;el.onclick=ev=>{ev.stopPropagation();act(el.dataset.a,el.dataset.v,el)}});
}
function act(a,v,el){
 switch(a){
  case'close':return closeM();
  case'help':return openHelp();
  case'glogin':return googleLogin();
  case'glogout':return googleLogout();
  case'lvnext':closeM();return setTimeout(showLvQ,200);
  case'tutskip':save.tut=99;persist();toast('已略過新手任務（玩法介紹在右上角 ❓）');return render();
  case'sync':return syncPanel();
  case'syncnow':SY.last='';pushMine().then(()=>syncPanel());return;
  case'nbadd':return nbAdd();
  case'flag':return flagQ();
  case'autocraft':return autoCraft(v);
  case'flagr':FLR=v;document.querySelectorAll('[data-a=flagr]').forEach(x=>x.classList.toggle('zero',x.dataset.v!==v));return;
  case'flagsave':return flagSave();
  case'flagcopy':{const t=flagText();try{navigator.clipboard.writeText(t).then(()=>toast('已複製，貼給 Claude 就好'),()=>{$('flbox').style.display='block'})}catch(e){$('flbox').style.display='block'}return}
  case'nbf':NBF=v;return render();
  case'nbnote':return nbNote(v);
  case'nbh':{const t=$('nbt');t.value=(t.value?t.value+' ':'')+v;return}
  case'nbsave':return nbSave(v);
  case'nbtry':return nbTry(v);
  case'nbp':return nbPick(+v);
  case'role2':save.role=myRole()==='sch'?'art':'sch';persist();toast(`現在是${ROLES[save.role][0]} ${ROLES[save.role][1]}`);return render();
  case'rsgo':return rsStart(v);
  case'rsp':return rsPick(+v);
  case'rsn':RS.k++;RS.pick=null;return drawRs();
  case'dbg':return dbgPanel();
  default:if(a.startsWith('d_')||a.startsWith('dbg'))return dbg(a,v);
  case'bld':return openBld(v);
  case'donate':return donate(v,el.dataset.i);
  case'bquiz':return bQuiz(v);
  case'bqa':return bQuizAns(v,el.dataset.o,el);
  case'rx':return openRx(v);
  case'cup':BAL.c[+v]=Math.min(20,BAL.c[+v]+1);return drawBal();
  case'cdn':BAL.c[+v]=Math.max(1,BAL.c[+v]-1);return drawBal();
  case'btally':BAL.tally=!BAL.tally;return drawBal();
  case'bcheck':return balCheck();
  case'cq':return openCraft(CRAFT,+v);
  case'craft':return craft(+v);
  case'item':GN=1;return openItem(v);
  case'gq':GN=Math.max(1,Math.min(inv(document.querySelector('[data-a=gift]').dataset.v),GN+ +v));$('gn').textContent=GN;return;
  case'gift':sendGift(v,GN);GN=1;return closeM();
  case'scope':SCOPE_OPEN=!SCOPE_OPEN;return render();
  case'fa':{const f=save.focusA||[];save.focusA=f.includes(v)?f.filter(x=>x!==v):[...f,v];PQ=null;persist();return render()}
  case'teach':save.focusA=[v];PQ=null;persist();closeM();TAB='gather';SCOPE_OPEN=false;render();return scrollTo(0,0);
  case'apv':return openApp(v);
  case'tab':TAB=v;render();return scrollTo(0,0);
  case'fset':save.focusA=v==='g'?APP.filter(a=>!a.u[0].startsWith('有機')).map(a=>a.id):v==='o'?['a8','a9','a10']:[];PQ=null;persist();return render();
  case'fu':{const f=save.focus||[];save.focus=f.includes(v)?f.filter(x=>x!==v):[...f,v];PQ=null;persist();return render()}
  case'pans':return pAns(+v);
  case'pnext':PQ=null;render();return $('main').querySelector('.dq')&&$('main').querySelectorAll('.card')[1].scrollIntoView({behavior:'smooth',block:'start'});
  case'gorx':closeM();TAB='lab';render();return openRx(v);
  case'dans':return dAns(+v,el);
  case'dnext':return render();
  case'reset':if(!resetArm){resetArm=true;render();setTimeout(()=>{resetArm=false;if(TAB==='book')render()},3000);return}
   resetArm=false;save=defSave();save.intro=true;save.svt=Date.now();_persist();pushMine();toast('已重置');return render();
 }
}

// ===================== 開場 =====================
function prologue(){
 if(save.intro)return;
 const n=HOME[ME()]==='n';
 modal(`<h3>召喚</h3><p>期末考前一晚，實驗室的燒杯發出不屬於任何元素的光——</p>
 <p>醒來時，你在一座陌生大陸的${n?'<b>北方礦山</b>':'<b>南方海岸</b>'}。村民說，那天夜裡被召喚來的不只你一個：還有<b>${paN()}</b>，落在${n?'南方海岸':'北方礦山'}。</p>
 <p>這裡沒有魔法，他們口中的魔法全是化學。鎮上的孩子們想學，於是你們兩個成了他們的老師。</p>
 <div class="ex">📝 練習：選一位學徒上課，答題就是在教他。題目難度跟著你自己的答對率調整；不論誰答對，學徒都一樣長大。<br>🎓 學院：選角色（🔬學者／🛠️工匠），看學徒成長。<br>📒 筆記本：兩個人一起收題目、互相留筆記。<br>🏘️ 小鎮：兩個人一起蓋房子，照顧鎮民的住、水、糧、醫、光、工、樂。<br>⚗️ 工房：第一次做某個反應要先配平。<br>每天兩人合計答對 ${GOAL} 題，鎮民會送禮物來。</div>
 <button class="btn gold" data-a="start">開始</button>`);
 $('modal').querySelector('[data-a=start]').onclick=()=>{save.intro=true;persist();closeM();openHelp()};
}
// 隱藏開關：連點標題 5 下切換身分（測試用）
let tapN=0,tapT=0;
$('title').onclick=()=>{const t=Date.now();tapN=t-tapT<700?tapN+1:1;tapT=t;if(tapN>=5){tapN=0;accountMenu()}};
function accountMenu(){const u=SY.user,gj=isJUser(u);
 modal(`<h3>🔑 帳號</h3><div class="muted">這台裝置目前是：<b>${meN()}</b>${gj?`<br><span class="small">已用 Google 登入（${esc(u.displayName||'傑')}）<br>UID：<code style="user-select:all">${esc(u.uid)}</code>${J_UID?'':'（傳給 Claude，鎖定只有這個帳號能當傑）'}</span>`:''}</div>
 ${TEST?'':gj?`<button class="btn ghost" data-a="glogout">登出（這台裝置會變回彣）</button>`:`<button class="btn gold" data-a="glogin">我是傑，用 Google 登入</button><div class="small" style="text-align:center">登入之後，任何裝置都會認得你是傑。彣不用登入。</div>`}
 ${TEST?`<div class="sec">🧪 測試中可以自由切換身分</div><button class="btn" data-a="role" data-v="j">傑（北方礦山）</button><button class="btn" data-a="role" data-v="her">彣（南方海岸）</button>`:''}
 <button class="btn" data-a="dbg">🧪 ${TEST?'測試工具':'測試模式'}</button><button class="btn ghost" data-a="close">取消</button>`);
 $('modal').querySelectorAll('[data-a=role]').forEach(b=>b.onclick=()=>{save.lastVisit=Date.now();_persist();pushMine();try{localStorage.setItem('mb_role',b.dataset.v)}catch(e){}location.reload()})}
async function googleLogin(){
 if(!window.firebase||!firebase.apps.length)return toast('連上網路才能登入');
 const G=new firebase.auth.GoogleAuthProvider();G.setCustomParameters({prompt:'select_account'});
 try{const r=await firebase.auth().signInWithPopup(G);
  if(!isJUser(r.user)){await firebase.auth().signOut();await firebase.auth().signInAnonymously();return toast('這個 Google 帳號不是傑的')}
  try{localStorage.setItem('mb_role','j')}catch(e){}_persist();location.reload();
 }catch(e){
  if(e&&(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')){try{localStorage.setItem('mb_role','j')}catch(_){}return firebase.auth().signInWithRedirect(G)}
  if(e&&e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast('登入失敗：'+(e.code||e.message));
 }}
async function googleLogout(){try{await pushMine();await firebase.auth().signOut()}catch(e){}try{localStorage.setItem('mb_role','her')}catch(e){}location.reload()}

// ===================== 啟動 =====================
save.prevVisit=save.lastVisit||0;save.lastVisit=Date.now();_persist();
snapLv();claimWork();
render();prologue();
setTimeout(initSync,0);
