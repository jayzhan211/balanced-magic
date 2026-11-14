// ===================== 計算題產生器（數字隨機，答案由程式算） =====================
const SUPD='⁰¹²³⁴⁵⁶⁷⁸⁹';
const supn=n=>String(n).replace('-','⁻').replace(/\d/g,d=>SUPD[d]);
function sci(x,sf=2){if(!isFinite(x))return'?';if(x===0)return'0';let e=Math.floor(Math.log10(Math.abs(x)));let m=(x/10**e).toFixed(sf-1);if(Math.abs(+m)>=10){e++;m=(x/10**e).toFixed(sf-1)}return m+'×10'+supn(e)}
const fmt=x=>{const v=Number((+x).toPrecision(3));return Math.abs(v)!==0&&(Math.abs(v)<1e-3||Math.abs(v)>=1e5)?sci(v,3):String(v).replace('-','−')};
const fx2=x=>(+x).toFixed(2).replace('-','−');
const pick=(a,r)=>a[Math.floor(r()*a.length)];
// 第一個是正解；cands 依序取到四個不重複的選項，不夠就用倍數補
function opts(ans,cands,f=fmt){const s=[f(ans)];for(const c of cands){if(!isFinite(c))continue;const t=f(c);if(!s.includes(t)&&t!=='0'&&t!=='−0')s.push(t);if(s.length===4)return s}
 for(const k of [2,.5,10,.1,3,1.5,4,.25,5,.2]){const t=f(ans*k);if(!s.includes(t))s.push(t);if(s.length===4)break}return s}
const SI=(a,b,r)=>a+Math.floor(r()*(b-a+1));
const GEN=[
// ---- 計量 ----
{u:'計量',l:2,f:r=>{const[A,MA,B,MB,a,b,eq]=pick([['CaCO₃',100,'CaO',56,1,1,'CaCO₃ → CaO + CO₂'],['NaHCO₃',84,'CO₂',44,2,1,'2NaHCO₃ → Na₂CO₃ + H₂O + CO₂'],['KClO₃',122.5,'O₂',32,2,3,'2KClO₃ → 2KCl + 3O₂']],r);
  const mol=pick([.5,1,1.5,2,3],r),m=MA*mol,ans=mol*b/a*MB;
  return{q:`${eq}<br>加熱 ${fmt(m)} g ${A}（M = ${MA}）使其完全分解，可得幾克 ${B}（M = ${MB}）？`,o:opts(ans,[mol*MB,mol*a/b*MB,ans*2]),u:'g',ex:`${fmt(m)} ÷ ${MA} = ${fmt(mol)} mol ${A}；係數比 ${a} : ${b} → ${fmt(mol*b/a)} mol ${B}；× ${MB} = ${fmt(ans)} g。`}}},
{u:'計量',l:2,f:r=>{if(r()<.5){const a=pick([1,2,3,4,5,6],r),b=pick([1,2,3,4],r),ans=Math.min(a,2*b);
   return{q:`2H₂ + O₂ → 2H₂O<br>${a} mol H₂ 與 ${b} mol O₂ 反應，最多生成幾 mol H₂O？`,o:opts(ans,[Math.max(a,2*b),a+b,b,Math.min(a,b)]),u:'mol',ex:`${a} mol H₂ 需要 ${fmt(a/2)} mol O₂。${a<=2*b?`O₂ 夠，H₂ 是限量試劑 → ${a} mol H₂O。`:`O₂ 只有 ${b} mol，是限量試劑 → ${2*b} mol H₂O。`}`}}
  const a=pick([1,2,3,4],r),b=pick([3,6,9,12],r),ans=Math.min(2*a,2*b/3);
  return{q:`N₂ + 3H₂ → 2NH₃（假設完全反應）<br>${a} mol N₂ 與 ${b} mol H₂，最多生成幾 mol NH₃？`,o:opts(ans,[Math.max(2*a,2*b/3),a+b,b/3]),u:'mol',ex:`N₂ 可生成 ${2*a} mol，H₂ 可生成 ${fmt(2*b/3)} mol，取小的：${fmt(ans)} mol。`}}},
{u:'計量',l:1,f:r=>{const pool=RX.filter(x=>[...x[3],...x[4]].length>=3&&[...x[3],...x[4]].some(y=>y[1]>=3));const x=pick(pool,r),sp=[...x[3],...x[4]];const t=pick(sp.filter(y=>y[1]>=2),r);
  const c=[1,2,3,4,5,6,8,10].filter(v=>v!==t[1]);const w=[];while(w.length<3){const v=pick(c,r);if(!w.includes(v))w.push(v)}
  return{q:`配平（最簡整數比）後，${fm(t[0])} 的係數是？<br><span style="font-size:14px">${x[3].map(([i])=>fm(i)).join(' + ')} → ${x[4].map(([i])=>fm(i)).join(' + ')}</span>`,o:[String(t[1]),...w.map(String)],u:'',ex:eqText(x,true,true)}}},
// ---- 溶液 ----
{u:'溶液',l:1,f:r=>{const M1=pick([1,2,3,6],r),V1=pick([25,50,100],r),V2=pick([200,250,500],r),ans=M1*V1/V2;
  return{q:`取 ${V1} mL 的 ${M1} M H₂SO₄，加水稀釋到 ${V2} mL，濃度變為多少 M？`,o:opts(ans,[M1*V2/V1,ans*10,M1*V1/(V2+V1)]),u:'M',ex:`M₁V₁ = M₂V₂：${M1} × ${V1} = M₂ × ${V2}，M₂ = ${fmt(ans)} M。`}}},
{u:'溶液',l:1,f:r=>{const x=pick([2,4,8,10,20],r),V=pick([100,250,500,1000],r),ans=(x/40)/(V/1000);
  return{q:`把 ${x} g NaOH（M = 40）溶成 ${V} mL 溶液，體積莫耳濃度為？`,o:opts(ans,[x/V,(x/40)/V,ans*40]),u:'M',ex:`${x} ÷ 40 = ${fmt(x/40)} mol；÷ ${V/1000} L = ${fmt(ans)} M。`}}},
{u:'溶液',l:2,f:r=>{const[s,i]=pick([['葡萄糖',1],['NaCl',2],['CaCl₂',3],['尿素',1],['MgSO₄',2],['KNO₃',2]],r),m=pick([.1,.2,.25,.5,1],r),ans=-1.86*i*m;
  return{q:`${m} m 的 ${s} 水溶液，凝固點約為幾 °C？（水的 Kf = 1.86 °C/m，視為完全解離）`,o:opts(ans,[-1.86*m,-0.512*i*m,1.86*i*m]),u:'°C',ex:`ΔTf = i Kf m = ${i} × 1.86 × ${m} = ${fmt(-ans)} °C；凝固點 = 0 − ${fmt(-ans)} = ${fmt(ans)} °C。${i>1?`${s} 解離成 ${i} 個粒子。`:''}`}}},
// ---- 氣體 ----
{u:'氣體',l:1,f:r=>{const[g,M]=pick([['O₂',32],['CO₂',44],['N₂',28],['CH₄',16],['NH₃',17]],r),n=pick([.5,1,1.5,2,2.5],r),m=n*M,ans=22.4*n;
  return{q:`0 °C、1 atm 下，${fmt(m)} g 的 ${g}（M = ${M}）體積約為多少 L？`,o:opts(ans,[24.5*n,22.4*m,22.4/n]),u:'L',ex:`${fmt(m)} ÷ ${M} = ${fmt(n)} mol；STP 每莫耳 22.4 L → ${fmt(ans)} L。`}}},
{u:'氣體',l:3,f:r=>{const[g,M]=pick([['CO₂',44],['O₂',32],['N₂',28],['CH₄',16],['SO₂',64],['Ar',40],['NH₃',17]],r);
  const T=pick([25,27,37,100,127],r),P=pick([.5,.8,1,1.5,2],r),n=pick([.1,.15,.2,.25,.3],r);
  const m=+(n*M).toPrecision(3),V=+(n*0.082*(T+273)/P).toPrecision(3),ans=m*0.082*(T+273)/(P*V);
  return{q:`${T} °C、${P} atm 下，體積 ${V} L 的容器中裝有 ${m} g 未知氣體，此氣體的分子量約為？（R = 0.082）`,o:opts(ans,[m*0.082*T/(P*V),m*22.4/V,m*0.082*(T+273)*P/V]),u:'g/mol',ex:`M = mRT / PV = ${m} × 0.082 × ${T+273} ÷ (${P} × ${V}) ≈ ${fmt(ans)}。溫度一定要用絕對溫度。`}}},
// ---- 酸鹼 ----
{u:'酸鹼',l:1,f:r=>{const k=pick([1,2,3,4,5],r);if(r()<.5)return{q:`25 °C 時，1×10⁻${'¹²³⁴⁵'[k-1]} M HCl 的 pH？`,o:opts(k,[14-k,k+1,k===1?3:k-1]),u:'',ex:`強酸完全解離，[H⁺] = 10⁻${'¹²³⁴⁵'[k-1]}，pH = ${k}。`};
  return{q:`25 °C 時，1×10⁻${'¹²³⁴⁵'[k-1]} M NaOH 的 pH？`,o:opts(14-k,[k,13-k,15-k]),u:'',ex:`pOH = ${k}，pH = 14 − ${k} = ${14-k}。`}}},
{u:'酸鹼',l:3,f:r=>{const ac=[['醋酸 CH₃COOH',1.8e-5],['苯甲酸',6.3e-5],['HOCl',3.0e-8],['HCN',4.9e-10]];let a,K,C;do{[a,K]=pick(ac,r);C=pick([1,.5,.1,.05,.01],r)}while(C/K<400);
  const pH=-Math.log10(Math.sqrt(K*C));
  return{q:`${C} M ${a} 溶液的 pH 約為？（Ka = ${sci(K)}）`,o:opts(pH,[-Math.log10(C),-Math.log10(K*C),-Math.log10(K)],fx2),u:'',ex:`弱酸：[H⁺] ≈ √(Ka·C) = √(${sci(K)} × ${C}) = ${sci(Math.sqrt(K*C))}，pH = ${fx2(pH)}。（C/Ka > 400，近似成立）`}}},
{u:'酸鹼',l:3,f:r=>{const[b,K]=pick([['NH₃',1.8e-5],['吡啶 C₅H₅N',1.7e-9]],r),C=pick([1,.5,.1],r),pOH=-Math.log10(Math.sqrt(K*C)),pH=14-pOH;
  return{q:`${C} M ${b} 溶液的 pH 約為？（Kb = ${sci(K)}）`,o:opts(pH,[pOH,14+Math.log10(C),14+Math.log10(K*C)],fx2),u:'',ex:`弱鹼：[OH⁻] ≈ √(Kb·C) = ${sci(Math.sqrt(K*C))}，pOH = ${fx2(pOH)}，pH = 14 − pOH = ${fx2(pH)}。`}}},
{u:'酸鹼',l:3,f:r=>{const[a,b,pKa]=pick([['CH₃COOH','CH₃COONa',4.74],['NH₄Cl','NH₃',9.25],['NaH₂PO₄','Na₂HPO₄',7.21]],r);const[cb,ca]=pick([[.1,.1],[.2,.1],[.1,.2],[.5,.05],[.05,.5]],r);const pH=pKa+Math.log10(cb/ca);
  return{q:`緩衝溶液含 ${ca} M ${a} 與 ${cb} M ${b}，pH 約為？（${a==='NH₄Cl'?'NH₄⁺':a.replace('Na','')} 的 pKa = ${pKa}）`,o:opts(pH,[pKa-Math.log10(cb/ca),pKa,14-pH],fx2),u:'',ex:`Henderson–Hasselbalch：pH = pKa + log([鹼]/[酸]) = ${pKa} + log(${cb}/${ca}) = ${fx2(pH)}。`}}},
{u:'酸鹼',l:2,f:r=>{const Ma=pick([.05,.1,.2],r),Va=pick([10,20,25],r),Mb=pick([.1,.2,.25],r),ans=2*Ma*Va/Mb;
  return{q:`中和 ${Va} mL 的 ${Ma} M H₂SO₄，需要 ${Mb} M NaOH 幾 mL？`,o:opts(ans,[Ma*Va/Mb,Ma*Va/(2*Mb),ans*2]),u:'mL',ex:`H₂SO₄ 是二質子酸：n(OH⁻) = 2 × ${Ma} × ${Va} = ${fmt(2*Ma*Va)} mmol；÷ ${Mb} M = ${fmt(ans)} mL。`}}},
// ---- 溶解度 ----
{u:'溶解度',l:3,f:r=>{const[s,t,K]=pick([['AgCl','AB',1.8e-10],['BaSO₄','AB',1.1e-10],['CaF₂','AB2',3.9e-11],['Mg(OH)₂','AB2',1.8e-11],['PbI₂','AB2',7.1e-9],['Ag₂CrO₄','A2B',1.1e-12]],r);
  const ans=t==='AB'?Math.sqrt(K):Math.cbrt(K/4);const f=x=>sci(x);
  return{q:`${s} 的 Ksp = ${sci(K)}，它在純水中的莫耳溶解度約為多少 M？`,o:opts(ans,t==='AB'?[K,Math.sqrt(K/2),Math.cbrt(K)]:[Math.sqrt(K),Math.cbrt(K),Math.cbrt(K/2)],f),u:'M',ex:t==='AB'?`Ksp = s²，s = √Ksp = ${sci(ans)} M。`:`${t==='AB2'?`Ksp = s(2s)² = 4s³`:`Ksp = (2s)²s = 4s³`}，s = ∛(Ksp/4) = ${sci(ans)} M。`}}},
// ---- 熱化學 ----
{u:'熱化學',l:2,f:r=>{const sets=[
  {eq:'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',R:[['CH₄',1,-74.8]],P:[['CO₂',1,-393.5],['H₂O(l)',2,-285.8]]},
  {eq:'C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(l)',R:[['C₂H₅OH(l)',1,-277.7]],P:[['CO₂',2,-393.5],['H₂O(l)',3,-285.8]]},
  {eq:'CaCO₃(s) → CaO(s) + CO₂(g)',R:[['CaCO₃',1,-1206.9]],P:[['CaO',1,-635.1],['CO₂',1,-393.5]]},
  {eq:'2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s)',R:[['Fe₂O₃',1,-824.2]],P:[['Al₂O₃',1,-1675.7]]},
  {eq:'2NO₂(g) → N₂O₄(g)',R:[['NO₂',2,33.2]],P:[['N₂O₄',1,9.2]]},
  {eq:'N₂(g) + 3H₂(g) → 2NH₃(g)',R:[],P:[['NH₃',2,-46.1]]}];
  const s=pick(sets,r),sum=(L,c)=>L.reduce((t,x)=>t+(c?x[1]:1)*x[2],0);
  const ans=sum(s.P,1)-sum(s.R,1),noC=sum(s.P,0)-sum(s.R,0),all=sum(s.P,1)+sum(s.R,1);
  const data=[...s.R,...s.P].map(x=>`${x[0]} ${fmt(x[2])}`).filter((v,i,a)=>a.indexOf(v)===i).join('、');
  return{q:`已知 ΔHf°（kJ/mol）：${data}（元素為 0）<br>${s.eq} 的 ΔH° = ？`,o:opts(ans,[-ans,noC,all]),u:'kJ',ex:`ΔH° = Σ產物 − Σ反應物（記得乘係數）= ${fmt(sum(s.P,1))} − (${fmt(sum(s.R,1))}) = ${fmt(ans)} kJ。`}}},
{u:'熱化學',l:3,f:r=>{const n=pick([1,2,3,6],r),E=pick([.34,.46,.78,1.1,1.56,.62],r),ans=-n*96485*E/1000;
  return{q:`某電池反應轉移 ${n} 莫耳電子，E°cell = ${E} V，ΔG° 約為多少 kJ？（F = 96485 C/mol）`,o:opts(ans,[-96485*E/1000,-ans,ans*1000]),u:'kJ',ex:`ΔG° = −nFE° = −${n} × 96485 × ${E} J = ${fmt(ans)} kJ。E° > 0 → ΔG° < 0，自發。`}}},
// ---- 電化學 ----
{u:'電化學',l:2,f:r=>{const T=[['Zn',-0.76,2],['Cu',0.34,2],['Ag',0.80,1],['Fe',-0.44,2],['Ni',-0.25,2],['Pb',-0.13,2],['Mg',-2.37,2],['Al',-1.66,3]];let a=pick(T,r),b;do{b=pick(T,r)}while(b===a);if(a[1]<b[1])[a,b]=[b,a];
  const ans=a[1]-b[1];const ion=x=>`${x[0]}${x[2]===1?'⁺':x[2]===2?'²⁺':'³⁺'}`;
  return{q:`以 ${b[0]}｜${ion(b)} 與 ${a[0]}｜${ion(a)} 組成電池，E°cell = ？<br><span class="small">E°(${ion(b)}/${b[0]}) = ${fx2(b[1])} V，E°(${ion(a)}/${a[0]}) = ${fx2(a[1])} V</span>`,o:opts(ans,[a[1]+b[1],-ans,a[1]*b[2]-b[1]*a[2],Math.abs(a[1])+Math.abs(b[1])],x=>fx2(x)),u:'V',ex:`E°cell = E°(陰極) − E°(陽極) = ${fx2(a[1])} − (${fx2(b[1])}) = ${fx2(ans)} V。${a[0]} 被還原（正極），${b[0]} 被氧化（負極）。電位是強度性質，不用乘係數。`}}},
// ---- 氧化還原 ----
{u:'氧化還原',l:2,f:r=>{const[f,e,v]=pick(OXN,r);const s=x=>(x>0?'+':x<0?'−':'')+Math.abs(x);const c=[-4,-3,-2,-1,0,1,2,3,4,5,6,7].filter(x=>x!==v).sort((a,b)=>Math.abs(a-v)-Math.abs(b-v)+(r()-.5)).slice(0,3);
  return{q:`${fsub(f)} 中 ${e} 的氧化數？`,o:[s(v),...c.map(s)],u:'',ex:`一般 O 為 −2、H 為 +1、鹼金屬為 +1（過氧化物、金屬氫化物例外），總和為 0（離子為電荷）。${fsub(f)} 中 ${e} = ${s(v)}。`}}},
// ---- 動力學 ----
{u:'動力學',l:2,f:r=>{const t=pick([2,5,10,20,30],r),k=pick([1,2,3,4,5],r),m0=pick([80,64,160,32,96],r),ans=m0/2**k;
  return{q:`某一級反應半衰期為 ${t} 分鐘，${m0} g 反應物經過 ${t*k} 分鐘後剩下幾克？`,o:opts(ans,[m0/(2*k),m0/2**(k-1),m0/2**(k+1),m0-m0*k/(k+1)]),u:'g',ex:`${t*k} ÷ ${t} = ${k} 個半衰期；${m0} × (1/2)^${k} = ${fmt(ans)} g。`}}},
{u:'動力學',l:3,f:r=>{const a=pick([0,1,2],r),b=pick([0,1,2],r),r0=pick([1.2,1.5,2.0,2.4,3.0],r)*1e-3;
  const w=[0,1,2,3,4].filter(x=>x!==a+b);const o=[String(a+b)];for(const x of w.sort(()=>r()-.5)){if(o.length<4)o.push(String(x))}
  return{q:`A + B → 產物，實驗數據如下，總反應級數為？<br><span style="font-size:13.5px">① [A] 0.10、[B] 0.10 → 速率 ${sci(r0)} M/s<br>② [A] 0.20、[B] 0.10 → 速率 ${sci(r0*2**a)} M/s<br>③ [A] 0.10、[B] 0.20 → 速率 ${sci(r0*2**b)} M/s</span>`,o,u:'',ex:`① → ②：[A] 加倍，速率 ×${2**a} → 對 A ${a} 級。① → ③：[B] 加倍，速率 ×${2**b} → 對 B ${b} 級。總級數 = ${a+b}。`}}},
// ---- 化學平衡 ----
{u:'化學平衡',l:3,f:r=>{const y=pick([.5,.6,.75,.8],r),K=(2*y)**2/(1-y)**2;
  return{q:`1.0 mol H₂ 與 1.0 mol I₂ 置於 1.0 L 容器中，H₂ + I₂ ⇌ 2HI，平衡時 HI 為 ${fmt(2*y)} mol，Kc = ？`,o:opts(K,[2*y/(1-y),y**2/(1-y)**2,(1-y)**2/(2*y)**2]),u:'',ex:`平衡時 H₂ = I₂ = 1 − ${y} = ${fmt(1-y)} M，HI = ${fmt(2*y)} M。Kc = [HI]² / ([H₂][I₂]) = ${fmt(2*y)}² ÷ ${fmt(1-y)}² = ${fmt(K)}。`}}},
// ---- 有機：不飽和度 ----
{u:'有機・結構',l:2,f:r=>{let c,d,n,o,x,h;do{c=SI(3,9,r);d=SI(0,5,r);n=r()<.3?1:0;x=!n&&r()<.3?1:0;o=SI(0,2,r);h=2*c+2+n-x-2*d}while(h<1||d>c);
  const f=`C${c}H${h}${n?'N':''}${o?'O'+(o>1?o:''):''}${x?'Cl':''}`;const cand=[(2*c+2-h)/2,d+1,d-1,d+2,d+3].filter(v=>v>=0&&Number.isInteger(v));
  return{q:`分子式 ${fsub(f)} 的不飽和度（環數 + π 鍵數）是？`,o:opts(d,cand,String),u:'',ex:`不飽和度 = (2C + 2 + N − H − X) / 2 = (${2*c} + 2${n?' + 1':''} − ${h}${x?' − 1':''}) / 2 = ${d}。O 不影響。`}}},
];
const GEN_UNITS=[...new Set(GEN.map(g=>g.u))];
function genQ(g,r){const x=g.f(r);x.t=g.u;x.lv=g.l;return x}
