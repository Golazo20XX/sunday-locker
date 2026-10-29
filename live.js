// ===== SUNDAY LOCKER · live.js · modo En vivo (Sleeper + ESPN) =====
(function(){var st=document.createElement('style');st.textContent='.lvh{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:11px;color:var(--mu)}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--mu);margin-right:6px;vertical-align:middle}.dot.on{background:#F87171;animation:pu 1.4s infinite}@keyframes pu{0%{box-shadow:0 0 0 0 rgba(248,113,113,.7)}70%{box-shadow:0 0 0 8px rgba(248,113,113,0)}100%{box-shadow:0 0 0 0 rgba(248,113,113,0)}}.lvs{font-size:30px;font-weight:800}.lvr{font-size:10px;color:var(--mu);letter-spacing:.5px;text-transform:uppercase}.gl{font-size:10px;padding:1px 6px;border-radius:8px;border:1px solid var(--ln);color:var(--mu);white-space:nowrap}.gl.in{border-color:#6b2a2a;color:#F87171}.gl.post{color:var(--tx)}.lvp{display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--ln)}.lvp:first-child{border-top:0}.lvp .b{flex:1;min-width:0}.lvp .n{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lvp .r{text-align:right;min-width:52px}.lvp .r b{display:block;font-size:15px}.lvp .r small{font-size:9px;color:var(--mu)}';document.head.appendChild(st)})();
var LV={lid:'',wk:0,season:'',names:null,namesT:0,m:null,games:{},t:0,err:'',busy:false,any:false,started:false};
var LVCFG={cv:0.5,fast:45000,slow:300000};
var SLP='https://api.sleeper.app/v1/';
function jget(u){return fetch(u,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})}
function nfl(t){t=String(t||'').toUpperCase();return t==='LAR'?'LA':t==='WSH'?'WAS':t==='JAC'?'JAX':t}
function phi(z){var t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2),q=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-q:q}
function lvIdx(){var byName={},byId={},dst={};
 ['App_RankSemana','App_Roster','App_Rival','App_Streaming','App_RankROS'].forEach(function(k){rows(k).forEach(function(r){var nm=r.Jugador;if(!nm)return;var o=byName[nm]||(byName[nm]={});
  if(o.proy==null&&typeof r.Proy==='number')o.proy=r.Proy;if(!o.pos&&r.Pos)o.pos=r.Pos;if(!o.nfl&&(r.NFL||r.Equipo))o.nfl=r.NFL||r.Equipo;if(o.prob==null&&typeof r.Prob==='number')o.prob=r.Prob;
  if((r.Pos==='DST'||r.Pos==='DEF')&&r.NFL&&!dst[nfl(r.NFL)])dst[nfl(r.NFL)]=nm})});
 for(var nm in FOTO){byId[String(FOTO[nm])]=nm}
 return {byName:byName,byId:byId,dst:dst}}
function lvGameOf(team){var g=LV.games[nfl(team)];return g||null}
function lvPlayer(id,pts,ix){id=String(id);var nm,info;
 if(/^[A-Z]{2,3}$/.test(id)){var tm=nfl(id);nm=ix.dst[tm]||(tm+' DST');info=ix.byName[nm]||{pos:'DST',nfl:tm};info.pos='DST';info.nfl=info.nfl||tm}
 else{nm=ix.byId[id]||('Jugador '+id);info=ix.byName[nm]||{}}
 var pr=typeof info.proy==='number'?info.proy:0,real=+pts||0,g=lvGameOf(info.nfl),rem=g?g.rem:(real>0?0.5:1);
 var live=(info.pos==='DST'||info.pos==='DEF')?rem*pr+(1-rem)*real:real+pr*rem;
 return {id:id,nm:nm,pos:info.pos||'',nfl:info.nfl||'',proy:pr,real:real,rem:rem,live:live,g:g,prob:info.prob,var:Math.pow(LVCFG.cv*pr,2)*rem}}
function lvTeam(m,ix){var pp=m.players_points||{};var st=(m.starters||[]).filter(function(x){return x&&x!=='0'}).map(function(id){return lvPlayer(id,pp[id],ix)});
 var real=typeof m.points==='number'?m.points:st.reduce(function(s,x){return s+x.real},0);
 var left=st.reduce(function(s,x){return s+(x.live-x.real)},0);
 return {rid:m.roster_id,mid:m.matchup_id,name:(LV.names&&LV.names[m.roster_id])||('Equipo '+m.roster_id),st:st,real:real,live:real+left,proy:st.reduce(function(s,x){return s+x.proy},0),var:st.reduce(function(s,x){return s+x.var},0)}}
function lvPairs(){if(!LV.m)return [];var ix=lvIdx(),by={};LV.m.forEach(function(m){if(m.matchup_id==null)return;(by[m.matchup_id]=by[m.matchup_id]||[]).push(lvTeam(m,ix))});
 return Object.keys(by).map(function(k){var a=by[k];if(a.length<2)return null;var me=a[1].name===R.equipo;if(me)a=[a[1],a[0]];
  var sd=Math.sqrt(a[0].var+a[1].var),d=a[0].live-a[1].live,p1=sd<0.01?(d>0?1:d<0?0:0.5):phi(d/sd);return {a:a[0],b:a[1],p:p1,me:a[0].name===R.equipo}}).filter(Boolean)
  .sort(function(x,y){return (y.me?1:0)-(x.me?1:0)})}
function lvGames(wk,season){return jget('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week='+wk+'&dates='+season).then(function(j){var g={},any=false,started=false;
 (j.events||[]).forEach(function(ev){var c=(ev.competitions||[])[0]||{},s=ev.status||c.status||{},ty=s.type||{},st=ty.state||'pre',per=+s.period||0,clk=+s.clock||0,rem;
  if(st==='pre')rem=1;else if(st==='post')rem=0;else{rem=per>4?0.02:Math.max(0,((4-per)*900+clk)/3600);any=true}
  if(st!=='pre')started=true;
  var lab=st==='pre'?new Date(ev.date).toLocaleString('es',{weekday:'short',hour:'2-digit',minute:'2-digit'}):st==='post'?'Final':(ty.name==='STATUS_HALFTIME'?'Medio tiempo':(per>4?'TE ':'Q'+per+' ')+(s.displayClock||''));
  var tms=(c.competitors||[]).map(function(x){return {t:nfl(x.team&&x.team.abbreviation),s:x.score}});
  var score=tms.length===2?tms[1].t+' '+tms[1].s+' - '+tms[0].s+' '+tms[0].t:'';
  tms.forEach(function(x){g[x.t]={rem:rem,state:st,lab:lab,score:st==='pre'?'':score}})});
 LV.any=any;LV.started=started;return g})}
function liveLoad(force){var lid=R.liga_id;if(!lid||LV.busy)return Promise.resolve();
 if(!force&&LV.t&&Date.now()-LV.t<(LV.any?LVCFG.fast:LVCFG.slow)-1000)return Promise.resolve();
 LV.busy=true;if(LV.lid!==lid){LV={lid:lid,wk:0,season:'',names:null,namesT:0,m:null,games:{},t:0,err:'',busy:true,any:false,started:false}}
 return jget(SLP+'state/nfl').then(function(st){LV.wk=+(st.display_week||st.week)||+R.semana;LV.season=String(st.season||st.league_season||new Date().getFullYear());
  var need=!LV.names||Date.now()-LV.namesT>600000;
  return Promise.all([jget(SLP+'league/'+lid+'/matchups/'+LV.wk),need?Promise.all([jget(SLP+'league/'+lid+'/rosters'),jget(SLP+'league/'+lid+'/users')]):null,lvGames(LV.wk,LV.season).catch(function(){return LV.games})])})
 .then(function(r){LV.m=r[0];if(r[1]){var u={},nm={};r[1][1].forEach(function(x){u[x.user_id]=(x.metadata&&x.metadata.team_name)||x.display_name});r[1][0].forEach(function(x){nm[x.roster_id]=u[x.owner_id]||('Equipo '+x.roster_id)});LV.names=nm;LV.namesT=Date.now()}
  LV.games=r[2]||{};LV.t=Date.now();LV.err='';LV.busy=false;if(S.tab==='home'||(S.tab==='matchup'&&cur('mt','Resumen')==='En vivo'))render()})
 .catch(function(e){LV.busy=false;LV.err=e.message;if(S.tab==='matchup')render()})}
setInterval(function(){if(document.visibilityState==='visible'&&D)liveLoad(false)},15000);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&D)liveLoad(false)});
function glab(x){if(!x.g)return '<span class="gl">—</span>';return '<span class="gl '+x.g.state+'">'+esc(x.g.lab)+'</span>'}
function lvRow(x){var warn=typeof x.prob==='number'&&x.prob<0.5&&x.rem>0;
 return '<div class="lvp tap" onclick="openP(\''+esc(x.nm).replace(/'/g,"\\'")+'\')">'+pb(x.pos)+av(x.nm,x.nfl,x.pos)+'<div class="b"><div class="n">'+esc(x.nm)+'</div><div class="sm mu">'+esc(x.nfl)+' '+glab(x)+(x.g&&x.g.score?' <span class="sm">'+esc(x.g.score)+'</span>':'')+(warn?' <span class="y">⚠ prob. '+p(x.prob)+'</span>':'')+'</div></div><div class="r"><b>'+n(x.real)+'</b><small>'+(x.rem>0?'→ '+n(x.live):'final')+'</small></div></div>'}
function lvHead(){var ago=LV.t?Math.round((Date.now()-LV.t)/1000):null;
 return '<div class="lvh"><span><i class="dot'+(LV.any?' on':'')+'"></i>'+(LV.any?'Partidos en juego':LV.started?'Sin partidos en juego ahora':'Aún no empieza la semana')+' · Sem '+esc(LV.wk||R.semana)+'</span><span>'+(ago!=null?'hace '+ago+' s':'')+' <button class="x" onclick="liveLoad(true)">↻</button></span></div>'+(LV.wk&&+R.semana&&LV.wk!==+R.semana?'<div class="note y" style="margin:-6px 0 10px">Sleeper está en la semana '+esc(LV.wk)+' y el Excel en la '+esc(R.semana)+': las proyecciones pueden no corresponder hasta que avances el modelo.</div>':'')}
function lvScore(pr){var a=pr.a,b=pr.b;
 return '<div class="vs"><div class="side">'+shield(pr.me?'#C8F36A':'#8B95A7')+'<div class="nm">'+esc(a.name)+'</div><div class="lvs">'+n(a.real)+'</div><div class="lvr">Proy. en vivo '+n(a.live)+'</div></div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(b.name)+'</div><div class="lvs">'+n(b.real)+'</div><div class="lvr">Proy. en vivo '+n(b.live)+'</div></div></div>'+
 '<div class="prob"><i style="width:'+Math.round(pr.p*100)+'%"></i></div><div class="sm mu" style="margin-top:6px;display:flex;justify-content:space-between"><span>Prob. de ganar en vivo <b class="l">'+p(pr.p)+'</b></span>'+(pr.me&&typeof R.prob_ganar==='number'?'<span>Antes de empezar '+p(R.prob_ganar)+'</span>':'')+'</div>'}
function liveView(){if(!R.liga_id)return card('En vivo','<div class="empty">Falta el ID de la liga (liga_id en App_Resumen).</div>');
 if(!LV.m||LV.lid!==R.liga_id){if(!LV.err||LV.lid!==R.liga_id)liveLoad(true);return card('En vivo',LV.err?'<div class="empty">No se pudo leer Sleeper: '+esc(LV.err)+'</div>':'<div class="empty">Cargando datos en vivo…</div>')}
 var prs=lvPairs(),mine=prs.filter(function(x){return x.me})[0];var h=lvHead();
 if(mine){h+=card('Mi partido',lvScore(mine)+'<div class="note">Proy. en vivo = puntos reales + lo que el modelo espera del tiempo que falta de cada partido.</div>');
  h+=card(esc(mine.a.name),mine.a.st.map(lvRow).join(''),'<span>Pts → proy.</span>');
  h+=card(esc(mine.b.name),mine.b.st.map(lvRow).join(''),'<span>Pts → proy.</span>')}
 else h+=card('Mi partido','<div class="empty">No encontré tu equipo ('+esc(R.equipo)+') en los partidos de Sleeper.</div>');
 var otros=prs.filter(function(x){return !x.me});
 if(otros.length)h+=card('Resto de la liga',otros.map(function(pr){return '<div class="mt"><div class="mtr"><span class="n">'+esc(pr.a.name)+'</span><b>'+n(pr.a.real)+' <span class="mu sm">→ '+n(pr.a.live)+'</span></b></div><div class="pbar"><i style="width:'+Math.round(pr.p*100)+'%"></i></div><div class="mtr"><span class="n">'+esc(pr.b.name)+'</span><b>'+n(pr.b.real)+' <span class="mu sm">→ '+n(pr.b.live)+'</span></b></div><div class="chips"><span class="chip">Prob. <b>'+p(pr.p)+' – '+p(1-pr.p)+'</b></span></div></div>'}).join(''));
 return h}
function liveHomeCard(){if(!LV.m||LV.lid!==R.liga_id||!LV.started)return '';var mine=lvPairs().filter(function(x){return x.me})[0];if(!mine)return '';
 return '<div onclick="S.sub.mt=\'En vivo\';go(\'matchup\')">'+card('<i class="dot'+(LV.any?' on':'')+'"></i>En vivo · semana '+esc(LV.wk),lvScore(mine),'<span class="chev">›</span>')+'</div>'}
// --- conexión con la app (sin tocar el resto de index.html) ---
(function(){
 var T5=['Resumen','Semana','Temporada','Liga','Power'],T6=['En vivo'].concat(T5);
 var _home=V.home;V.home=function(){var x=_home(),k='⌄</span></div>',q=x.indexOf(k);return q<0?liveHomeCard()+x:x.slice(0,q+k.length)+liveHomeCard()+x.slice(q+k.length)};
 var _mt=V.matchup;V.matchup=function(){if(cur('mt','Resumen')==='En vivo')return tabs('mt',T6)+liveView();return _mt().replace(tabs('mt',T5),tabs('mt',T6))};
 var _dr=drawer;drawer=function(o){_dr(o);if(o){var p=$('dpn');p.innerHTML=p.innerHTML.replace('<button onclick="go(\'home\')">Inicio</button>','<button onclick="go(\'home\')">Inicio</button><button onclick="S.sub.mt=\'En vivo\';go(\'matchup\')">En vivo</button>')}};
 var _sd=setData;setData=function(j){_sd(j);setTimeout(function(){liveLoad(true)},0)};
 if(D){liveLoad(true);render()}
})();
