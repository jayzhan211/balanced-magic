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
function todayStr(off=0){const d=new Date(Date.now()+8*36e5-off*864e5);return d.toISOString().slice(0,10)}
const RXM={};RX.forEach(r=>RXM[r[0]]=r);
const BDM={};BD.forEach(b=>BDM[b[0]]=b);

// ===================== 身分（單字花園同款：連點標題 5 下切換） =====================
const NM={j:'傑',her:'彣'};
const HOME={j:'n',her:'s'};
let ROLE='her';try{ROLE=localStorage.getItem('mb_role')==='j'?'j':'her'}catch(e){}
const ME=()=>ROLE, PA=()=>ROLE==='j'?'her':'j';
const meN=()=>NM[ME()], paN=()=>NM[PA()];
const KEY=()=>'mb_save_'+ROLE;

// ===================== 存檔 =====================
function defSave(){return{v:1,inv:{caco3:4,h2o:6,c:4,mal:2},rep:0,solved:{},miss:0,made:{},don:{},quiz:{},ev:[],out:[],claimed:[],daily:null,dhist:{},qst:[0,0],us:{},qwrong:[],qrecent:[],lastVisit:0,prevVisit:0,intro:false,svt:0,seenB:{}}}
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
const SY={on:false,db:null,timer:null,last:''};
function sanitize(d){
 if(!d||typeof d!=='object')return null;
 const n=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(+v||0)));
 const don={};if(d.don&&typeof d.don==='object')for(const b in d.don){if(!BDM[b]||typeof d.don[b]!=='object')continue;don[b]={};for(const i in d.don[b])if(IT[i])don[b][i]=n(d.don[b][i],0,9999)}
 const ev=(Array.isArray(d.ev)?d.ev:[]).slice(0,24).map(e=>({k:String(e.k||'').slice(0,8),t:n(e.t,0,9e15),b:BDM[e.b]?e.b:undefined,it:IT[e.it]?e.it:undefined,r:RXM[e.r]?e.r:undefined,n:n(e.n,0,9999),s:n(e.s,0,3)}));
 const out=(Array.isArray(d.out)?d.out:[]).slice(0,30).filter(g=>g&&IT[g.it]).map(g=>({id:String(g.id).slice(0,24),it:g.it,n:n(g.n,1,999),t:n(g.t,0,9e15)}));
 const dl=d.daily&&typeof d.daily==='object'?{d:String(d.daily.d||'').slice(0,10),ans:(Array.isArray(d.daily.ans)?d.daily.ans:[]).slice(0,3).map(x=>n(x,0,3)),ok:(Array.isArray(d.daily.ok)?d.daily.ok:[]).slice(0,3).map(Boolean)}:null;
 const dh={};if(d.dhist&&typeof d.dhist==='object')for(const k in d.dhist)if(/^\d{4}-\d\d-\d\d$/.test(k))dh[k]=n(d.dhist[k],0,3);
 return{don,ev,out,daily:dl,dhist:dh,rep:n(d.rep,0,1e7),solved:n(d.solved,0,999),cards:n(d.cards,0,999),wname:String(d.wname||'').slice(0,12),ts:n(d.ts,0,9e15),claimed:(Array.isArray(d.claimed)?d.claimed:[]).slice(-60).map(x=>String(x).slice(0,24))};
}
function pub(){
 const dh={};Object.keys(save.dhist).sort().slice(-21).forEach(k=>dh[k]=save.dhist[k]);
 return{pv:1,don:save.don,ev:save.ev.slice(0,24),out:save.out.slice(0,30),daily:save.daily,dhist:dh,rep:save.rep,solved:Object.keys(save.solved).length,cards:Object.keys(save.quiz).length,claimed:save.claimed.slice(-60)};
}
function scheduleSync(){if(!SY.on)return;clearTimeout(SY.timer);SY.timer=setTimeout(pushMine,2000)}
async function pushMine(){
 if(!SY.on)return;clearTimeout(SY.timer);
 const p=pub(),sv=JSON.stringify(save),key=JSON.stringify(p)+sv;if(key===SY.last)return;
 try{await SY.db.doc(`balance/${PAIR}/players/${ME()}`).set({...p,sv,svt:save.svt||Date.now(),ts:Date.now()});SY.last=key}catch(e){console.warn('sync',e)}
}
async function restore(){
 try{const snap=await SY.db.doc(`balance/${PAIR}/players/${ME()}`).get({source:'server'});if(!snap.exists)return;
  const d=snap.data();if(!d||typeof d.sv!=='string')return;const c=JSON.parse(d.sv);if(!c||!c.v)return;
  const empty=!save.intro&&!Object.keys(save.solved).length;
  if(empty||(+d.svt||0)>(save.svt||0)){save=Object.assign(defSave(),c);clean();_persist();if(empty)toast('☁️ 已從雲端找回你的工房');render()}
 }catch(e){console.warn('restore',e)}
}
function onPartner(raw){
 const prev=P;P=sanitize(raw);
 claimGifts();
 if(prev&&P&&!document.hidden){const ne=P.ev.filter(e=>e.t>(prev.ev[0]?prev.ev[0].t:0));if(ne.length)toast(`${paN()}：${evText(ne[0],PA(),true)}`)}
 if(!$('modal').classList.contains('show'))render();else renderNav();
}
async function initSync(){
 const cfg=window.__FB_CONFIG;if(!cfg||!window.firebase)return;
 try{firebase.initializeApp(cfg);await firebase.auth().signInAnonymously();SY.db=firebase.firestore();
  await restore();SY.on=true;
  SY.db.doc(`balance/${PAIR}/players/${PA()}`).onSnapshot(s=>onPartner(s.exists?s.data():null),e=>console.warn('sync',e));
  pushMine();
 }catch(e){console.warn('sync init',e)}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){save.lastVisit=Date.now();_persist();pushMine()}});
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
function chOpen(c){return c===1||chDoneN(c-1)>=CHNEED[c]}
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
  case'daily':return`做完了今日告示：${e.s}/3`;
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
let TAB='town';
const TABS=[['town','🏘️','城鎮'],['lab','⚗️','工房'],['gather','⛏️','採集'],['daily','📜','告示'],['book','📘','筆記']];
function renderNav(){
 const dDot=!(save.daily&&save.daily.d===todayStr());
 $('nav').innerHTML=TABS.map(([k,ic,n])=>`<button class="${TAB===k?'on':''}" data-tab="${k}"><span>${ic}</span>${n}${k==='daily'&&dDot?'<i class="dot"></i>':''}</button>`).join('');
 $('nav').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{TAB=b.dataset.tab;render();scrollTo(0,0)});
}
function renderHead(){
 $('subt').textContent=`${CHN[curCh()]} · ${meN()}的${HOME[ME()]==='n'?'北方':'南方'}工房`;
 $('hstats').innerHTML=`聲望 <b>${save.rep}</b><br>${rankOf(save.rep)}`;
}
function render(){renderHead();renderNav();const h={town:vTown,lab:vLab,gather:vGather,daily:vDaily,book:vBook}[TAB]();$('main').innerHTML=h;bind();
 $('foot').innerHTML=TAB==='book'?`<button data-a="reset">${resetArm?'再按一次確認（只清除這台裝置與雲端上「你」的進度）':'重置我的進度'}</button>`:'';bind($('foot'))}

// ---- 城鎮 ----
function vTown(){
 let h='';
 // 你離開後
 if(P){
  const since=save.prevVisit||0,ne=P.ev.filter(e=>e.t>since).slice(0,4);
  const ds=P.daily&&P.daily.d===todayStr()?`今日告示 ${P.daily.ok.filter(Boolean).length}/3`:'今天還沒看告示';
  h+=`<div class="banner">${ne.length?`<b>你離開後，${paN()}</b>：<br>${ne.map(e=>'・'+evText(e,PA())).join('<br>')}`:`<b>${paN()}</b> ${P.ts?ago(P.ts)+'來過':'還沒來過'}。`}<div class="small" style="margin-top:3px">${paN()}：聲望 ${P.rep} · ${ds}</div></div>`;
 } else h+=`<div class="banner">${SY.on?`等${paN()}第一次來到這個世界……`:`<span class="small">（目前是單機模式：還沒連上${paN()}的世界，進度只存在這台裝置）</span>`}</div>`;
 [1,2,3,4].forEach(c=>{
  const list=BD.filter(b=>b[1]===c);
  if(!chOpen(c)){h+=`<div class="sec locked">🔒 ${CHN[c]}<small>上一章再完成 ${CHNEED[c]-chDoneN(c-1)} 棟建築就會開啟</small></div>`;return}
  h+=`<div class="sec">${CHN[c]}<small>${chDoneN(c)}/${list.length}</small></div><div class="town">`;
  list.forEach(b=>{const d=bDone(b[0]),[m,q]=bPct(b[0]);const can=!d&&Object.keys(b[4]).some(i=>inv(i)>0&&prog(b[0])[i].me+prog(b[0])[i].pa<b[4][i]);
   const qz=d&&!save.quiz[b[0]];
   h+=`<div class="bld ${d?'done':'wip'}" data-a="bld" data-v="${b[0]}">${can?'<span class="need">● 可捐</span>':''}${qz?'<span class="need">❓</span>':''}<div class="ic">${b[2]}</div><div class="nm">${b[3]}</div>${d?'<div class="small">落成</div>':`<div class="bar"><i style="width:${m*100}%;background:var(--me)"></i><i style="width:${q*100}%;background:var(--her)"></i></div>`}</div>`});
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
 h+=`<div class="legend" style="margin-top:8px"><i style="background:var(--me)"></i>${meN()}<i style="background:var(--her)"></i>${paN()}</div>`;
 for(const i in p){const x=p[i],tot=x.me+x.pa,left=Math.max(0,x.need-tot);
  const a=Math.min(x.me,x.need),bb=Math.min(x.pa,x.need-a);
  h+=`<div class="need"><div class="lbl"><span>${nm(i)} <span class="small">${fm(i)}</span></span><span>${Math.min(tot,x.need)}/${x.need}</span></div><div class="bar"><i style="width:${a/x.need*100}%;background:var(--me)"></i><i style="width:${bb/x.need*100}%;background:var(--her)"></i></div>`;
  if(!d&&left){const have=inv(i);
   h+=have?`<button class="btn gold" data-a="donate" data-v="${id}" data-i="${i}">捐出 ${Math.min(have,left)} 個（倉庫有 ${have}）</button>`
     :`<div class="small">倉庫裡沒有。${isRaw(i)?`可以去「採集」（${SRC[IT[i][4]]}）`:makers(i).length?`工房：${makers(i).map(r=>eqText(r,!!save.solved[r[0]],true)).slice(0,2).join('；')}`:'還沒學會怎麼做'}</div>`}
  h+=`</div>`}
 if(d){
  const tot={};[[save,ME()],[P,PA()]].forEach(([s,w])=>{for(const i in b[4])tot[w]=(tot[w]||0)+donOf(s,id,i)});
  h+=`<div class="plaque">🪧 落成銘牌：${meN()} ×${tot[ME()]||0}　${paN()} ×${tot[PA()]||0}</div>`;
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
 else toast(`已捐出 ${nm(i)}×${n}　聲望 +${n*2}`);
 const before=curCh();persist();
 if(curCh()>before)setTimeout(()=>{toast(`🗺️ 開啟了${CHN[curCh()]}！新的反應與建築`)},1600);
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
function craft(q){
 const r=RXM[CRAFT];if(maxRuns(r)<q)return;
 r[3].forEach(([i,c])=>addInv(i,-c*q));r[4].forEach(([i,c])=>addInv(i,c*q));
 const first=!save.made[r[0]];save.made[r[0]]=(save.made[r[0]]||0)+q;if(first)save.rep+=2;persist();
 toast(`${OPN[r[2]][1]} 得到 ${r[4].map(([i,c])=>nm(i)+'×'+c*q).join('、')}`);
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

// ---- 採集 ----
let REG=null,GQ=null;
function vGather(){
 const home=HOME[ME()];if(!REG)REG=home;
 let h=`<div class="sec">去哪裡採集？</div><div class="regions">${['n','s'].map(r=>`<div class="region ${REG===r?'on':''}" data-a="reg" data-v="${r}"><div class="ic">${r==='n'?'⛰️':'🏖️'}</div><b>${SRC[r]}</b><div class="h">${r===home?'你的工房在這裡：收穫加倍':`${paN()}的地盤：收穫減半`}</div></div>`).join('')}</div>`;
 h+=`<div class="sec">要採什麼？<small>答一題化學（普化＋有機），答對收穫比較多；★★★ 題多給一份</small></div><div class="gl">`;
 Object.keys(IT).filter(i=>IT[i][4]===REG||IT[i][4]==='b').forEach(i=>{h+=`<button class="g" data-a="gat" data-v="${i}"><b>${nm(i)}</b> <span class="small">${fm(i)}</span><small>倉庫 ${inv(i)}</small></button>`});
 h+=`</div><div class="small" style="margin-top:10px">採集問答 ${save.qst[0]+save.qst[1]} 題 · 答對率 ${save.qst[0]+save.qst[1]?Math.round(save.qst[0]/(save.qst[0]+save.qst[1])*100):0}%${save.qwrong.length?` · 錯題 ${save.qwrong.length} 題會再出現`:''}</div>`;
 return h;
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
 if(save.qwrong.length&&Math.random()<.25){const qi=save.qwrong[Math.floor(Math.random()*save.qwrong.length)];if(QB[qi])return{bank:qi}}
 const us=ALLU(),w=us.map(u=>{const[a,b]=uStat(u),n=a+b;return 1+(n?2.5*b/n:0)+(n<3?.6:0)+(UNITS_G.includes(u)?.3:0)});
 let t=Math.random()*w.reduce((x,y)=>x+y,0),u=us[0];for(let i=0;i<us.length;i++){t-=w[i];if(t<=0){u=us[i];break}}
 const L=lvFor(u);
 const gens=GEN.filter(g=>g.u===u&&Math.abs(g.l-L)<=1);
 let bank=QB.map((q,i)=>i).filter(i=>QB[i][3]===u&&Math.abs(QB[i][4]-L)<=1&&QB[i][4]<=L+(uRating(u)-L>.3?1:0)&&!save.qrecent.includes(i));
 if(!bank.length)bank=QB.map((q,i)=>i).filter(i=>QB[i][3]===u&&!save.qrecent.includes(i));
 if(gens.length&&(!bank.length||Math.random()<.4)){const g=gens.filter(x=>x.l===L).length&&Math.random()<.8?gens.filter(x=>x.l===L):gens;return{gen:genQ(g[Math.floor(Math.random()*g.length)],Math.random)}}
 if(!bank.length)return{bank:Math.floor(Math.random()*QB.length)};
 const top=bank.filter(i=>QB[i][4]===L);const c=top.length&&Math.random()<.8?top:bank;return{bank:c[Math.floor(Math.random()*c.length)]};
}
function gather(id){
 const p=pickQ();let Q;
 if(p.gen)Q={q:p.gen.q,o:p.gen.o,ex:p.gen.ex,t:p.gen.t,lv:p.gen.lv,un:p.gen.u,qi:-1};else{const q=QB[p.bank];Q={q:q[0],o:q[1],ex:q[2],t:q[3],lv:q[4],un:'',qi:p.bank}}
 GQ={id,Q,right:Q.o[0],opts:shuffle(Q.o)};
 const reg=IT[id][4],home=reg==='b'||reg===HOME[ME()];
 modal(`<div class="small">${home?'⛏️':'🧭'} 採集 ${nm(id)}　·　<span class="pill">${Q.t}</span><span class="pill">${'★'.repeat(Q.lv)}</span></div><div class="dq">${Q.q}</div>${GQ.opts.map((o,k)=>`<button class="opt" data-a="gans" data-v="${k}">${o} ${Q.un}</button>`).join('')}<div id="qfb"></div>`);
}
function gAns(k,btn){
 const Q=GQ.Q,ok=GQ.opts[k]===GQ.right,reg=IT[GQ.id][4],home=reg==='b'||reg===HOME[ME()];
 document.querySelectorAll('.opt').forEach((x,j)=>{x.disabled=true;if(GQ.opts[j]===GQ.right)x.classList.add('right')});if(!ok)btn.classList.add('wrong');
 const bonus=Q.lv>=3?1:0,n=ok?(home?4:2)+bonus:(home?2:1);addInv(GQ.id,n);save.qst[ok?0:1]++;if(ok)save.rep+=Q.lv;recStat(Q.t,ok,Q.lv);
 if(Q.qi>=0){save.qrecent.push(Q.qi);save.qrecent=save.qrecent.slice(-60);
  if(ok)save.qwrong=save.qwrong.filter(x=>x!==Q.qi);else if(!save.qwrong.includes(Q.qi))save.qwrong.push(Q.qi);}
 persist();
 $('qfb').innerHTML=`<div class="ex">${ok?'<span class="ok">✓ 答對了！</span>':'<span class="bad">✗ 答錯了。</span>'} ${Q.ex}</div><div class="ok" style="text-align:center">得到 ${nm(GQ.id)} ×${n}${home?'':'（不是你的地盤，收穫減半）'}</div><div class="row"><button class="btn gold" style="flex:1" data-a="gat" data-v="${GQ.id}">再採一次</button><button class="btn" style="flex:1" data-a="close">回去</button></div>`;
 bind($('qfb'));
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
 let h=`<div class="sec">單元答對率<small>最弱的排在最上面；採集會多出這些單元</small></div><div class="card"><div class="small" style="margin-bottom:4px">普通化學</div><table class="hist" style="width:100%">${unitRows(UNITS_G)}</table><div class="small" style="margin:8px 0 4px">有機化學</div><table class="hist" style="width:100%">${unitRows(UNITS_O)}</table><div class="small" style="margin-top:6px">長條是最近 10 題的答對率；★ 是這個單元目前的出題難度。每答一題都會微調，目標是讓答對率停在 70% 左右：連續答對就升級，答不出來就降級。</div></div>`;
 h+=`<div class="sec">原理卡<small>${Object.keys(save.quiz).length}/${BD.length}</small></div>`;
 const cs=BD.filter(b=>save.quiz[b[0]]);
 h+=cs.length?cs.map(b=>`<div class="card cardk"><h3>📘 ${b[7][0]}</h3><div class="small">${b[2]} ${b[3]}　·　${b[7][1]}</div></div>`).join(''):`<div class="muted">建築落成後，回答委託人的「為什麼」就能拿到原理卡。</div>`;
 const sol=RX.filter(r=>save.solved[r[0]]);
 h+=`<div class="sec">配平過的方程式<small>${sol.length}/${RX.length}</small></div>`;
 h+=sol.map(r=>`<div class="card"><span class="pill">${r[5]}</span><div class="eq">${eqText(r)}</div><div class="small">${r[6]}</div></div>`).join('')||'<div class="muted">還沒有。</div>';
 h+=`<div class="sec">統計</div><div class="card small">採集問答：答對 ${save.qst[0]}、答錯 ${save.qst[1]}<br>配平失誤：${save.miss} 次<br>${P?`${paN()}：聲望 ${P.rep} · 配平 ${P.solved} 條 · 原理卡 ${P.cards} 張`:''}</div>`;
 return h;
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
  case'reg':REG=v;return render();
  case'gat':return gather(v);
  case'gans':return gAns(+v,el);
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
 <p>醒來時，你在一座陌生大陸的${n?'<b>北方礦山</b>':'<b>南方海岸</b>'}。村民說，那天夜裡被召喚來的不只你一個：還有一個人落在${n?'南方海岸':'北方礦山'}，名字叫<b>${paN()}</b>。</p>
 <p>這裡沒有魔法。他們口中的「白火粉」「龍息」「冥火石」，全是你課本裡的化學。只是這個世界還沒有人會<b>配平</b>。</p>
 <div class="ex">🏘️ 城鎮：你和${paN()}一起把材料送去蓋房子，誰出了多少都刻在銘牌上。<br>⚗️ 工房：第一次做某個反應要先配平，之後就能照比例量產。<br>⛏️ 採集：答一題普化換原料。${n?'北方':'南方'}是你的地盤；另一邊的東西，可以等${paN()}寄過來。<br>📜 告示：每天三題（兩題計算＋一題觀念），兩人同一題，比比看。</div>
 <button class="btn gold" data-a="start">開始</button>`);
 $('modal').querySelector('[data-a=start]').onclick=()=>{save.intro=true;persist();closeM()};
}
// 隱藏開關：連點標題 5 下切換身分（測試用）
let tapN=0,tapT=0;
$('title').onclick=()=>{const t=Date.now();tapN=t-tapT<700?tapN+1:1;tapT=t;if(tapN>=5){tapN=0;
 modal(`<h3>👀 切換視角</h3><div class="muted">目前是：<b>${meN()}</b>。兩個視角的存檔分開保存。</div><button class="btn" data-a="role" data-v="j">傑（北方礦山）</button><button class="btn" data-a="role" data-v="her">彣（南方海岸）</button><button class="btn ghost" data-a="close">取消</button>`);
 $('modal').querySelectorAll('[data-a=role]').forEach(b=>b.onclick=()=>{save.lastVisit=Date.now();_persist();pushMine();try{localStorage.setItem('mb_role',b.dataset.v)}catch(e){}location.reload()})}};

// ===================== 啟動 =====================
save.prevVisit=save.lastVisit||0;save.lastVisit=Date.now();_persist();
render();prologue();
setTimeout(initSync,0);
