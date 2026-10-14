const JOIN_URL="#"; // ganti dengan link pendaftaran kelas offline
const START=500000,DAYS=7,PRICE=100000,MARGIN=40000,BE=2.5;
const rp=n=>(n<0?"-":"")+"Rp"+Math.abs(Math.round(n)).toLocaleString("id-ID");
const O={
 obj:{t:"1. Tujuan iklan",o:[{id:"traffic",n:"🖱️ Traffic",d:"Cari orang yang suka klik link",ctr:1.2,chat:.12},{id:"wa",n:"💬 Pesan WA",d:"Cari orang yang mau chat",ctr:1,chat:.35},{id:"sales",n:"🛒 Penjualan",d:"Butuh data & budget cukup",ctr:.9,chat:.25},{id:"aware",n:"📣 Jangkauan",d:"Sebar ke banyak orang",ctr:.5,chat:.05}]},
 aud:{t:"2. Audiens",o:[{id:"broad",n:"🌍 Sangat luas",d:"Semua orang 18–65 se-Indonesia",cpm:18000,ctr:.8,q:.6},{id:"target",n:"🎯 Terarah",d:"Wanita 25–45, kota, suka kue",cpm:30000,ctr:1.1,q:1},{id:"narrow",n:"🔬 Sempit banget",d:"1 kecamatan, 1 minat",cpm:55000,ctr:1.2,q:1.15}]},
 bud:{t:"3. Budget harian",o:[{id:25000,n:"Rp25.000",d:"Hemat, data sedikit"},{id:50000,n:"Rp50.000",d:"Standar"},{id:100000,n:"Rp100.000",d:"Agresif"}]},
 cre:{t:"4. Materi iklan",o:[{id:"plain",n:"🖼️ Foto biasa",d:"Tanpa harga & ajakan",ctr:.6,cta:.7,close:1,fat:2},{id:"good",n:"✨ Foto bagus + CTA",d:"Ada harga & tombol chat",ctr:1.2,cta:1.2,close:1.15,fat:3},{id:"video",n:"🎬 Video proses",d:"Video 15 detik + testimoni",ctr:1.6,cta:1,close:1.1,fat:5}]}
};
const $=id=>document.getElementById(id);
let S,sel,seed;
const rng=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const get=(k,id)=>O[k].o.find(x=>x.id==id);
const show=id=>{["intro","game","end"].forEach(s=>$(s).hidden=s!==id);scrollTo({top:0,behavior:"smooth"})};
function reset(){S={day:0,bal:START,spend:0,sales:0,hist:[],prev:null,streak:0};sel={obj:"wa",aud:"target",bud:50000,cre:"good"};seed=Date.now()%1e9;renderDecisions();update();$("out").hidden=true;$("empty").hidden=false;$("rTitle").textContent="belum ada"}
function renderDecisions(){$("decisions").innerHTML=Object.keys(O).map(k=>`<div class="grp"><b>${O[k].t}</b><div class="opts">${O[k].o.map(o=>`<button class="opt ${sel[k]==o.id?"on":""}" data-k="${k}" data-v="${o.id}"><b>${o.n}</b><small>${o.d}</small></button>`).join("")}</div></div>`).join("");
 document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{sel[b.dataset.k]=isNaN(b.dataset.v)?b.dataset.v:+b.dataset.v;renderDecisions()})}
function sim(){
 const ob=get("obj",sel.obj),au=get("aud",sel.aud),cr=get("cre",sel.cre),bu=sel.bud,p=S.prev;
 const changed=p&&(p.obj!=sel.obj||p.aud!=sel.aud||p.bud!=sel.bud);
 const sameCre=p&&p.cre==sel.cre;S.streak=sameCre?S.streak+1:1;
 let eff=1;const notes=[];
 if(S.day==0||changed){eff*=.8;notes.push(S.day==0?"Hari pertama: Meta masih fase belajar, hasil belum optimal.":"Kamu mengubah setting, jadi Meta belajar ulang dari awal. Jangan terlalu sering ganti-ganti.")}
 if(sel.obj=="sales"&&bu<50000){eff*=.7;notes.push("Objective Penjualan butuh data banyak; budget kecil membuat Meta kesulitan belajar.")}
 let fat=1;const over=S.streak-cr.fat;if(over>0){fat=Math.max(.45,1-.13*over*(sel.aud=="narrow"?2:1));notes.push("Materi yang sama sudah bosan dilihat audiens (frekuensi tinggi). Waktunya ganti materi.")}
 const n=()=>.88+rng()*.24;
 const cpm=au.cpm*(sel.aud=="narrow"&&bu>50000?1.25:1)*n()/(eff<.8?1:1);
 const imp=bu/cpm*1000,ctr=1*cr.ctr*ob.ctr*au.ctr*fat*n();
 const clicks=imp*ctr/100,chatRate=Math.min(.6,ob.chat*au.q*cr.cta*eff*n());
 const chats=clicks*chatRate,sales=chats*.2*au.q*cr.close*n();
 const r=x=>{const f=Math.floor(x);return f+(rng()<x-f?1:0)};
 const R={imp:Math.round(imp),clicks:r(clicks),chats:r(chats),sales:r(sales),spend:bu};
 R.cpm=cpm;R.ctr=R.imp?R.clicks/R.imp*100:0;R.cpc=R.clicks?bu/R.clicks:0;R.rev=R.sales*PRICE;R.roas=R.rev/bu;R.profit=R.sales*MARGIN-bu;
 if(R.ctr<.8)notes.push(`CTR ${R.ctr.toFixed(2).replace(".",",")}% rendah: materi iklan kurang menarik perhatian.`);
 if(cpm>45000)notes.push("CPM mahal: audiensmu terlalu sempit sehingga Meta rebutan sedikit orang.");
 if(sel.obj=="aware")notes.push("Jangkauan luas, tapi tujuan ini bukan untuk menjual. Lihat jumlah chat-nya.");
 if(R.chats>2&&R.sales==0)notes.push("Ada chat tapi belum ada yang beli. Cek harga, ajakan, dan kecepatan balas.");
 if(R.roas<BE&&R.sales>0)notes.push(`ROAS ${R.roas.toFixed(1).replace(".",",")}× di bawah titik impas 2,5×, jadi masih rugi.`);
 if(R.roas>=BE)notes.push(`ROAS ${R.roas.toFixed(1).replace(".",",")}× di atas titik impas 2,5×. Untung! 🎉`);
 S.prev={...sel};R.notes=notes.slice(0,3);return R}
function play(){if(S.day>=DAYS)return;const R=sim();S.day++;S.bal+=R.profit;S.spend+=R.spend;S.sales+=R.sales;S.hist.push(R.profit);S.last=R;render(R);if(S.day>=DAYS)setTimeout(finish,2200)}
function render(R){
 $("empty").hidden=true;$("out").hidden=false;$("rTitle").textContent="Hari "+S.day;
 const m=(l,v,c="",t="")=>`<div class="met ${c}" title="${t}"><small>${l}</small><b>${v}</b></div>`,f=x=>Math.round(x).toLocaleString("id-ID");
 $("mets").innerHTML=m("Laba/rugi hari ini",`<span class="${R.profit>=0?"good":"bad"}">${R.profit>=0?"+":""}${rp(R.profit)}</span>`,"big")+m("Tayang (impresi)",f(R.imp),"","Berapa kali iklan muncul")+m("Klik",f(R.clicks))+m("Chat WA",f(R.chats))+m("Pembeli",R.sales)+m("CPM",rp(R.cpm),"","Biaya per 1.000 tayangan")+m("CTR",R.ctr.toFixed(2).replace(".",",")+"%","","% orang yang klik")+m("CPC",R.clicks?rp(R.cpc):"-","","Biaya per klik")+m("ROAS",R.roas.toFixed(1).replace(".",",")+"×","","Omzet ÷ biaya iklan. Impas 2,5×");
 $("ins").innerHTML=R.notes.map(x=>`<p>💡 ${x}</p>`).join("");update()}
function update(){
 $("sDay").textContent=Math.min(S.day+1,DAYS)+"/"+DAYS;$("dNum").textContent=Math.min(S.day+1,DAYS);
 const b=$("sBal");b.textContent=rp(S.bal);b.className=S.bal>START?"pos":S.bal<START?"neg":"";
 $("sSpend").textContent=rp(S.spend);$("sSales").textContent=S.sales;
 $("dots").innerHTML=Array.from({length:DAYS},(_,i)=>`<i class="${i<S.day?"done":i==S.day?"now":""}"></i>`).join("");
 const mx=Math.max(50000,...S.hist.map(Math.abs));
 $("bars").innerHTML=Array.from({length:DAYS},(_,i)=>{const v=S.hist[i];if(v==null)return`<div class="bar"><small style="color:#aab">H${i+1}</small></div>`;const h=Math.max(4,Math.abs(v)/mx*45);return`<div class="bar ${v>=0?"p":"n"}"><span style="${v>=0?"":"order:2"}">${(v/1000).toFixed(0)}rb</span><i style="height:${h}px;${v>=0?"":"order:1"}"></i></div>`}).join("")}
function finish(){
 const net=S.bal-START,roas=S.spend?(S.sales*PRICE)/S.spend:0;
 const v=net>=150000?["🏆","Juragan Iklan!","Keputusanmu tajam. Tinggal buktikan di akun asli."]:net>=0?["😎","Cuan Tipis, Aman!","Kamu lolos dari boncos. Masih banyak ruang untuk di-scale."]:net>-150000?["😅","Hampir Impas","Sedikit lagi. Satu-dua keputusan tadi menahan labamu."]:["😭","Boncos Berat!","Tenang, ini uang mainan. Di dunia nyata, di sinilah ilmu lanjutan menyelamatkanmu."];
 $("eEmoji").textContent=v[0];$("eTitle").innerHTML=`<mark>${v[1]}</mark>`;$("eSub").textContent=v[2];
 $("eMets").innerHTML=`<div class="met big"><small>Laba/rugi total</small><b class="${net>=0?"good":"bad"}">${net>=0?"+":""}${rp(net)}</b></div><div class="met"><small>Saldo akhir</small><b>${rp(S.bal)}</b></div><div class="met"><small>Total pembeli</small><b>${S.sales}</b></div><div class="met"><small>ROAS total</small><b>${roas.toFixed(1).replace(".",",")}×</b></div>`;
 $("join").href=JOIN_URL;show("end")}
$("start").onclick=()=>{reset();show("game")};
$("run").onclick=play;
const skip=k=>()=>{for(let i=0;i<k&&S.day<DAYS;i++)play()};
$("skip").onclick=skip(1);$("skip3").onclick=skip(3);
$("again").onclick=()=>{reset();show("game")};
reset();
