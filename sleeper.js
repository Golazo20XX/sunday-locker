// ===== SUNDAY LOCKER · sleeper.js v2 · rosters, alineaciones y lesiones al momento =====
var SL={lid:'',t:0,busy:false,err:'',ros:null,names:null,wk:0,pl:null,applied:''};
var SLCFG={every:120000,plEvery:6*3600000};
function slNorm(s){return String(s||'').toLowerCase().replace(/[.'\u2019,-]/g,'').replace(/\b(jr|sr|ii|iii|iv|v)\b/g,'').replace(/\s+/g,'')}
function slPl(){try{return JSON.parse(localStorage.getItem('sl_pl')||'null')||{t:0,m:{}}}catch(e){return {t:0,m:{}}}}
function slLoadPl(ids){return jget(SLP+'players/nfl').then(function(all){var c=slPl(),m={},keep={};
 Object.keys(c.m).forEach(function(k){keep[k]=1});ids.forEach(function(k){keep[k]=1});
 Object.keys(keep).forEach(function(k){var x=all[k];if(x)m[k]=[x.full_name||((x.first_name||'')+' '+(x.last_name||'')).trim(),x.position==='DEF'?'DST':x.position,nfl(x.team),x.injury_status||'',x.injury_body_part||'']});
 var o={t:Date.now(),m:m};try{localStorage.setItem('sl_pl',JSON.stringify(o))}catch(e){}return o})}
function slLoad(force){var lid=R.liga_id;if(!lid||SL.busy)return Promise.resolve();
 if(!force&&SL.lid===lid&&Date.now()-SL.t<SLCFG.every-1000)return Promise.resolve();
 SL.busy=true;
 var q='?t='+Date.now();
 return Promise.all([jget(SLP+'league/'+lid+'/rosters'+q),jget(SLP+'league/'+lid+'/users'+q),jget(SLP+'state/nfl'+q)]).then(function(r){
  var ids=[];r[0].forEach(function(x){(x.players||[]).forEach(function(id){ids.push(String(id))})});
  var c=slPl(),age=Date.now()-c.t;
  var need=age>SLCFG.plEvery||(age>1800000&&ids.some(function(id){return !/^[A-Z]{2,3}$/.test(id)&&!c.m[id]}));
  return (need?slLoadPl(ids).catch(function(){return c}):Promise.resolve(c)).then(function(pl){r.push(pl);return r})})
 .then(function(r){if(R.liga_id!==lid){SL.busy=false;return}var u={};
  r[1].forEach(function(x){u[x.user_id]=(x.metadata&&x.metadata.team_name)||('Team '+x.display_name)});
  SL={manual:SL.manual,lid:lid,t:Date.now(),busy:false,err:'',ros:r[0],names:{},wk:+(r[2].display_week||r[2].week)||0,pl:r[3],applied:''};
  r[0].forEach(function(x){SL.names[x.roster_id]=u[x.owner_id]||('Equipo '+x.roster_id)});
  slApply();render();if(SL.manual){SL.manual=false;slToast(SL.err?('⚠ '+SL.err):('Sleeper actualizado: '+(SL.me?SL.me.cur.length:0)+' titulares tuyos leídos'))}})
 .catch(function(e){SL.busy=false;SL.err=e.message;if(SL.manual){SL.manual=false;slToast('⚠ No se pudo leer Sleeper: '+e.message)}render()})}
function slRefresh(){SL.manual=true;slLoad(true);if(typeof liveLoad==='function')liveLoad(true)}
function slToast(t){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:14px;right:14px;bottom:90px;z-index:60;background:#1d2b16;border:1px solid #3d5a22;color:#C8F36A;padding:12px;border-radius:12px;font-size:13px';document.body.appendChild(d);setTimeout(function(){d.remove()},3500)}
function slAdj(x){var s=String(x.inj||'').toLowerCase();var f=/^(out|ir|pup|sus|na|dnr|cov)/.test(s)?0:s==='doubtful'?0.3:1;return (x.proy||0)*f}
function slBad(s){return /^(out|ir|pup|sus|doubtful|na)/i.test(String(s||''))}
function slApply(){if(!SL.ros||SL.lid!==R.liga_id||!D)return;var key=LIGA+'|'+SL.t;if(SL.applied===key)return;SL.applied=key;
 var ix=lvIdx();ix.byNorm={};Object.keys(ix.byName).forEach(function(k){ix.byNorm[slNorm(k)]=k});
 var riv={};['App_RankSemana','App_Roster'].forEach(function(k){(D.datos[k]||[]).forEach(function(r){if(r.Jugador&&r.Rival&&!riv[r.Jugador])riv[r.Jugador]=r.Rival})});
 var info=function(id){id=String(id);if(/^[A-Z]{2,3}$/.test(id)){var tm=nfl(id),nm=ix.dst[tm]||(tm+' DST'),b=ix.byName[nm]||{};return {id:id,nm:nm,pos:'DST',nfl:tm,inj:'',proy:typeof b.proy==='number'?b.proy:null}}
  var p=(SL.pl&&SL.pl.m[id])||null,nm=ix.byId[id];if(!nm&&p)nm=ix.byNorm[slNorm(p[0])]||p[0];if(!nm)nm='Jugador '+id;
  var b=ix.byName[nm]||{};return {id:id,nm:nm,pos:b.pos||(p&&p[1])||'',nfl:b.nfl||(p&&p[2])||'',inj:p?p[3]:'',body:p?p[4]:'',proy:typeof b.proy==='number'?b.proy:null}};
 var own={},by={},I={};
 SL.ros.forEach(function(r){var tn=SL.names[r.roster_id];by[tn]=r;(r.players||[]).forEach(function(id){var x=info(id);I[String(id)]=x;own[x.nm]=tn})});
 SL.I=I;SL.own=own;
 // 1) dueño actual en las tablas del Excel
 ['App_RankSemana','App_RankROS','App_Libres','App_Streaming','App_Radar','App_Waivers','App_Comprar','App_Riesgo','App_Novedades'].forEach(function(k){(D.datos[k]||[]).forEach(function(row){var nm=row.Jugador||row.Tomar;if(!nm)return;var now=own[nm]||'Libre';
  if('Dueño' in row){if(row._d0===undefined)row._d0=row['Dueño'];row['Dueño']=now}
  if('Equipo Fantasy' in row){if(row._d0===undefined)row._d0=row['Equipo Fantasy'];row['Equipo Fantasy']=now}
  var nk=k==='App_Streaming'?'Decisión':'Por qué';
  if(k==='App_Waivers'||k==='App_Libres'||k==='App_Streaming'){if(row._w0===undefined)row._w0=row[nk];
   row[nk]=(now!=='Libre'?(now===R.equipo?'✔ Ya es tuyo. ':'⚠ Ya no está libre: lo tomó '+now+'. '):'')+(row._w0||'')}})});
 // 2) mi equipo y el rival
 var X=R._x||(R._x={proy_yo_sleeper:R.proy_yo_sleeper,proy_yo_optima:R.proy_yo_optima,proy_rival_sleeper:R.proy_rival_sleeper,proy_rival_optima:R.proy_rival_optima,prob_ganar:R.prob_ganar,ganancia_alineacion:R.ganancia_alineacion,msg_alineacion:R.msg_alineacion,rival:R.rival,Ali:D.datos.App_Alineacion,Ros:D.datos.App_Roster,Riv:D.datos.App_Rival});
 var my=by[R.equipo];if(!my){SL.err='No encontré tu equipo "'+R.equipo+'" en Sleeper (equipos: '+Object.keys(by).join(', ')+')';return}
 var slots=String(R.slots||'QB,RB,RB,WR,WR,WR,TE,FLEX,K,DST').split(',');
 var team=function(r){var res={};(r.reserve||[]).forEach(function(id){res[String(id)]=1});var st={};(r.starters||[]).forEach(function(id){st[String(id)]=1});
  var pl=(r.players||[]).map(function(id){var x=I[String(id)];return {Jugador:x.nm,Pos:x.pos,NFL:x.nfl,P:slAdj(x),inj:x.inj,body:x.body,id:x.id,sin:x.proy==null,ir:!!res[x.id],st:!!st[x.id]}});
  var cur=(r.starters||[]).map(function(id){return pl.filter(function(p){return p.id===String(id)})[0]}).filter(Boolean);
  var opt=lineup(pl.filter(function(p){return !p.ir}),slots,'P');
  return {pl:pl,cur:cur,curT:cur.reduce(function(s,p){return s+p.P},0),opt:opt,v:cur.reduce(function(s,p){return s+Math.pow(LVCFG.cv*p.P,2)},0)}};
 var me=team(my);SL.me=me;
 var rvName=X.rival;if(LV.m&&LV.lid===R.liga_id&&LV.wk===SL.wk){var mm=LV.m.filter(function(m){return m.roster_id===my.roster_id})[0];if(mm){var o=LV.m.filter(function(m){return m.matchup_id===mm.matchup_id&&m.roster_id!==my.roster_id})[0];if(o&&SL.names[o.roster_id])rvName=SL.names[o.roster_id]}}
 var rv=by[rvName]?team(by[rvName]):null;SL.rv=rv;SL.rvName=rvName;
 R.proy_yo_sleeper=me.curT;R.proy_yo_optima=me.opt.t;R.ganancia_alineacion=me.opt.t-me.curT;
 var inn=me.opt.names.filter(function(x){return !me.cur.some(function(p){return p.Jugador===x})}),out=me.cur.filter(function(p){return me.opt.names.indexOf(p.Jugador)<0}).map(function(p){return p.Jugador});
 R.msg_alineacion=R.ganancia_alineacion>0.5?'Cambia tu alineación en Sleeper: entra '+inn.join(', ')+'; sale '+out.join(', ')+' (+'+R.ganancia_alineacion.toFixed(1)+' pts).':'Tu alineación actual en Sleeper es la óptima según el modelo.';
 D.datos.App_Alineacion=(my.starters||[]).map(function(id,i){var p=me.pl.filter(function(x){return x.id===String(id)})[0];if(!p)return {Slot:slots[i]||'',Jugador:'(vacío)',Rival:'',Proy:0};return {Slot:slots[i]||p.Pos,Jugador:p.Jugador,Rival:(riv[p.Jugador]||'')+(me.opt.names.indexOf(p.Jugador)<0?' · ⚠ el modelo lo sentaría':''),Proy:p.P}});
 if(rv){R.rival=rvName;R.proy_rival_sleeper=rv.curT;R.proy_rival_optima=rv.opt.t;var sd=Math.sqrt(me.v+rv.v);R.prob_ganar=sd>0?phi((me.curT-rv.curT)/sd):0.5;
  D.datos.App_Rival=rv.cur.slice().sort(function(a,b){return b.P-a.P}).map(function(p){return {Jugador:p.Jugador,Pos:p.Pos,NFL:p.NFL,'Rival NFL':riv[p.Jugador]||'',Proy:p.P}})}
 // 3) mi roster: quita a los que ya no están y agrega los nuevos
 var ex={};(X.Ros||[]).forEach(function(r){ex[r.Jugador]=r});
 var rosR={};(D.datos.App_RankROS||[]).forEach(function(r){rosR[r.Jugador]=r});
 D.datos.App_Roster=me.pl.map(function(p){var b=ex[p.Jugador],o={},k;if(b){for(k in b)o[k]=b[k]}else{o={Jugador:p.Jugador,Pos:p.Pos,NFL:p.NFL,Rival:riv[p.Jugador]||'',ROS:(rosR[p.Jugador]||{}).ROS,'Recomendación':'Nuevo en tu roster (aún sin análisis del Excel)'}}
  o.Proy=p.P;o['En Sleeper']=p.ir?'IR':p.st?'Titular':'Banca';if(p.inj)o.Estado=p.inj+(p.body?' ('+p.body+')':'');if(p.sin)o['Recomendación']='Sin proyección del modelo · '+(o['Recomendación']||'');return o})
  .sort(function(a,b){var w={Titular:0,Banca:1,IR:2};return (w[a['En Sleeper']]-w[b['En Sleeper']])||((+b.Proy||0)-(+a.Proy||0))});
 // 4) alertas
 SL.alerts=me.cur.filter(function(p){return slBad(p.inj)||p.sin||p.P<=0.01}).map(function(p){return p.Jugador+(p.inj?' ('+p.inj+')':p.sin?' (sin proyección)':' (0 pts proy.: ¿bye?)')});
 SL.taken=(D.datos.App_Waivers||[]).filter(function(r){var nm=r.Tomar||r.Jugador;return nm&&own[nm]&&own[nm]!==R.equipo}).map(function(r){return r.Tomar||r.Jugador})}
function slAgo(){if(SL.err)return '<span class="rd">'+esc(SL.err)+'</span>';if(!SL.t||SL.lid!==R.liga_id)return 'Sleeper: cargando…';var m=Math.round((Date.now()-SL.t)/60000);return 'Sleeper hace '+(m<1?'<1':m)+' min'}
(function(){
 var _lb=ligaBar;ligaBar=function(){var h=_lb();if(!D||!R.liga_id)return h;
  var w=SL.wk&&+R.semana&&SL.wk!==+R.semana&&SL.lid===R.liga_id?'<div class="note y" style="margin:-4px 0 10px">⚠ Sleeper ya está en la semana '+esc(SL.wk)+' y las proyecciones del Excel son de la '+esc(R.semana)+'. Corre ActualizarTodo.</div>':'';
  return h+'<div class="sm mu" style="margin:-4px 0 10px">Proyecciones del Excel '+esc(D.actualizado)+' · rosters, alineaciones y lesiones: '+slAgo()+' <button onclick="slRefresh()" style="background:var(--gr);border:1px solid var(--ln);color:var(--li);border-radius:14px;padding:3px 10px;font-size:12px;font-weight:700;margin-left:4px">↻ Actualizar</button></div>'+w};
 var _h=V.home;V.home=function(){var x=_h();if(!SL.me||SL.lid!==R.liga_id)return x;var a='';
  if(SL.alerts&&SL.alerts.length)a+='<div class="msg"><b class="rd">Titulares con problema:</b> '+esc(SL.alerts.join(', '))+'</div>';
  if(SL.taken&&SL.taken.length)a+='<div class="msg"><b class="y">Waivers sugeridos que ya no están libres:</b> '+esc(SL.taken.join(', '))+'</div>';
  var k='Decisiones de la semana',q=x.indexOf('<div class="card"><h3><span>'+k);
  var c=a?card('⚠ Al momento (Sleeper)',a):'';return q<0?x+c:x.slice(0,q)+c+x.slice(q)};
 var _pk=pickLiga;pickLiga=function(){_pk();SL.applied='';slApply()};
 var _sd=setData;setData=function(j){_sd(j);setTimeout(function(){slLoad(true)},0)};
 setInterval(function(){if(document.visibilityState==='visible'&&D)slLoad(false)},30000);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&D)slLoad(false)});
 if(D){slLoad(true)}
})();
