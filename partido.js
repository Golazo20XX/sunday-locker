// ===== SUNDAY LOCKER · partido.js · margen superior, pantalla de inicio, menú Más y Partido lado a lado =====
(function(){var st=document.createElement('style');st.textContent=[
// 1) pantalla de inicio por encima de todo (antes la barra inferior la cortaba)
'#splash{z-index:200!important}',
// 2) margen superior: más aire bajo el encabezado y pestañas pegadas justo debajo
'header{padding-top:calc(12px + env(safe-area-inset-top))!important}',
'main{padding-top:18px}',
'.tabs{margin-top:-8px!important}',
// 3) menú Más / alertas: hoja completa que tapa la barra inferior
'#more{z-index:70!important}',
'#more .pn{bottom:0!important;max-height:90vh!important;padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}',
// 4) Partido lado a lado
'.pmh{display:grid;grid-template-columns:1fr 34px 1fr;align-items:end;gap:6px;padding:0 2px 8px;border-bottom:1px solid var(--ln);margin-bottom:2px}',
'.pmh .t{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmh .t.R{text-align:right}',
'.pmr{display:grid;grid-template-columns:1fr 34px 1fr;align-items:center;gap:6px;padding:7px 0;border-top:1px solid var(--ln)}.pmr:first-of-type{border-top:0}',
'.pmc{display:flex;align-items:center;gap:7px;min-width:0;background:none;border:0;color:var(--tx);padding:0;text-align:left}.pmc.R{flex-direction:row-reverse;text-align:right}.pmc:active{opacity:.6}',
'.pmc .av{width:28px;height:28px;font-size:9px}.pmc .b{flex:1;min-width:0}',
'.pmc .n{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmc .s{font-size:10px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.pmc .p{font-size:15px;font-weight:700;min-width:34px}.pmc.L .p{text-align:right}.pmc.R .p{text-align:left}.pmc .p.w{color:var(--li)}',
'.pmc.e{color:var(--mu);font-size:12px;justify-content:center}',
'.pms{display:flex;justify-content:center}.pms .pos{width:34px;height:24px;border-radius:7px;font-size:9.5px}',
'.pmt{font-size:10.5px;color:var(--mu);letter-spacing:1.2px;text-transform:uppercase;font-weight:600;margin:14px 2px 4px;text-align:center}',
'.pmtot{display:grid;grid-template-columns:1fr 34px 1fr;gap:6px;padding:9px 0 2px;border-top:1px solid var(--ln);margin-top:4px;font-weight:800}.pmtot .L{text-align:right}.pmtot .m{text-align:center;font-size:10px;color:var(--mu);align-self:center}',
'.pml{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;width:100%;padding:12px 4px;background:none;border:0;border-top:1px solid var(--ln);color:var(--tx);text-align:left}.pml:first-child{border-top:0}.pml:active{background:rgba(255,255,255,.035);border-radius:10px}',
'.pml.me{background:#151d10;border:1px solid #2e3d1c;border-radius:12px;padding:12px 8px;margin-bottom:6px}',
'.pml .n{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pml .n.R{text-align:right}',
'.pml .sc{text-align:center;white-space:nowrap}.pml .sc b{font-size:15px;font-weight:700}.pml .sc b.w{color:var(--li)}.pml .sc i{font-style:normal;color:var(--mu);margin:0 6px}',
'.pml .sm2{grid-column:1 / -1;display:flex;align-items:center;gap:8px;font-size:10.5px;color:var(--mu)}.pml .sm2 .pbar{flex:1;margin:0}',
'.pmbk{display:inline-flex;align-items:center;gap:4px;background:var(--gr2);border:1px solid var(--ln);color:var(--tx);border-radius:16px;padding:6px 12px 6px 8px;font-size:12px;font-weight:600;margin-bottom:12px}.pmbk svg{width:16px;height:16px}',
'@media (max-width:360px){.pmc .av{display:none}}'
].join('');document.head.appendChild(st)})();

// el alto del encabezado cambia cuando cargan el logo y las fuentes: mantener --hh al día
(function(){var hd=document.querySelector('header');if(!hd)return;var f=function(){document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px')};
 if(window.ResizeObserver)new ResizeObserver(f).observe(hd);addEventListener('load',f);setTimeout(f,800)})();

var PM={c:{},t:{},busy:{},orig:V.matchup,pushed:false};
var PM_ORD={QB:1,RB:2,WR:3,TE:4,K:5,DST:6,DEF:6};

function pmFetch(w){var lid=R.liga_id,key=lid+'|'+w;if(PM.busy[key])return;PM.busy[key]=1;PM.t[key]=Date.now();
 jget(SLP+'league/'+lid+'/matchups/'+w).then(function(m){PM.c[key]=m;PM.busy[key]=0;pmRerender()})
  .catch(function(e){PM.busy[key]=0;if(!PM.c[key])PM.c[key]={err:e.message};pmRerender()})}
function pmRerender(){if(S.tab!=='matchup'||NV.ov==='m')return;var a=document.activeElement;if(a&&a.tagName==='INPUT')return;var y=scrollY;render();scrollTo(0,y)}
function pmData(w){var key=R.liga_id+'|'+w,d=PM.c[key];
 if(!d){pmFetch(w);return null}
 if(w===wkBase()&&Date.now()-(PM.t[key]||0)>60000)pmFetch(w); // semana actual: refresca cada minuto
 return d}
function pmNames(){return (typeof SL!=='undefined'&&SL.names)||(typeof LV!=='undefined'&&LV.names)||{}}
function pmMyRid(names){for(var k in names)if(names[k]===R.equipo)return +k;return null}
function pmProyMap(w){var m={};if(w!==wkBase())return m;rows('App_RankSemana').forEach(function(r){if(typeof r.Proy==='number')m[r.Jugador]=r.Proy});return m}
function pmPairs(d){var by={};d.forEach(function(m){if(m.matchup_id==null)return;(by[m.matchup_id]=by[m.matchup_id]||[]).push(m)});return by}
function pmPts(m){return typeof m.points==='number'?m.points:0}
function pmQ(s){return esc(s).replace(/'/g,"\\'")}

// una celda (jugador) de un lado
function pmCell(x,side,win){if(!x)return '<div class="pmc e">—</div>';
 if(x.empty)return '<div class="pmc '+side+' e">Vacío</div>';
 var sub=esc(x.nfl||'')+(x.proy!=null?' · Proy '+n(x.proy):'');
 return '<button class="pmc '+side+'" onclick="openP(\''+pmQ(x.nm)+'\')">'+av(x.nm,x.nfl,x.pos)+'<div class="b"><div class="n">'+esc(x.nm)+'</div><div class="s">'+sub+'</div></div><div class="p'+(win?' w':'')+'">'+(x.pts==null?'—':n(x.pts))+'</div></button>'}
function pmRow(slot,a,b){var pa=a&&!a.empty?(+a.pts||0):null,pb2=b&&!b.empty?(+b.pts||0):null;
 return '<div class="pmr">'+pmCell(a,'L',pa!=null&&pb2!=null&&pa>pb2)+'<div class="pms">'+pb(slot)+'</div>'+pmCell(b,'R',pa!=null&&pb2!=null&&pb2>pa)+'</div>'}

function pmSide(m,ix,pr){var pp=m.players_points||{},st=(m.starters||[]),inSt={};
 var mk=function(id){if(!id||id==='0')return {empty:true};var x=wkName(id,ix);return {nm:x.nm,pos:x.pos==='DEF'?'DST':x.pos,nfl:x.nfl,pts:pp[id]!=null?+pp[id]:0,proy:pr[x.nm]!=null?pr[x.nm]:null}};
 var s=st.map(function(id){inSt[id]=1;return mk(id)});
 var bn=(m.players||[]).filter(function(id){return !inSt[id]}).map(mk).sort(function(a,b){return (PM_ORD[a.pos]||9)-(PM_ORD[b.pos]||9)||(b.proy||0)-(a.proy||0)||(b.pts||0)-(a.pts||0)});
 var tp=0;s.forEach(function(x){if(!x.empty&&x.proy!=null)tp+=x.proy});return {st:s,bn:bn,proy:tp}}

// detalle de un partido: los dos equipos lado a lado, posición por posición, con banca
function pmDuel(A,B,nA,nB,w,prob){var ix=lvIdx(),pr=pmProyMap(w),a=pmSide(A,ix,pr),b=B?pmSide(B,ix,pr):{st:[],bn:[],proy:0};
 var slots=String(R.slots||'').split(',').filter(function(s){return s&&s!=='BN'});
 var ptA=pmPts(A),ptB=B?pmPts(B):0,cur=w===wkBase(),past=w<wkBase();
 var lbl=function(v){return cur&&v?'<div class="lbl">Proy. '+n(v)+'</div>':''};
 var h='<div class="vs"><div class="side">'+shield('#C8F36A')+'<div class="nm">'+esc(nA)+'</div><div class="pts">'+n(ptA)+'</div>'+lbl(a.proy)+'</div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(nB)+'</div><div class="pts">'+n(ptB)+'</div>'+lbl(b.proy)+'</div></div>';
 if(past)h+='<div style="text-align:center;margin-top:12px"><span class="res '+(ptA>=ptB?'w':'l')+'">'+(ptA===ptB?'EMPATE':ptA>ptB?'GANÓ '+esc(nA):'GANÓ '+esc(nB))+' · '+(ptA-ptB>=0?'+':'')+n(ptA-ptB)+'</span></div>';
 else if(typeof prob==='number')h+='<div class="prob"><i style="width:'+Math.round(prob*100)+'%"></i></div><div class="sm mu" style="margin-top:6px">Prob. de ganar '+esc(nA)+' <b class="l">'+p(prob)+'</b></div>';
 var out=card('',h);
 var g='<div class="pmh"><div class="t">'+esc(nA)+'</div><div></div><div class="t R">'+esc(nB)+'</div></div>';
 var nS=Math.max(a.st.length,b.st.length);for(var i=0;i<nS;i++){var s=slots[i]||((a.st[i]&&a.st[i].pos)||(b.st[i]&&b.st[i].pos)||'');g+=pmRow(s==='SUPER_FLEX'?'SFLEX':s,a.st[i],b.st[i])}
 g+='<div class="pmtot"><div class="L">'+n(ptA)+'</div><div class="m">TOTAL</div><div>'+n(ptB)+'</div></div>';
 // banca: alineada por posición para comparar lado a lado
 var grp=function(list){var o={};list.forEach(function(x){var k=x.pos||'?';(o[k]=o[k]||[]).push(x)});return o},ga=grp(a.bn),gb=grp(b.bn);
 var ps=Object.keys(ga).concat(Object.keys(gb)).filter(function(k,i,arr){return arr.indexOf(k)===i}).sort(function(x,y){return (PM_ORD[x]||9)-(PM_ORD[y]||9)});
 var bh='';ps.forEach(function(k){var la=ga[k]||[],lb=gb[k]||[];for(var j=0;j<Math.max(la.length,lb.length);j++)bh+=pmRow(k,la[j],lb[j])});
 if(bh)g+='<div class="pmt">Banca</div>'+bh;
 out+=card('Titulares',g,cur?'<span>Pts</span>':'');
 if(cur)out+='<div class="note" style="margin:-6px 4px 14px">Puntos en vivo desde Sleeper (se actualizan cada minuto). "Proy" es la proyección del modelo para la semana.</div>';
 return out}

function pmProbFor(nA,nB){var r=rows('App_Partidos').filter(function(r){var t=String(r.Partido).split(' vs ');return (t[0]===nA&&t[1]===nB)||(t[0]===nB&&t[1]===nA)})[0];
 if(!r)return null;var t=String(r.Partido).split(' vs ');return t[0]===nA?{p:r.P1,pa:r.Proy1,pb:r.Proy2}:{p:r.P2,pa:r.Proy2,pb:r.Proy1}}

// lista de partidos de la liga: una línea por partido
function pmList(d,names,rid,w){var by=pmPairs(d),cur=w===wkBase(),past=w<wkBase();
 var keys=Object.keys(by).sort(function(x,y){var mx=by[x].some(function(m){return m.roster_id===rid}),my=by[y].some(function(m){return m.roster_id===rid});return (my?1:0)-(mx?1:0)||x-y});
 var h=keys.map(function(k){var pr=by[k];if(pr.length<2)return '';
  if(pr[1].roster_id===rid)pr=[pr[1],pr[0]];var A=pr[0],B=pr[1],nA=names[A.roster_id]||('Equipo '+A.roster_id),nB=names[B.roster_id]||('Equipo '+B.roster_id),a=pmPts(A),b=pmPts(B);
  var me=A.roster_id===rid,pi=cur?pmProbFor(nA,nB):null,ext='';
  if(pi&&typeof pi.p==='number')ext='<div class="sm2"><span>'+p(pi.p)+'</span><div class="pbar"><i style="width:'+Math.round(pi.p*100)+'%"></i></div><span>'+p(1-pi.p)+'</span></div>';
  if(cur&&pi&&a===0&&b===0)ext='<div class="sm2"><span>Proy. '+n(pi.pa)+'</span><div class="pbar"><i style="width:'+Math.round((+pi.p||0)*100)+'%"></i></div><span>Proy. '+n(pi.pb)+'</span></div>';
  return '<button class="pml'+(me?' me':'')+'" onclick="pmOpen('+k+')"><div class="n">'+esc(nA)+'</div><div class="sc"><b class="'+(a>b&&(past||a+b>0)?'w':'')+'">'+n(a)+'</b><i>–</i><b class="'+(b>a&&(past||a+b>0)?'w':'')+'">'+n(b)+'</b></div><div class="n R">'+esc(nB)+'</div>'+ext+'</button>'}).join('');
 return card('Partidos de la semana '+w,h||'<div class="empty">Sin partidos.</div>','<span>Toca para ver</span>')}

function pmOpen(k){S.sub.pm=R.liga_id+'|'+(WK.sel||wkBase())+'|'+k;history.pushState({v:snap(),pm:1},'');NV.n++;PM.pushed=true;render();scrollTo(0,0)}
function pmClose(){if(PM.pushed){PM.pushed=false;history.back()}else{S.sub.pm='';render()}}
addEventListener('popstate',function(e){if(S.sub.pm&&!(e.state&&e.state.pm)){S.sub.pm='';PM.pushed=false;if(S.tab==='matchup')render()}});

// vistas originales (Temporada, Posiciones, Power, semanas futuras) sin la barra de semanas ni pestañas repetidas
function pmOrig(mt){var sv=S.sub.mt,ws=WK.sel;S.sub.mt=mt;WK.sel=null;var h=PM.orig();S.sub.mt=sv;WK.sel=ws;
 return h.replace(/^<div class="seg wkb">[\s\S]*?<\/div>/,'').replace(/<div class="tabs">[\s\S]*?<\/div>/,'')}

V.matchup=function(){var b=wkBase(),w=WK.sel||b;
 if(w>b)return PM.orig(); // semanas futuras: se mantiene la proyección por semana
 var h=wkBar();if(w!==b)h+='<div class="wkh"><b>Semana '+w+'</b><button onclick="pickWk('+b+')">Volver a la actual</button></div>';
 var opts=w===b?['Mi partido','Liga','Temporada','Posiciones','Power']:['Mi partido','Liga'],t=cur('pt','Mi partido');if(opts.indexOf(t)<0)t='Mi partido';S.sub.pt=t;
 h+=tabs('pt',opts);
 if(t==='Temporada')return h+pmOrig('Temporada');
 if(t==='Posiciones')return h+pmOrig('Liga');
 if(t==='Power')return h+pmOrig('Power');
 var d=pmData(w);if(!d)return h+'<div class="sk" style="height:150px"></div><div class="sk" style="height:420px"></div>';
 if(d.err)return h+card('Semana '+w,'<div class="empty">No se pudo leer Sleeper: '+esc(d.err)+'</div>');
 var names=pmNames(),rid=pmMyRid(names);
 if(rid==null){if(typeof slLoad==='function')slLoad(false);return h+card('Semana '+w,'<div class="empty">Cargando equipos de Sleeper…</div>')}
 var by=pmPairs(d),pk=String(S.sub.pm||'').split('|');
 // detalle de otro partido de la liga
 if(t==='Liga'&&pk[0]===String(R.liga_id)&&+pk[1]===w&&by[pk[2]]){var pr=by[pk[2]];if(pr[1]&&pr[1].roster_id===rid)pr=[pr[1],pr[0]];
  var nA=names[pr[0].roster_id]||'',nB=pr[1]?(names[pr[1].roster_id]||''):'—',pi=w===b?pmProbFor(nA,nB):null;
  return h+'<button class="pmbk" onclick="pmClose()">'+svg('back',2)+'Partidos de la liga</button>'+pmDuel(pr[0],pr[1],nA,nB,w,pi&&pi.p)}
 if(t==='Liga')return h+pmList(d,names,rid,w);
 // mi partido
 var me=d.filter(function(m){return m.roster_id===rid})[0];
 if(!me||me.matchup_id==null)return h+card('Semana '+w,'<div class="empty">No tuviste partido esta semana.</div>');
 var op=(by[me.matchup_id]||[]).filter(function(m){return m.roster_id!==rid})[0];
 var opN=op?(names[op.roster_id]||('Equipo '+op.roster_id)):'—';
 h+=pmDuel(me,op,R.equipo,opN,w,w===b?R.prob_ganar:null);
 if(w===b)h+=card('Claves','<div class="kv"><span>Prob. de ganar</span><b class="l">'+p(R.prob_ganar)+'</b><span>Prob. (simulación)</span><b>'+p(R.prob_ganar_sim)+'</b><span>Playoffs si gano / pierdo</span><b>'+p(R.playoffs_si_gano)+' / '+p(R.playoffs_si_pierdo)+'</b></div><button class="btn sec" style="margin:14px 0 0" onclick="setSub(\'pt\',\'Liga\')">Ver todos los partidos de la liga</button>');
 return h};

// al tocar Actualizar también se vuelven a leer los partidos
(function(){var _d=doRefresh;doRefresh=function(){PM.t={};var r=_d();if(D&&R.liga_id&&S.tab==='matchup')pmFetch(WK.sel||wkBase());return r}})();
// al cambiar de semana se cierra el detalle abierto
(function(){var _p=pickWk;pickWk=function(w){S.sub.pm='';_p(w)}})();

render();
// ---------- barra inferior siempre fija abajo (no se mueve al cambiar de pestaña) ----------
(function(){var st=document.createElement('style');st.textContent=[
'html{height:100%;overscroll-behavior-y:none}body{min-height:100%}',
'nav#nv{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;transform:translateZ(0);height:calc(62px + env(safe-area-inset-bottom))!important;align-items:flex-start!important;box-sizing:border-box}',
'nav#nv button{min-width:0;height:48px;justify-content:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px}',
'main{min-height:calc(100vh - var(--hh,54px) - 62px)}'
].join('');document.head.appendChild(st)})();
// ---------- Posiciones: orden por récord actual (victorias, luego PF), con % de playoffs al lado ----------
function pmRec(s){var m=String(s||'').split('-').map(function(x){return +x||0});return {w:m[0]||0,l:m[1]||0,t:m[2]||0}}
function pmPosiciones(){var rs=rows('App_Posiciones').filter(function(r){return r.Equipo}).slice().sort(function(a,b){var x=pmRec(a['Récord']),y=pmRec(b['Récord']);
  return (y.w+y.t/2)-(x.w+x.t/2)||(x.l-y.l)||((+b.PF||0)-(+a.PF||0))});
 var h=card('Posiciones',rs.map(function(r,i){var me=r.Equipo===R.equipo,pp=r['% Playoffs'];
  return '<div class="row"><div class="mu sm" style="width:20px;text-align:right">'+(i+1)+'</div><div class="b"><div class="n'+(me?' l':'')+'">'+esc(r.Equipo)+'</div><div class="s"><b style="color:var(--tx)">'+esc(r['Récord'])+'</b> · '+n(r.PF,0)+' PF · proy. '+esc(r['Récord final']||'—')+'</div><div class="chips"><span class="chip">Top 2 <b>'+p(r['% Top 2'])+'</b></span><span class="chip">1.º <b>'+p(r['% Primero'])+'</b></span><span class="chip">Final <b>'+p(r['% Final'])+'</b></span><span class="chip">Campeón <b>'+p(r['% Campeón'])+'</b></span><span class="chip">Último <b>'+p(r['% Último'])+'</b></span><span class="chip">Cal. <b>#'+esc(r.Calendario)+'</b></span></div></div><div class="r"><b class="'+(pp>=.75?'g':pp<.25?'rd':'y')+'">'+p(pp)+'</b><small>Playoffs</small></div></div>'}).join('')||'<div class="empty">Sin datos.</div>','<span>Récord · PF</span>');
 var hz=rows('App_Hallazgos').map(function(r){return '<div class="msg">'+esc(r.Texto)+'</div>'}).join('');
 return h+(hz?card('Hallazgos',hz):'')}
(function(){var _m=V.matchup;V.matchup=function(){var b=wkBase(),w=WK.sel||b;
 if(w===b&&cur('pt','Mi partido')==='Posiciones')return wkBar()+tabs('pt',['Mi partido','Liga','Temporada','Posiciones','Power'])+pmPosiciones();
 return _m()}})();
render();
// ---------- Semanas futuras: proyección del modelo semana a semana (App_ProySem), lado a lado ----------
function pfMap(w){var m={},k='S'+w;rows('App_ProySem').forEach(function(r){if(typeof r[k]==='number')m[r.Jugador]=r[k]});return m}
function pfSide(m,ix,pr){var slots=String(R.slots||'QB,RB,RB,WR,WR,WR,TE,FLEX,K,DST').split(',').filter(function(s){return s&&s!=='BN'});
 var all=(m.players||[]).map(function(id){var x=wkName(id,ix),pos=x.pos==='DEF'?'DST':x.pos;return {Jugador:x.nm,Pos:pos,NFL:x.nfl,P:pr[x.nm]!=null?pr[x.nm]:0}});
 var lu=lineup(all,slots,'P'),pool=lu.sel.slice(),used={},st=[];
 slots.forEach(function(s){for(var i=0;i<pool.length;i++){if(pool[i]&&pool[i][0]===s){var r=pool[i][1];pool[i]=null;used[r.Jugador]=1;st.push({nm:r.Jugador,pos:r.Pos,nfl:r.NFL,pts:r.P});return}}st.push({empty:true})});
 var bn=all.filter(function(r){return !used[r.Jugador]}).map(function(r){return {nm:r.Jugador,pos:r.Pos,nfl:r.NFL,pts:r.P}}).sort(function(a,b){return (PM_ORD[a.pos]||9)-(PM_ORD[b.pos]||9)||b.pts-a.pts});
 var t=0;st.forEach(function(x){if(!x.empty)t+=x.pts});return {st:st,bn:bn,t:t,slots:slots}}
function pfDuel(A,B,nA,nB,w,prob){var ix=lvIdx(),pr=pfMap(w),a=pfSide(A,ix,pr),b=B?pfSide(B,ix,pr):{st:[],bn:[],t:0};
 var h='<div class="vs"><div class="side">'+shield('#C8F36A')+'<div class="nm">'+esc(nA)+'</div><div class="pts">'+n(a.t)+'</div><div class="lbl">Proyectado</div></div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(nB)+'</div><div class="pts">'+n(b.t)+'</div><div class="lbl">Proyectado</div></div></div>';
 if(typeof prob==='number')h+='<div class="prob"><i style="width:'+Math.round(prob*100)+'%"></i></div><div class="sm mu" style="margin-top:6px">Prob. de ganar '+esc(nA)+' <b class="l">'+p(prob)+'</b></div>';
 var g='<div class="pmh"><div class="t">'+esc(nA)+'</div><div></div><div class="t R">'+esc(nB)+'</div></div>';
 for(var i=0;i<a.slots.length;i++)g+=pmRow(a.slots[i]==='SUPER_FLEX'?'SFLEX':a.slots[i],a.st[i],b.st[i]);
 g+='<div class="pmtot"><div class="L">'+n(a.t)+'</div><div class="m">TOTAL</div><div>'+n(b.t)+'</div></div>';
 var grp=function(l){var o={};l.forEach(function(x){(o[x.pos||'?']=o[x.pos||'?']||[]).push(x)});return o},ga=grp(a.bn),gb=grp(b.bn),bh='';
 Object.keys(ga).concat(Object.keys(gb)).filter(function(k,i,arr){return arr.indexOf(k)===i}).sort(function(x,y){return (PM_ORD[x]||9)-(PM_ORD[y]||9)}).forEach(function(k){var la=ga[k]||[],lb=gb[k]||[];for(var j=0;j<Math.max(la.length,lb.length);j++)bh+=pmRow(k,la[j],lb[j])});
 if(bh)g+='<div class="pmt">Banca</div>'+bh;
 return card('',h)+card('Alineación óptima proyectada',g,'<span>Proy</span>')+'<div class="note" style="margin:-6px 4px 14px">Proyección del modelo para la semana '+w+': puntos por partido esperados × dificultad del rival de esa semana (0 en bye o si aún no vuelve de lesión). Se recalcula cada vez que corres ActualizarTodo.</div>'}
function pfList(d,names,rid,w){var by=pmPairs(d),pr=pfMap(w),ix=lvIdx();
 var keys=Object.keys(by).sort(function(x,y){var mx=by[x].some(function(m){return m.roster_id===rid}),my=by[y].some(function(m){return m.roster_id===rid});return (my?1:0)-(mx?1:0)||x-y});
 var h=keys.map(function(k){var q=by[k];if(q.length<2)return '';if(q[1].roster_id===rid)q=[q[1],q[0]];
  var a=pfSide(q[0],ix,pr).t,b=pfSide(q[1],ix,pr).t,nA=names[q[0].roster_id]||'',nB=names[q[1].roster_id]||'',pa=a+b>0?a/(a+b):.5;
  return '<button class="pml'+(q[0].roster_id===rid?' me':'')+'" onclick="pmOpen('+k+')"><div class="n">'+esc(nA)+'</div><div class="sc"><b class="'+(a>b?'w':'')+'">'+n(a)+'</b><i>–</i><b class="'+(b>a?'w':'')+'">'+n(b)+'</b></div><div class="n R">'+esc(nB)+'</div><div class="sm2"><span>Proy.</span><div class="pbar"><i style="width:'+Math.round(pa*100)+'%"></i></div><span>Proy.</span></div></button>'}).join('');
 return card('Partidos de la semana '+w+' · proyección',h||'<div class="empty">Sin partidos.</div>','<span>Toca para ver</span>')}
(function(){var _m=V.matchup;V.matchup=function(){var b=wkBase(),w=WK.sel||b;
 if(w<=b||w>=15||!rows('App_ProySem').length)return _m();
 var h=wkBar()+'<div class="wkh"><b>Semana '+w+'</b><button onclick="pickWk('+b+')">Volver a la actual</button></div>';
 var t=cur('pt','Mi partido');if(t!=='Liga')t='Mi partido';S.sub.pt=t;h+=tabs('pt',['Mi partido','Liga']);
 var d=pmData(w);if(!d)return h+'<div class="sk" style="height:150px"></div><div class="sk" style="height:420px"></div>';
 if(d.err||!d.length||d.every(function(m){return m.matchup_id==null}))return _m();
 var names=pmNames(),rid=pmMyRid(names);if(rid==null){if(typeof slLoad==='function')slLoad(false);return h+card('Semana '+w,'<div class="empty">Cargando equipos de Sleeper…</div>')}
 var by=pmPairs(d),pk=String(S.sub.pm||'').split('|');
 if(t==='Liga'&&pk[0]===String(R.liga_id)&&+pk[1]===w&&by[pk[2]]){var q=by[pk[2]];if(q[1]&&q[1].roster_id===rid)q=[q[1],q[0]];
  return h+'<button class="pmbk" onclick="pmClose()">'+svg('back',2)+'Partidos de la liga</button>'+pfDuel(q[0],q[1],names[q[0].roster_id]||'',q[1]?names[q[1].roster_id]||'':'—',w,null)}
 if(t==='Liga')return h+pfList(d,names,rid,w);
 var me=d.filter(function(m){return m.roster_id===rid})[0];if(!me||me.matchup_id==null)return h+card('Semana '+w,'<div class="empty">No tienes partido esta semana.</div>');
 var op=(by[me.matchup_id]||[]).filter(function(m){return m.roster_id!==rid})[0],opN=op?(names[op.roster_id]||''):'—';
 var c=rows('App_Calendario').filter(function(r){return +r.Semana===w})[0]||{};
 h+=pfDuel(me,op,R.equipo,opN,w,typeof c['Prob ganar']==='number'?c['Prob ganar']:null);
 if(c.Semana)h+=card('Para esta semana','<div class="kv"><span>Titulares en bye</span><b>'+esc(c['Titulares en bye']||'—')+'</b><span>Otros en bye</span><b>'+esc(c['Otros en bye']||'—')+'</b></div>'+(c.Alerta?'<div class="note y">'+esc(c.Alerta)+'</div>':''));
 return h}})();
render();
