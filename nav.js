// ===== SUNDAY LOCKER · nav.js · navegación (barra inferior, menú Más, encabezado, atrás, deslizar para actualizar) =====
(function(){var st=document.createElement('style');st.textContent=[
'body{overscroll-behavior-y:contain;padding-bottom:calc(78px + env(safe-area-inset-bottom))}',
'#drawer{display:none!important}',
'header{background:var(--ob)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:calc(8px + env(safe-area-inset-top)) 12px 8px 16px;min-height:calc(54px + env(safe-area-inset-top));gap:10px;border-bottom:1px solid transparent;transition:border-color .2s,background .2s}',
'header.sc{border-bottom-color:var(--ln)}',
'.hl{display:flex;align-items:center;gap:4px;min-width:0;flex:1}.hr{display:flex;align-items:center;gap:6px;flex:none}',
'.ttl2{font-family:Unbounded,Inter,sans-serif;font-weight:800;font-size:16px;letter-spacing:.4px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.hb{background:none;border:0;color:var(--tx);width:36px;height:36px;margin-left:-8px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}.hb:active{background:var(--gr)}.hb svg{width:22px;height:22px}',
'.lgp{display:flex;align-items:center;gap:6px;max-width:150px;background:var(--gr2);border:1px solid var(--ln);border-radius:18px;padding:6px 10px 6px 8px;color:var(--tx);font-size:12px;font-weight:600}.lgp span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lgp svg{width:14px;height:14px;flex:none;color:var(--mu)}.lgp i{width:8px;height:8px;border-radius:50%;background:var(--li);flex:none}',
'.ib:active{opacity:.6}',
'nav{z-index:50!important;padding:6px 6px calc(8px + env(safe-area-inset-bottom));background:var(--ob)!important}',
'nav button{gap:4px;font-size:10.5px;font-weight:600;letter-spacing:.1px;text-transform:none;padding:2px 0}',
'nav .ni{width:54px;height:30px;border-radius:15px;display:flex;align-items:center;justify-content:center;transition:background .2s}',
'nav button.on .ni{background:rgba(200,243,106,.14)}nav button:active .ni{background:rgba(255,255,255,.06)}',
'.tabs{position:sticky;top:var(--hh,54px);z-index:6;background:var(--ob);border-bottom:0;gap:6px;margin:-6px -14px 12px;padding:6px 14px 8px;scrollbar-width:none}.tabs::-webkit-scrollbar,.seg::-webkit-scrollbar{display:none}',
'.tabs button{flex:none;border:1px solid var(--ln);border-radius:18px;padding:7px 14px;font-size:13px;color:var(--mu);background:var(--gr2);transition:all .15s}',
'.tabs button.on{background:var(--li);border-color:var(--li);color:var(--ob);font-weight:700}',
'.seg{scrollbar-width:none}.seg button{border-color:var(--ln);padding:5px 12px}.seg button.on{background:#1a2313}',
'.back{display:none!important}',
'html,body{max-width:100%}main{overflow-x:clip}.seg{position:relative}#sheet main{padding-bottom:calc(90px + env(safe-area-inset-bottom))}',
'.wkb{margin:-4px -14px 12px;padding:2px 14px 4px}.wkb button{min-width:44px;text-align:center}.wkb button.cur{color:var(--tx)}.wkb button.cur.on{color:var(--li)}',
'.wkh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.wkh b{font-family:Unbounded,Inter,sans-serif;font-size:18px;font-weight:800}.wkh button{background:var(--gr2);border:1px solid var(--ln);color:var(--li);border-radius:16px;padding:5px 12px;font-size:12px;font-weight:700}',
'.res{display:inline-block;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;letter-spacing:.5px}.res.w{background:#1d2b16;color:var(--li)}.res.l{background:#2a1515;color:var(--bad)}',
'.week{cursor:pointer}.week .wkc{display:inline-flex;vertical-align:middle;color:var(--mu);margin-left:4px}.week .wkc svg{width:18px;height:18px}',
'.mtop{display:flex;align-items:center;justify-content:space-between;margin:0 0 10px}.mtop .grab{margin:4px 0 0 0}.mx{background:var(--gr);border:0;color:var(--tx);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center}.mx svg{width:16px;height:16px}',
'.alr{display:flex;align-items:center;gap:10px;padding:11px 12px;border-top:1px solid var(--ln);width:100%;background:none;border-left:0;border-right:0;border-bottom:0;color:var(--tx);text-align:left}.alr:first-child{border-top:0}.alr .b{flex:1;min-width:0}.alr .n{font-weight:600;font-size:14px}.alr .s{font-size:11.5px;color:var(--mu)}.alr .r{font-size:12px;font-weight:700;white-space:nowrap}',
'.row.tap:active,.ins:active,.mt:active,.lvp:active{background:rgba(255,255,255,.035);border-radius:10px}.tile:active,.btn:active,.pill:active{transform:scale(.985)}.tile,.btn,.pill{transition:transform .1s}',
'.ins .ic.ici,.row .ic.ici{border:0;background:var(--gr);color:var(--li);border-radius:11px}.ici svg{width:18px;height:18px}',
'.tile{display:flex;flex-direction:column;gap:10px;padding:16px 14px;min-height:118px}.tile b{margin-top:2px}.tile .tic{width:40px;height:40px;border-radius:12px;background:rgba(200,243,106,.12);color:var(--li);display:flex;align-items:center;justify-content:center}.tile .tic svg{width:20px;height:20px}',
'.tile .e.ici{width:40px;height:40px;border-radius:12px;background:rgba(200,243,106,.12);color:var(--li);display:flex;align-items:center;justify-content:center;flex:none}.tile .e.ici svg{width:20px;height:20px}',
'@keyframes vin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.vin{animation:vin .22s ease-out}',
'#sheet{transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1);box-shadow:-8px 0 30px rgba(0,0,0,.4)}#sheet.open{transform:none}',
'.bnr{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin-bottom:12px;font-size:12.5px;line-height:1.35;border:1px solid #5b4314;background:#2a2010;color:#f6d38a}.bnr.err{border-color:#6b2a2a;background:#2a1414;color:#f5b1b1}.bnr svg{width:18px;height:18px;flex:none}.bnr span{flex:1}.bnr b{font-weight:700;white-space:nowrap}',
'#more{position:fixed;inset:0;z-index:45;pointer-events:none}#more .bg{position:absolute;inset:0;background:rgba(0,0,0,.55);opacity:0;transition:opacity .25s}',
'#more .pn{position:absolute;left:0;right:0;bottom:var(--nvh,64px);max-height:calc(88vh - var(--nvh,64px));overflow-y:auto;background:var(--gr2);border:1px solid var(--ln);border-bottom:0;border-radius:22px 22px 0 0;padding:8px 14px 14px;transform:translateY(calc(100% + 120px));transition:transform .3s cubic-bezier(.2,.8,.2,1)}',
'#more.open{pointer-events:auto}#more.open .bg{opacity:1}#more.open .pn{transform:none}',
'.grab{width:38px;height:4px;border-radius:2px;background:var(--ln);margin:4px auto 14px}',
'.mhd{display:flex;align-items:center;gap:12px;padding:0 4px 14px}.mhd .shield{width:40px;height:44px}.mhd b{display:block;font-size:15px}.mhd span{font-size:12px;color:var(--mu)}',
'.mlab{font-size:10.5px;color:var(--mu);letter-spacing:1.2px;text-transform:uppercase;font-weight:600;margin:6px 6px 8px}',
'.mg{background:var(--ob);border:1px solid var(--ln);border-radius:14px;margin-bottom:14px;overflow:hidden}',
'.mi{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;background:none;border:0;border-top:1px solid var(--ln);color:var(--tx);font-size:14px;text-align:left;text-decoration:none}.mi:first-child{border-top:0}.mi:active{background:rgba(255,255,255,.04)}',
'.mi .mic{width:32px;height:32px;border-radius:9px;background:var(--gr);display:flex;align-items:center;justify-content:center;color:var(--li);flex:none}.mi .mic svg{width:18px;height:18px}',
'.mi .mtx{flex:1;min-width:0}.mi .mtx small{display:block;font-size:11px;color:var(--mu);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mi .end{color:var(--mu);flex:none}.mi .end svg{width:16px;height:16px}.mi .ok{color:var(--li)}',
'@keyframes rot{to{transform:rotate(360deg)}}.spin svg{animation:rot .8s linear infinite}',
'.mft{text-align:center;font-size:10.5px;color:var(--mu);letter-spacing:2px;margin-top:4px}',
'#ptr{position:fixed;left:50%;top:var(--hh,54px);width:38px;height:38px;margin:-46px 0 0 -19px;border-radius:50%;background:var(--gr2);border:1px solid var(--ln);display:flex;align-items:center;justify-content:center;color:var(--li);z-index:9;opacity:0;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.4)}#ptr svg{width:18px;height:18px}#ptr.go{transition:transform .25s,opacity .25s}',
'@keyframes shm{0%{background-position:-300px 0}100%{background-position:300px 0}}.sk{border-radius:16px;margin-bottom:14px;background:linear-gradient(90deg,var(--gr2) 0,#1d2330 50%,var(--gr2) 100%);background-size:600px 100%;animation:shm 1.3s infinite linear;border:1px solid var(--ln)}',
'.tst{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom));transform:translate(-50%,20px);opacity:0;z-index:60;display:flex;align-items:center;gap:8px;max-width:calc(100% - 32px);background:#1E2430;border:1px solid var(--ln);color:var(--tx);padding:10px 16px;border-radius:22px;font-size:13px;font-weight:500;box-shadow:0 6px 24px rgba(0,0,0,.45);transition:all .25s}.tst.on{transform:translate(-50%,0);opacity:1}.tst i{width:8px;height:8px;border-radius:50%;background:var(--li);flex:none}.tst.err i{background:var(--bad)}',
'#busy{top:env(safe-area-inset-top)!important}',
'.lvh{margin-bottom:10px}'
].join('');document.head.appendChild(st)})();

var NI={
home:ICON.home,players:ICON.players,matchup:ICON.matchup,tools:ICON.tools,
more:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 6l6 6-6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
live:'<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.5M7.8 16.2a6 6 0 0 1 0-8.5M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
waivers:'<circle cx="10" cy="8" r="4"/><path d="M2.5 20.5c.8-3.8 3.8-5.8 7.5-5.8 1.4 0 2.6.3 3.7.8"/><path d="M19 13v7M15.5 16.5h7"/>',
stream:'<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>',
trades:'<path d="M16 3l4 4-4 4"/><path d="M20 7H8"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h12"/>',
news:'<path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z"/><path d="M8 12h2l1.5-2.5 2 4.5 1.5-2h1"/>',
prec:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
chart:'<path d="M3 20h18"/><path d="M6 16l4-5 3 3 5-7"/>',
compare:'<rect x="3" y="6" width="7" height="12" rx="2"/><rect x="14" y="4" width="7" height="16" rx="2"/>',
settings:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
ext:'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.5"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',cal:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',off:'<path d="M3 3l18 18"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.4M19 13a10 10 0 0 0-2.4-1.7M2 9.5a15 15 0 0 1 4.5-2.8M22 9.5A15 15 0 0 0 11 6"/>'};
function svg(k,w){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||1.8)+'" stroke-linecap="round" stroke-linejoin="round">'+(NI[k]||'')+'</svg>'}
var NAV2=[['home','Inicio'],['players','Jugadores'],['matchup','Partido'],['tools','Herramientas'],['more','Más']];
var TOOLN={waivers:'Waivers',stream:'Streaming',trades:'Trades',news:'Novedades',prec:'Precisión'};
var EMO={'⭐':'star','🩹':'news','📊':'chart','🆓':'waivers','🎯':'prec','🔁':'trades','🤝':'trades'};
var NV={ov:null,lock:false,n:0,busy:false,errT:0,key:''};

function nToast(t,kind){var o=document.querySelector('.tst');if(o)o.remove();var d=document.createElement('div');d.className='tst'+(kind==='err'?' err':'');d.innerHTML='<i></i><span></span>';d.lastChild.textContent=t;document.body.appendChild(d);
 requestAnimationFrame(function(){d.classList.add('on')});setTimeout(function(){d.classList.remove('on');setTimeout(function(){d.remove()},300)},kind==='err'?4500:2400)}
toast=function(t){NV.errT=Date.now();nToast(String(t).replace(/^⚠\s*/,''),'err')};
if(typeof slToast==='function')slToast=function(t){var e=/^⚠/.test(t);nToast(e?String(t).replace(/^⚠\s*/,''):'Datos actualizados',e?'err':'ok')};

function agoTxt(t){if(!t)return '';var m=Math.round((Date.now()-t)/60000);return m<1?'hace un momento':m<60?'hace '+m+' min':'hace '+Math.round(m/60)+' h'}
function shortLiga(k){k=String(k||'');if(k.length<=14)return k;return k.split(/\s+/).map(function(w){return w.charAt(0)}).join('').toUpperCase()}

header=function(){var hd=document.querySelector('header');if(!hd)return;var sub=S.tab==='tools'&&S.sub.tool;
 var t={players:'Jugadores',matchup:'Partido',tools:'Herramientas',profile:'Ajustes'}[S.tab];if(sub)t=TOOLN[S.sub.tool]||t;
 var left=S.tab==='home'?'<div class="hlogo"><img src="icon.png" alt="" onerror="this.remove()"><div class="t"><b>SUNDAY</b><i>—LOCKER—</i></div></div>':
  (sub||S.tab==='profile'?'<button class="hb" onclick="navBack()" aria-label="Atrás">'+svg('back',2)+'</button>':'')+'<div class="ttl2">'+esc(t)+'</div>';
 var ks=ligaNames(),right='';
 if(D&&ks.length>1&&S.tab!=='profile')right+='<button class="lgp" onclick="openMore(\'liga\')" aria-label="Cambiar de liga"><i></i><span>'+esc(shortLiga(LIGA))+'</span>'+svg('down',2)+'</button>';
 var k=D?alUnseen():0;if(D)right+='<button class="ib" onclick="openMore(\'alerts\')" aria-label="Alertas">'+svg('bell',2)+(k?'<span class="badge">'+k+'</span>':'')+'</button>';
 hd.innerHTML='<div class="hl">'+left+'</div><div class="hr">'+right+'</div>';
 document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px')};
addEventListener('scroll',function(){var hd=document.querySelector('header');if(hd)hd.classList.toggle('sc',scrollY>4)},{passive:true});

navBar=function(){var on=S.tab==='profile'||NV.ov==='m'?'more':S.tab;
 $('nv').innerHTML=NAV2.map(function(x){return '<button class="'+(on===x[0]?'on':'')+'" onclick="navTap(\''+x[0]+'\')" aria-label="'+x[1]+'"><span class="ni">'+svg(x[0],on===x[0]?2.1:1.8)+'</span>'+x[1]+'</button>'}).join('');document.documentElement.style.setProperty('--nvh',$('nv').offsetHeight+'px')};
function navTap(t){if(t==='more'){NV.ov==='m'?closeMore():openMore();return}if(NV.ov==='m')closeMore(true);
 if(S.tab===t&&!(t==='tools'&&S.sub.tool)){scrollTo({top:0,behavior:'smooth'});return}go(t)}

ligaBar=function(){if(!D)return '';var b=[];
 if(navigator.onLine===false)b.push(['off','','Sin conexión. Mostrando los últimos datos guardados.','']);
 else if(typeof SL!=='undefined'&&SL.err&&SL.lid===R.liga_id)b.push(['warn','err','No se pudo leer Sleeper.','Reintentar']);
 if(typeof SL!=='undefined'&&SL.wk&&+R.semana&&SL.wk!==+R.semana&&SL.lid===R.liga_id)b.push(['warn','','Sleeper ya está en la semana '+SL.wk+' y el modelo en la '+R.semana+'. Corre ActualizarTodo en el Excel.','']);
 return b.map(function(x){return '<div class="bnr '+x[1]+'"'+(x[3]?' onclick="doRefresh()"':'')+'>'+svg(x[0],2)+'<span>'+esc(x[2])+'</span>'+(x[3]?'<b>'+x[3]+'</b>':'')+'</div>'}).join('')};
if(typeof lvHead==='function')lvHead=function(){return '<div class="lvh"><span><i class="dot'+(LV.any?' on':'')+'"></i>'+(LV.any?'En juego':LV.started?'Sin partidos en juego ahora':'Aún no empieza la semana')+' · Semana '+esc(LV.wk||R.semana)+'</span></div>'};

(function(){
 var _h=V.home;V.home=function(){return _h().replace('<span class="mu" style="font-size:16px">⌄</span>','').replace('⚠ Al momento (Sleeper)','Alertas')};
 var _t=V.tools;V.tools=function(){var t=cur('tool','');
  if(!t)return '<div class="tiles">'+[['waivers','Waivers','Altas, byes, radar y FAAB'],['stream','Streaming','QB, TE, DST y K'],['trades','Trades','Sugeridos, analizar, comprar y vender'],['news','Novedades','Lesiones y estatus'],['prec','Precisión','Qué tan bien acierta el modelo']].map(function(x){return '<button class="tile" onclick="setSub(\'tool\',\''+x[0]+'\')"><div class="tic">'+svg(x[0])+'</div><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></button>'}).join('')+'</div>';
  var h=_t();if(t==='trades')h=h.replace(/<span class="sm">[^<]*<\/span><\/h3>/,'</h3>');return h};
 V.profile=function(){var h='';
  if(D)h+=card('Mi equipo','<div class="kv"><span>Equipo</span><b>'+esc(R.equipo)+'</b><span>Liga</span><b>'+esc(R.liga)+'</b><span>Semana</span><b>'+esc(R.semana)+'</b><span>Récord</span><b>'+esc(R.record_yo)+'</b><span>FAAB restante</span><b>$'+n(R.faab_restante,0)+'</b><span>DST / K</span><b>'+esc(R.mi_dst)+' / '+esc(R.mi_k)+'</b></div>');
  if(J&&ligaNames().length)h+=card('Datos','<div class="kv">'+ligaNames().map(function(k){return '<span>Modelo · '+esc(k)+'</span><b>'+esc(J.ligas[k].fecha)+'</b>'}).join('')+(typeof SL!=='undefined'&&SL.t?'<span>Sleeper</span><b>'+agoTxt(SL.t)+'</b>':'')+'</div><button class="btn sec" style="margin:14px 0 0" onclick="this.textContent=\'Leyendo el Excel… (hasta 2 min)\';load(\'refresh\')">Volver a leer el Excel</button><div class="note">Úsalo solo si acabas de guardar el Excel y no ves los cambios.</div>');
  h+=card('Conexión','<div class="sm mu">URL de la aplicación web de Apps Script (termina en /exec)</div><input id="cu" value="'+esc(CFG?CFG.url:'')+'" placeholder="https://script.google.com/macros/s/.../exec"><div class="sm mu">Clave (la misma que pusiste en API_KEY)</div><input id="ck" type="password" value="'+esc(CFG?CFG.key:'')+'"><button class="btn sec" style="margin-bottom:0" onclick="saveCfg()">Guardar y conectar</button>');
  return h};
})();

(function(){var _r=render;render=function(){_r();var m=$('m');
 if(!D&&S.tab!=='profile')m.innerHTML='<div class="sk" style="height:18px;width:40%;border-radius:8px"></div><div class="sk" style="height:190px"></div><div class="sk" style="height:300px"></div>';
 var key=S.tab+'|'+(S.sub.tool||'')+'|'+LIGA;if(key!==NV.key){NV.key=key;m.classList.remove('vin');void m.offsetWidth;m.classList.add('vin')}}})();

function snap(){return {tab:S.tab,tool:S.sub.tool||''}}
function same(a,b){return a&&b&&a.tab===b.tab&&a.tool===b.tool}
function navTo(fn){var st=history.state||{},y=scrollY,prev=snap(),wasM=NV.ov==='m';fn();if(NV.lock)return;var now=snap();
 if(wasM){history.replaceState({v:now},'');return}
 if(same(prev,now))return;if(st.v){st.v.y=y;history.replaceState(st,'')}history.pushState({v:now},'');NV.n++}
function navBack(){if(NV.n>0)history.back();else{S.sub.tool='';if(S.tab==='profile')S.tab='home';render();scrollTo(0,0)}}
(function(){
 var _go=go;go=function(t,tool){var a=arguments;navTo(function(){_go.apply(null,a)})};
 var _ss=setSub;setSub=function(id,v){if(id==='tool')navTo(function(){_ss(id,v);scrollTo(0,0)});else _ss(id,v)};
 var _op=openP;openP=function(name){_op(name);if(NV.ov!=='p'){if(NV.ov==='m')closeMore(true);NV.ov='p';history.pushState({v:snap(),ov:'p'},'');NV.n++}};
 var _cp=closeP;closeP=function(silent){var was=NV.ov==='p';_cp();if(was){NV.ov=null;if(silent!==true)history.back()}};
 drawer=function(o){if(o)openMore();else closeMore(true)};
 history.replaceState({v:snap()},'');
 addEventListener('popstate',function(e){NV.lock=true;
  if(NV.ov==='m'){closeMore(true)}
  else if(NV.ov==='p'){_cp();NV.ov=null}
  else{var v=e.state&&e.state.v;if(v){S.tab=v.tab;S.sub.tool=v.tool;render();scrollTo(0,v.y||0)}}
  if(NV.n>0)NV.n--;NV.lock=false});
})();

(function(){var d=document.createElement('div');d.id='more';d.innerHTML='<div class="bg" onclick="closeMore()"></div><div class="pn" id="mpn"></div>';document.body.appendChild(d)})();
function mi(ic,txt,sub,act,end,id){return '<button class="mi"'+(id?' id="'+id+'"':'')+' onclick="'+act+'"><span class="mic">'+svg(ic)+'</span><span class="mtx">'+txt+(sub?'<small>'+sub+'</small>':'')+'</span><span class="end">'+(end||svg('chev'))+'</span></button>'}
function moreHtml(mode){var ks=ligaNames(),h='<div class="mtop"><div class="grab"></div><button class="mx" onclick="closeMore()" aria-label="Cerrar">'+svg('x',2.2)+'</button></div>';
 if(mode==='alerts')return h+alertsHtml();
 var lig=ks.length>1?'<div class="mlab">Liga</div><div class="mg">'+ks.map(function(k,i){var on=k===LIGA;return '<button class="mi" onclick="pickLiga2('+i+')"><span class="mic">'+shield(on?'#C8F36A':'#8B95A7').replace('class="shield"','style="width:20px;height:22px"')+'</span><span class="mtx">'+esc(k)+'</span><span class="end ok">'+(on?svg('check',2.4):'')+'</span></button>'}).join('')+'</div>':'';
 if(mode==='liga')return h+lig;
 if(D)h+='<div class="mhd">'+shield('#C8F36A')+'<div><b>'+esc(R.equipo)+'</b><span>'+esc(R.liga||LIGA)+' · '+esc(R.record_yo||'')+' · Semana '+esc(R.semana)+'</span></div></div>';
 var sl=typeof SL!=='undefined'&&SL.t&&SL.lid===R.liga_id?SL.t:0;
 h+='<div class="mg">'+mi('refresh','Actualizar',NV.busy?'Actualizando…':(sl?'Última vez '+agoTxt(sl):'Sleeper, En vivo y datos del modelo'),'doRefresh()','', 'mref')+'</div>';
 h+=lig;
 h+='<div class="mg">'+mi('settings','Ajustes','Mi equipo, datos y conexión',"go('profile')")+
  (D&&R.liga_id?'<a class="mi" href="https://sleeper.com/leagues/'+esc(R.liga_id)+'/team" target="_blank" onclick="closeMore()"><span class="mic">'+svg('ext')+'</span><span class="mtx">Abrir en Sleeper</span><span class="end"></span></a>':'')+'</div>';
 return h+'<div class="mft">SUNDAY LOCKER</div>'}
function openMore(mode){$('mpn').innerHTML=moreHtml(mode);if(mode==='alerts'){alMarkSeen();header()}$('mpn').scrollTop=0;$('more').classList.add('open');if(NV.ov!=='m'){NV.ov='m';history.pushState({v:snap(),ov:'m'},'');NV.n++}navBar()}
function closeMore(silent){if(NV.ov!=='m'){$('more').classList.remove('open');return}$('more').classList.remove('open');NV.ov=null;navBar();if(silent!==true)history.back()}
function pickLiga2(i){var ks=ligaNames();if(ks[i]===LIGA){closeMore();return}closeMore();setLiga(i)}

function doRefresh(){if(NV.busy)return Promise.resolve();NV.busy=true;var t0=Date.now();
 var r=$('mref');if(r){r.classList.add('spin');r.querySelector('small').textContent='Actualizando…'}
 var ps=[];var add=function(p){if(p&&p.then)ps.push(p.catch(function(){}))};
 if(CFG)add(load());if(D&&R.liga_id){if(typeof slLoad==='function')add(slLoad(true));if(typeof liveLoad==='function')add(liveLoad(true))}
 return Promise.all(ps).then(function(){NV.busy=false;if(NV.ov==='m')closeMore();ptrEnd();
  if(NV.errT>=t0)return;if(typeof SL!=='undefined'&&SL.err&&SL.lid===R.liga_id)nToast('No se pudo leer Sleeper','err');else nToast('Datos actualizados','ok')})}

var PT={y0:null,dy:0,el:null};
(function(){var e=document.createElement('div');e.id='ptr';e.innerHTML=svg('refresh',2.2);document.body.appendChild(e);PT.el=e})();
function ptrSet(dy){var d=Math.min(dy*0.5,80);PT.el.style.transform='translateY('+d+'px)';PT.el.style.opacity=Math.min(1,d/40);PT.el.firstChild.style.transform='rotate('+(d*4)+'deg)'}
function ptrEnd(){PT.el.classList.add('go');PT.el.classList.remove('spin');PT.el.style.transform='';PT.el.style.opacity=0;setTimeout(function(){PT.el.classList.remove('go')},260)}
addEventListener('touchstart',function(e){PT.y0=(scrollY<=0&&!NV.ov&&!NV.busy&&e.touches.length===1)?e.touches[0].clientY:null;PT.dy=0},{passive:true});
addEventListener('touchmove',function(e){if(PT.y0==null)return;PT.dy=e.touches[0].clientY-PT.y0;if(scrollY>0){PT.y0=null;ptrEnd();return}if(PT.dy>0)ptrSet(PT.dy)},{passive:true});
addEventListener('touchend',function(){if(PT.y0==null)return;PT.y0=null;if(PT.dy>140){PT.el.classList.add('go','spin');PT.el.style.transform='translateY(70px)';PT.el.style.opacity=1;doRefresh()}else ptrEnd()},{passive:true});
addEventListener('online',function(){render()});addEventListener('offline',function(){render()});

// ---------- alertas (campana) ----------
(function(){var st=document.createElement('style');st.textContent='.mtop{position:relative;height:30px;margin:0 0 8px}.mtop .grab{position:absolute;left:50%;top:6px;margin:0 0 0 -19px}.mx{position:absolute;right:0;top:0}';document.head.appendChild(st)})();
function alList(){if(!D)return [];var a=[],seen={};
 rows('App_Novedades').filter(function(r){return r['Equipo Fantasy']===R.equipo&&typeof r.Prob==='number'&&r.Prob<0.9}).forEach(function(r){seen[r.Jugador]=1;
  a.push({k:'n|'+r.Jugador+'|'+r.Estado+'|'+r.Prob,nm:r.Jugador,pos:r.Pos,nfl:r.NFL,t:[r.Estado,r['Lesión']].filter(Boolean).join(' · '),r:p(r.Prob)+' juega',c:r.Prob<0.5?'rd':'y'})});
 if(typeof SL!=='undefined'&&SL.me&&SL.lid===R.liga_id){SL.me.cur.forEach(function(x){if(seen[x.Jugador])return;var bad=slBad(x.inj)||x.sin||x.P<=0.01;if(!bad)return;seen[x.Jugador]=1;
   a.push({k:'s|'+x.Jugador+'|'+x.inj+'|'+(x.P<=0.01),nm:x.Jugador,pos:x.Pos,nfl:x.NFL,t:'Titular · '+(x.inj?x.inj:x.sin?'sin proyección':'0 pts proyectados (¿bye?)'),r:'Revisar',c:'rd'})});
  (SL.taken||[]).forEach(function(nm){a.push({k:'w|'+nm+'|'+(SL.own&&SL.own[nm]),nm:nm,pos:'',nfl:'',t:'Waiver sugerido · ya lo tomó '+((SL.own&&SL.own[nm])||'otro equipo'),r:'',c:'y'})})}
 return a}
function alSeen(){try{return JSON.parse(localStorage.getItem('sl_seen')||'{}')}catch(e){return {}}}
function alUnseen(){var s=alSeen();return alList().filter(function(x){return !s[LIGA+'|'+x.k]}).length}
function alMarkSeen(){var s=alSeen();alList().forEach(function(x){s[LIGA+'|'+x.k]=1});try{localStorage.setItem('sl_seen',JSON.stringify(s))}catch(e){}}
function alertsHtml(){var a=alList();window._al=a;
 var h='<div class="mlab">Alertas de tu equipo</div><div class="mg">'+(a.length?a.map(function(x,i){return '<button class="alr" onclick="alOpen('+i+')">'+(x.pos?pb(x.pos):'<div class="pos FLEX">'+svg('waivers')+'</div>')+'<div class="b"><div class="n">'+esc(x.nm)+'</div><div class="s">'+esc(x.t)+'</div></div><span class="r '+x.c+'">'+esc(x.r)+'</span></button>'}).join(''):'<div class="alr" style="cursor:default"><div class="b"><div class="n">Todo en orden</div><div class="s">Ningún jugador de tu equipo con lesión, duda o bye entre tus titulares.</div></div></div>')+'</div>';
 return h+'<div class="mg">'+mi('news','Ver todas las novedades','Lesiones y estatus de la liga',"S.sub.nw='Mi equipo';go('tools','news')")+'</div>'}
function alOpen(i){var x=window._al[i];if(!x)return;if(!x.pos){go('tools','waivers');return}openP(x.nm)}

// ---------- semanas ----------
var WK={sel:null,cache:{},busy:{}};
function wkBase(){return +R.semana||1}
function wkBar(){var b=wkBase(),sel=WK.sel||b,h='<div class="seg wkb">';for(var w=1;w<=17;w++)h+='<button class="'+(w===sel?'on ':'')+(w===b?'cur':'')+'" onclick="pickWk('+w+')">'+(w===b?'Sem '+w:'S'+w)+'</button>';return h+'</div>'}
function pickWk(w){WK.sel=w===wkBase()?null:w;render();scrollTo(0,0)}
function wkName(id,ix){id=String(id);if(/^[A-Z]{2,3}$/.test(id)){var t=nfl(id);return {nm:ix.dst[t]||(t+' DST'),pos:'DST',nfl:t}}
 var x=(typeof SL!=='undefined'&&SL.I&&SL.I[id]);if(x)return {nm:x.nm,pos:x.pos,nfl:x.nfl};
 var q=(typeof SL!=='undefined'&&SL.pl&&SL.pl.m[id]);if(q)return {nm:q[0],pos:q[1],nfl:q[2]};
 var nm=ix.byId[id];if(nm){var b=ix.byName[nm]||{};return {nm:nm,pos:b.pos||'',nfl:b.nfl||''}}return {nm:'Jugador '+id,pos:'',nfl:''}}
function wkPast(w){var lid=R.liga_id,key=lid+'|'+w,d=WK.cache[key];
 if(!d){if(!WK.busy[key]){WK.busy[key]=1;jget(SLP+'league/'+lid+'/matchups/'+w).then(function(m){WK.cache[key]=m;WK.busy[key]=0;if(S.tab==='matchup'&&WK.sel===w)render()}).catch(function(e){WK.busy[key]=0;WK.cache[key]={err:e.message};if(S.tab==='matchup'&&WK.sel===w)render()})}
  return '<div class="sk" style="height:170px"></div><div class="sk" style="height:320px"></div>'}
 if(d.err)return card('Semana '+w,'<div class="empty">No se pudo leer Sleeper: '+esc(d.err)+'</div>');
 var names=(typeof SL!=='undefined'&&SL.names)||LV.names||{};var rid=null;for(var k in names)if(names[k]===R.equipo)rid=+k;
 if(rid==null){if(typeof slLoad==='function')slLoad(false);return card('Semana '+w,'<div class="empty">Cargando equipos de Sleeper…</div>')}
 var ix=lvIdx(),me=d.filter(function(m){return m.roster_id===rid})[0];if(!me||me.matchup_id==null)return card('Semana '+w,'<div class="empty">No tuviste partido esta semana.</div>');
 var op=d.filter(function(m){return m.matchup_id===me.matchup_id&&m.roster_id!==rid})[0];
 var pts=function(m){return typeof m.points==='number'?m.points:0},a=pts(me),b=op?pts(op):0,win=a>b;
 var list=function(m){var pp=m.players_points||{};return (m.starters||[]).filter(function(x){return x&&x!=='0'}).map(function(id){var x=wkName(id,ix);return '<div class="row tap" onclick="openP(\''+esc(x.nm).replace(/'/g,"\\'")+'\')">'+pb(x.pos)+av(x.nm,x.nfl,x.pos)+'<div class="b"><div class="n">'+esc(x.nm)+'</div><div class="s">'+esc(x.nfl)+'</div></div><div class="r"><b>'+n(+pp[id]||0)+'</b><small>Pts</small></div></div>'}).join('')};
 var opN=op?(names[op.roster_id]||('Equipo '+op.roster_id)):'—';
 var h=card('','<div class="vs"><div class="side">'+shield('#C8F36A')+'<div class="nm">'+esc(R.equipo)+'</div><div class="pts">'+n(a)+'</div></div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(opN)+'</div><div class="pts">'+n(b)+'</div></div></div><div style="text-align:center;margin-top:12px"><span class="res '+(win?'w':'l')+'">'+(a===b?'EMPATE':win?'GANASTE':'PERDISTE')+' · '+(a-b>=0?'+':'')+n(a-b)+'</span></div>');
 h+=card('Mis titulares',list(me),'<span>Pts</span>');if(op)h+=card(esc(opN),list(op),'<span>Pts</span>');
 var by={};d.forEach(function(m){if(m.matchup_id==null||m.matchup_id===me.matchup_id)return;(by[m.matchup_id]=by[m.matchup_id]||[]).push(m)});
 var ot=Object.keys(by).map(function(k){var p2=by[k];if(p2.length<2)return '';var x=pts(p2[0]),y=pts(p2[1]);return '<div class="mt"><div class="mtr"><span class="n">'+esc(names[p2[0].roster_id]||'')+'</span><b class="'+(x>y?'l':'')+'">'+n(x)+'</b></div><div class="mtr" style="margin-top:4px"><span class="n">'+esc(names[p2[1].roster_id]||'')+'</span><b class="'+(y>x?'l':'')+'">'+n(y)+'</b></div></div>'}).join('');
 if(ot)h+=card('Resto de la liga',ot);return h}
function wkFuture(w){var c=rows('App_Calendario').filter(function(r){return +r.Semana===w})[0];
 if(!c&&w<15)return card('Semana '+w,'<div class="empty">El calendario del Excel no tiene datos de esta semana.</div>');
 if(!c||c.Rival==='Playoffs'||w>=15)return card('Semana '+w+' · Playoffs','<div class="kv"><span>Prob. de llegar a playoffs</span><b class="l">'+p(R.pct_playoffs)+'</b><span>Prob. de llegar a la final</span><b>'+p(R.pct_final)+'</b><span>Prob. de campeón</span><b>'+p(R.pct_campeon)+'</b><span>Pts de tus titulares en playoffs</span><b>'+n(R.playoffs_pts,0)+'</b></div><div class="note">El rival de playoffs se define al terminar la temporada regular.</div>');
 var bye=String(c['Titulares en bye']||'')+','+String(c['Otros en bye']||'');var byeN={};bye.split(/,\s*/).forEach(function(x){x=x.replace(/\s*\([^)]*\)\s*$/,'').trim();if(x&&x!=='—')byeN[x]=1});
 var mine=rows('App_RankROS').filter(function(r){return r['Dueño']===R.equipo&&!byeN[r.Jugador]}).map(function(r){return {Jugador:r.Jugador,Pos:r.Pos,NFL:r.NFL,P:+r['ROS por semana']||0}});
 var slots=String(R.slots||'QB,RB,RB,WR,WR,WR,TE,FLEX,K,DST').split(','),lu=lineup(mine,slots,'P');
 var pw=rows('App_Power').filter(function(r){return r.Equipo===c.Rival})[0],pg=c['Prob ganar'];
 var h=card('','<div class="vs"><div class="side">'+shield('#C8F36A')+'<div class="nm">'+esc(R.equipo)+'</div><div class="pts">'+n(lu.t)+'</div><div class="lbl">Estimado</div></div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(c.Rival)+'</div><div class="pts">'+n(c['Fuerza rival'])+'</div><div class="lbl">Rank #'+esc(c['Rank rival'])+'</div></div></div>'+(typeof pg==='number'?'<div class="prob"><i style="width:'+Math.round(pg*100)+'%"></i></div><div class="sm mu" style="margin-top:6px">Prob. de ganar <b class="l">'+p(pg)+'</b></div>':''));
 h+=card('Para esta semana','<div class="kv"><span>Titulares en bye</span><b>'+esc(c['Titulares en bye']||'—')+'</b><span>Otros en bye</span><b>'+esc(c['Otros en bye']||'—')+'</b>'+(pw?'<span>Rival más débil en</span><b class="rd">'+esc(pw['Más débil'])+'</b>':'')+'</div>'+(c.Alerta?'<div class="note y">'+esc(c.Alerta)+'</div>':''));
 h+=card('Alineación estimada',lu.sel.map(function(x){var r=x[1];return '<div class="row tap" onclick="openP(\''+esc(r.Jugador).replace(/'/g,"\\'")+'\')"><div class="pos FLEX" style="font-size:10px">'+esc(x[0])+'</div>'+av(r.Jugador,r.NFL,r.Pos)+'<div class="b"><div class="n">'+esc(r.Jugador)+'</div><div class="s">'+esc(r.NFL+' · '+r.Pos)+'</div></div><div class="r"><b>'+n(r.P)+'</b><small>Pts/sem</small></div></div>'}).join('')+'<div class="note">Estimación con el promedio de puntos ROS por semana, sin los jugadores en bye. La proyección detallada se calcula cuando el modelo llega a esa semana.</div>','<span>Pts</span>');
 return h}
(function(){var _m=V.matchup;V.matchup=function(){var w=WK.sel,b=wkBase();
 if(!w)return wkBar()+_m();
 return wkBar()+'<div class="wkh"><b>Semana '+w+'</b><button onclick="pickWk('+b+')">Volver a la actual</button></div>'+(w<b?wkPast(w):wkFuture(w))}})();

// ---------- render: scroll de menús, buscadores en vivo, semana en inicio ----------
function navPost(m,sv,same){
 m.querySelectorAll('.ins .ic,.row .ic,.tile .e').forEach(function(e){var k=EMO[e.textContent.trim()];if(k){e.innerHTML=svg(k);e.classList.add('ici')}});
 m.querySelectorAll('.tabs,.seg').forEach(function(e,i){if(same&&sv&&sv[i]!=null)e.scrollLeft=sv[i];var b=e.querySelector('button.on');if(b&&(b.offsetLeft<e.scrollLeft||b.offsetLeft+b.offsetWidth>e.scrollLeft+e.clientWidth))e.scrollLeft=Math.max(0,b.offsetLeft-(e.clientWidth-b.offsetWidth)/2)});
 m.querySelectorAll('input[onchange]').forEach(function(inp){var mm=/S\.sub\.(\w+)=this\.value/.exec(inp.getAttribute('onchange')||'');if(!mm)return;var k=mm[1];inp.setAttribute('data-k',k);
  if(/Enter/.test(inp.placeholder))inp.placeholder='Buscar jugador…';inp.setAttribute('autocomplete','off');
  inp.oninput=function(){var v=inp.value;clearTimeout(NV.it);NV.it=setTimeout(function(){S.sub[k]=v;liveUpd(k)},120)}});
 var wk=m.querySelector('.week');if(wk&&!wk.querySelector('.wkc')){wk.insertAdjacentHTML('beforeend','<span class="wkc">'+svg('cal')+'</span>');wk.onclick=function(){WK.sel=null;go('matchup')}}}
function liveUpd(k){var m=$('m'),old=m.querySelector('input[data-k="'+k+'"]');if(!old||document.activeElement!==old){render();return}
 var sv=[].map.call(m.querySelectorAll('.tabs,.seg'),function(e){return e.scrollLeft});
 var t=document.createElement('div');t.innerHTML=(D?ligaBar():'')+V[S.tab]();var ni=t.querySelector('input[onchange*="S.sub.'+k+'="]');if(!ni){render();return}
 [].slice.call(m.childNodes).forEach(function(c){if(c!==old)m.removeChild(c)});
 var before=true;[].slice.call(t.childNodes).forEach(function(c){if(c===ni){before=false;return}if(before)m.insertBefore(c,old);else m.appendChild(c)});
 navPost(m,sv,true)}
(function(){var _r=render;render=function(){var m=$('m'),sv=m?[].map.call(m.querySelectorAll('.tabs,.seg'),function(e){return e.scrollLeft}):null,k0=NV.key;
 _r();navPost($('m'),sv,NV.key===k0)}})();

// ---------- cerrar el menú deslizando hacia abajo ----------
(function(){var y0=null,pn=$('mpn');pn.addEventListener('touchstart',function(e){y0=pn.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
 pn.addEventListener('touchmove',function(e){if(y0==null)return;var d=e.touches[0].clientY-y0;if(d>0){pn.style.transition='none';pn.style.transform='translateY('+d+'px)'}},{passive:true});
 pn.addEventListener('touchend',function(e){if(y0==null)return;var d=(e.changedTouches[0].clientY-y0);y0=null;pn.style.transition='';pn.style.transform='';if(d>90)closeMore()},{passive:true})})();

render();
