const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8');
const m=src.match(/\/\/ @@DATA_START([\s\S]*)\/\/ @@DATA_END/); const code=m?m[1]:src;
const F=new Function(code.split('// ===================== 擴充題庫')[0]+';return {IT,RX,BD,QB,OXN,NOBAL};');const {IT,RX,BD,QB,OXN,NOBAL}=F();
function parseGroup(s){const st=[{}];let i=0;while(i<s.length){const ch=s[i];
 if(ch==='('){st.push({});i++;continue}
 if(ch===')'){i++;let n='';while(/\d/.test(s[i]||''))n+=s[i++];const g=st.pop(),k=+(n||1);for(const e in g)st[st.length-1][e]=(st[st.length-1][e]||0)+g[e]*k;continue}
 const mm=s.slice(i).match(/^([A-Z][a-z]?)(\d*)/);if(!mm)throw Error('bad '+s);i+=mm[0].length;st[st.length-1][mm[1]]=(st[st.length-1][mm[1]]||0)+ +(mm[2]||1)}
 return st[0]}
function parseF(f){const t={};f.split('·').forEach(p=>{const mm=p.match(/^(\d+)(.*)$/);const k=mm?+mm[1]:1;const g=parseGroup(mm?mm[2]:p);for(const e in g)t[e]=(t[e]||0)+g[e]*k});return t}
let bad=0;
function rank(M){M=M.map(r=>r.slice());let r=0;const cols=M[0].length;for(let c=0;c<cols&&r<M.length;c++){let p=-1;for(let i=r;i<M.length;i++)if(Math.abs(M[i][c])>1e-9){p=i;break}if(p<0)continue;[M[r],M[p]]=[M[p],M[r]];for(let i=0;i<M.length;i++)if(i!==r){const f=M[i][c]/M[r][c];for(let j=0;j<cols;j++)M[i][j]-=f*M[r][j]}r++}return r}
const gcd=(a,b)=>b?gcd(b,a%b):a;
for(const [id,ch,op,L,R] of RX){
 for(const [x] of [...L,...R]) if(!IT[x]){console.log('missing item',id,x);bad++}
 const sp=[...L.map(([x,c])=>[x,c,1]),...R.map(([x,c])=>[x,c,-1])];
 const els=[...new Set(sp.flatMap(([x])=>Object.keys(parseF(IT[x][1]))))];
 const M=els.map(e=>sp.map(([x,c,s])=>s*(parseF(IT[x][1])[e]||0)));
 for(const e of els){let t=0;sp.forEach(([x,c,s])=>t+=s*c*(parseF(IT[x][1])[e]||0));if(t){console.log('UNBALANCED',id,e,t);bad++}}
 const g=sp.map(s=>s[1]).reduce(gcd);if(g!==1){console.log('not lowest',id);bad++}
 const nul=sp.length-rank(M);if(nul!==1&&!NOBAL[id]){console.log('NULLITY',id,nul);bad++}
}
// recipes reachable from raw
const raw=new Set(Object.keys(IT).filter(k=>IT[k][4]));const have=new Set(raw);let ch=true;
while(ch){ch=false;RX.forEach(r=>{if(r[3].every(([x])=>have.has(x)))r[4].forEach(([x])=>{if(!have.has(x)){have.add(x);ch=true}})})}
Object.keys(IT).forEach(k=>{if(!have.has(k)){console.log('unreachable',k);bad++}});
// building items reachable within chapter
BD.forEach(b=>{const okc=new Set(raw);let c2=true;while(c2){c2=false;RX.filter(r=>r[1]<=b[1]).forEach(r=>{if(r[3].every(([x])=>okc.has(x)))r[4].forEach(([x])=>{if(!okc.has(x)){okc.add(x);c2=true}})})}
 for(const x in b[4]){if(!IT[x]){console.log('bd item missing',b[0],x);bad++}else if(!okc.has(x)){console.log('bd item not reachable by ch',b[0],x);bad++}}
 if(new Set(b[6].o).size!==4){console.log('dup opts',b[0]);bad++}});
QB.forEach((q,i)=>{if(new Set(q[1]).size!==4){console.log('qb dup',i);bad++}});
OXN.forEach(([f,e,n])=>{const p=parseF(f);let s=0;const known={K:1,Na:1,H:1,O:-2,Cl:-1};
 for(const x in p){if(x===e)continue;let v=known[x];if(f==='NaH'&&x==='Na')v=1;if(f==='H2O2'&&x==='H')v=1;if(v===undefined){console.log('oxn?',f,x);bad++;return}s+=v*p[x]}
 if(e==='H'&&f==='NaH'){} const calc=-s/p[e];if(Math.abs(calc-n)>1e-9){console.log('OXN wrong',f,e,n,calc);bad++}});
console.log('items',Object.keys(IT).length,'rx',RX.length,'bd',BD.length,'qb',QB.length,'bad',bad);
// ---- 題庫與產生器 ----
{
 const m2=src.match(/\/\/ @@DATA_START([\s\S]*)\/\/ @@DATA_END/);
 if(m2){
  const app=src.split('// @@DATA_END')[1].split('</script>')[0];
  const stub=`const document={getElementById:()=>({}),addEventListener(){},querySelectorAll:()=>[]};const localStorage={getItem:()=>null,setItem(){}};const window={};function addEventListener(){};`;
  const helpers=app.match(/const SUBD[\s\S]*?const shuffle=[^\n]*\n/)[0]+app.match(/function eqText[\s\S]*?\n}\n/)[0];
  const G=new Function(stub+m2[1]+helpers+';return {QB,GEN,UNITS_G,UNITS_O,genQ,RX};')();
  const U=new Set([...G.UNITS_G,...G.UNITS_O]);let b2=0;
  G.QB.forEach((q,i)=>{if(q.length!==5||!U.has(q[3])||![1,2,3].includes(q[4])||new Set(q[1]).size!==4){console.log('QB bad',i,q[0],q[3],q[4]);b2++}});
  const seen=new Set();G.QB.forEach(q=>{if(seen.has(q[0]))console.log('dup q',q[0]);seen.add(q[0])});
  G.GEN.forEach((g,gi)=>{if(!U.has(g.u)){console.log('gen unit',g.u);b2++}
   let r=1;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647};
   for(let k=0;k<800;k++){const x=G.genQ(g,rnd);const s=x.o.join('|');if(x.o.length!==4||new Set(x.o).size!==4||/NaN|undefined|Infinity|\?/.test(s+x.q+x.ex)){console.log('GEN bad',gi,g.u,x.o,x.q.slice(0,60));b2++;break}}});
  const cnt={};G.QB.forEach(q=>cnt[q[3]]=(cnt[q[3]]||0)+1);
  console.log('QB',G.QB.length,'gens',G.GEN.length,'bad',b2);console.log(JSON.stringify(cnt));
  const noq=[...U].filter(u=>!cnt[u]);if(noq.length)console.log('units without bank',noq);
 }
}
