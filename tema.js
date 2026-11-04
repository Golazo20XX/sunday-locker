// ===== SUNDAY LOCKER · tema.js v4 · navegación, tema claro, dashboard, ficha, cambios de alineación, tabla de jugadores y valor de trade =====
// Va DESPUÉS de partido.js en index.html. No cambia datos ni cálculos del modelo: cambia la organización y cómo se ve.
(function(){
 var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&display=swap';document.head.appendChild(lk);
 var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute('content','#0B0F17');
 var st=document.createElement('style');st.id='tema';st.textContent=[
 // ---- paleta: marco negro de marca + contenido claro ----
 ':root{--ink:#0B0F17;--br:#C8F36A;--ob:#F2F4F8;--gr2:#FFFFFF;--gr:#EEF1F6;--ln:#E3E7EE;--tx:#101828;--mu:#667085;--li:#0E9F5A;--ok:#12A150;--bad:#D92D20;--wa:#B76E00}',
 'html,body{background:var(--ob);color:var(--tx)}body{font-variant-numeric:tabular-nums}',
 '.ttl2,.week,.wkh b,.card h3,.ph h2,.sech b{font-family:"Barlow Condensed",Inter,sans-serif!important;font-style:italic;font-weight:800;letter-spacing:.3px;text-transform:uppercase}',
 '.ttl2{font-size:23px}.week{font-size:34px;line-height:1;margin:2px 0 14px}.wkh b{font-size:22px}.ph h2{font-size:30px;line-height:1;margin:12px 0 4px}',
 // ---- pantalla de inicio (splash) se mantiene oscura ----
 '#splash{background:var(--ink)!important;color:#fff}#splash .wm small,#splash .tag{color:#fff}#splash .load{background:#2E3746}',
 // ---- encabezado negro de marca ----
 'header,header.sc{background:var(--ink)!important;color:#fff;border-bottom:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'+
 '.hlogo .t i{color:rgba(255,255,255,.72)!important;letter-spacing:2.5px}#ptr{background:#fff!important;border-color:var(--ln)!important;box-shadow:none!important}header .ib,header .hb{color:#fff}.hb:active{background:rgba(255,255,255,.1)!important}',
 '.badge{background:var(--br)!important;color:var(--ink)!important}',
 '.lgp{background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important}.lgp i{background:var(--br)!important}.lgp svg{color:rgba(255,255,255,.6)!important}',
 // ---- pestañas de sección: franja negra pegada al encabezado ----
 '.tabs{background:var(--ink)!important;margin:-18px -14px 14px!important;padding:0 16px!important;gap:22px!important;border:0!important}',
 '.tabs button{border:0!important;border-radius:0!important;background:none!important;padding:11px 0 10px!important;color:rgba(255,255,255,.55)!important;font-weight:600!important;border-bottom:3px solid transparent!important}',
 '.tabs button.on{color:#fff!important;font-weight:700!important;border-bottom-color:var(--br)!important}',
 // ---- filtros: pastillas, la activa en negro ----
 '.seg button{background:#fff!important;border:1px solid var(--ln)!important;color:var(--mu)!important;border-radius:16px;font-weight:600}',
 '.seg button.on{background:var(--ink)!important;border-color:var(--ink)!important;color:#fff!important}',
 '.wkb button.cur:not(.on){color:var(--tx)!important;border-color:#98A2B3!important}',
 // ---- barra inferior blanca ----
 'nav,nav#nv{background:#fff!important;border-top:1px solid var(--ln)!important;box-shadow:none!important}',
 'nav button{color:#6B7689!important}nav button.on{color:var(--ink)!important;font-weight:700}nav button.on .ni{background:var(--br)!important}',
 '#busy{background:var(--br)!important}',
 // ---- tarjetas blancas ----
 '.card{background:#fff;border:1px solid #E6EAF0;border-radius:16px;box-shadow:none}',
 '.card h3{font-size:17px;color:var(--tx);align-items:baseline;margin-bottom:10px}',
 '.card h3>:nth-child(2){font-family:Inter,sans-serif;font-style:normal;font-size:10.5px;font-weight:600;letter-spacing:.6px;color:var(--mu)}',
 // ---- marcador (tú vs rival): tarjeta clara con tono verde ----
 '.card:has(>.vs){background:linear-gradient(180deg,#F3FBEA 0%,#FFFFFF 75%);border:1px solid #D7EBC2}',
 '.card:has(>.vs) .vsc{background:#fff;border-color:#D7EBC2;color:var(--mu)}.card:has(>.vs) .prob{background:#E3E7EE}.card:has(>.vs) .prob i{background:var(--li)}',
 '.hlk{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:12px;color:var(--li);font-size:12px;font-weight:700;background:none;border:0;width:100%}.hlk svg{width:14px;height:14px}',
 // ---- posiciones: chips pastel ----
 '.pos{width:34px;height:22px;border-radius:7px;font-size:10px;font-weight:800;letter-spacing:.3px;border:0!important}.pos svg{width:14px;height:14px}',
 '.QB{background:#D9EEFB;color:#1D6FA5}.RB{background:#F7DED5;color:#A04A2A}.WR{background:#E2DEFB;color:#4B3FB5}.TE{background:#FBEDC9;color:#8A6200}',
 '.K,.DST,.DEF,.BN{background:#E9ECF1;color:#4A5568}.FLEX{background:#E3F5EA;color:#0E7A47}',
 // ---- logos y fotos ----
 '.av{background:var(--gr);color:var(--mu)}.av.tm{border-radius:10px;background:#F4F6F9;border:1px solid #E6EAF0}.av.tm img{object-fit:contain;padding:4px}',
 '.phw{position:relative;display:inline-block}.phw .tmb{position:absolute;right:-2px;bottom:-2px;width:34px;height:34px;border-radius:50%;background:#fff center/74% no-repeat;border:2px solid #fff;box-shadow:0 2px 6px rgba(16,24,40,.15)}',
 '.ph .bigav{border-color:var(--br)!important;background:var(--gr)!important;color:var(--ink)!important}',
 // ---- filas ----
 '.row{border-top-color:#EEF1F5}.row .r{min-width:56px;padding:6px 8px;border-radius:10px;background:#F2F5F9;text-align:center}.row .r b{font-size:15px}.row .r small{font-size:8.5px}',
 '.row.mine{box-shadow:inset 3px 0 0 var(--li);padding-left:10px}',
 '.row.tap:active,.ins:active,.mt:active,.pml:active{background:rgba(16,24,40,.04)!important}',
 '.row.sel,.mt.me,.pml.me{background:#EEF8F2!important;border:1px solid #BFE6D0!important}',
 // ---- chips y estados ----
 '.chip{background:#F2F4F7;border:1px solid transparent;border-radius:8px;padding:2px 8px;color:var(--mu)}.chip b{color:var(--tx)}',
 '.chip:has(.g){background:#E7F6EE}.chip:has(.rd){background:#FDECEC}.chip:has(.y){background:#FFF4E0}',
 '.pill.ok{background:#E7F6EE;color:#0E7A47;border:1px solid #BFE6D0}.pill.wa{background:#FFF4E0;color:#9A5B00;border:1px solid #F5D9A8}',
 '.pill[style*="3a1a1a"]{background:#FDECEC!important;color:#B42318!important;border-color:#F5C2C2!important}',
 '.res.w{background:#E7F6EE;color:#0E7A47}.res.l{background:#FDECEC;color:#B42318}',
 '.prob,.pbar{background:#E3E7EE!important}.prob i,.pbar i{background:var(--li)}.bb{background:var(--li)}',
 '.stat3 div{background:#F4F6F9;border:1px solid #E6EAF0}.vg div{background:#F7F8FA;border-color:#E6EAF0}',
 '.bnr{background:#FFF7E6!important;border-color:#F5D9A8!important;color:#8A5A00!important}.bnr.err{background:#FDECEC!important;border-color:#F5C2C2!important;color:#B42318!important}',
 'input,select{background:#fff!important;color:var(--tx)!important;border-color:var(--ln)!important}',
 // ---- botones ----
 '.btn{background:var(--ink);color:#fff;border-radius:14px}.btn.sec{background:#fff;color:var(--tx);border:1px solid var(--ln)}',
 // ---- menú, avisos, carga ----
 '#more .pn{background:#fff!important;border-color:var(--ln)!important}.mg{background:#F7F8FA!important;border-color:#E6EAF0!important}.mi:active{background:rgba(16,24,40,.04)!important}.mi .mic{background:#F0F9DC!important;color:#3F6212!important}',
 '.tst{background:#111827!important;color:#fff!important;border-color:#111827!important}',
 '.sk{background:#E9EDF3!important;animation:none!important;border-color:#E6EAF0!important}',
 '.ins .ic.ici,.row .ic.ici{background:#F0F9DC!important;color:#3F6212!important}',
 // ---- inicio: secciones, movidas sugeridas y accesos rápidos ----
 '.sech{display:flex;justify-content:space-between;align-items:baseline;margin:20px 2px 10px}.sech b{font-size:19px}.sech span{font-size:11px;color:var(--mu)}',
 '.car{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -14px;padding:2px 14px 8px;scrollbar-width:none}.car::-webkit-scrollbar{display:none}',
 '.mv{flex:0 0 80%;max-width:320px;scroll-snap-align:start;text-align:left;background:#fff;border:1px solid #E6EAF0;border-radius:16px;padding:12px 14px;color:var(--tx);display:flex;flex-direction:column;gap:10px}.mv:active{transform:scale(.985)}',
 '.mvl{align-self:flex-start;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:6px}.mvl.k-ok{background:#E7F6EE;color:#0E7A47}.mvl.k-wa{background:#FFF4E0;color:#9A5B00}.mvl.k-rd{background:#FDECEC;color:#B42318}.mvl.k-in{background:#E8EEF9;color:#24408E}',
 '.mvb{display:flex;align-items:center;gap:10px}.mvb .b{flex:1;min-width:0}.mvb .n{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mvb .s{font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
 '.mvb .r{text-align:right;flex:none}.mvb .r b{font-size:19px;display:block}.mvb .r small{font-size:9px;color:var(--mu);text-transform:uppercase;letter-spacing:.5px}',
 '.mvb .ic2{width:36px;height:36px;border-radius:10px;background:#F0F9DC;color:#3F6212;display:flex;align-items:center;justify-content:center;flex:none}.mvb .ic2 svg{width:19px;height:19px}',
 '.mvf{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:var(--li);border-top:1px solid #EEF1F5;padding-top:9px}.mvf svg{width:14px;height:14px}',
 '.qk{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.qk button{background:#fff;border:1px solid #E6EAF0;border-radius:14px;padding:12px 2px 10px;display:flex;flex-direction:column;align-items:center;gap:7px;font-size:11px;font-weight:600;color:var(--tx)}.qk button:active{transform:scale(.96)}',
 '.qk i{width:40px;height:40px;border-radius:12px;background:#F0F9DC;color:#3F6212;display:flex;align-items:center;justify-content:center}.qk i svg{width:20px;height:20px}',
 // ---- ficha de jugador: ventana que sube desde abajo ----
 '#sheet{inset:6vh 0 0 0!important;z-index:80!important;border-radius:22px 22px 0 0;background:var(--ob)!important;transform:translateY(105%)!important;transition:transform .3s cubic-bezier(.2,.8,.2,1)!important;box-shadow:0 -10px 40px rgba(0,0,0,.25)!important}#sheet.open{transform:none!important}',
 '#shbg{position:fixed;inset:0;z-index:79;background:rgba(11,15,23,.5);opacity:0;pointer-events:none;transition:opacity .25s}#shbg.on{opacity:1;pointer-events:auto}',
 '#sheet header{position:sticky!important;top:0;z-index:3;background:var(--ob)!important;color:var(--tx);padding:14px 12px 2px!important;min-height:0!important;justify-content:flex-end!important;border:0!important}#sheet header .ttl,#sheet header>span{display:none}',
 '#sheet header::before{content:"";position:absolute;left:50%;top:8px;width:40px;height:4px;margin-left:-20px;border-radius:2px;background:#C5CCD6}',
 '#sheet header .mx{position:static;background:#E6EAF0;color:var(--tx)}#sheet main{padding-top:0}',
 // ---- partido: banca ----
 '.pmt{margin-top:16px}',
 '.sw{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;padding:10px 0;border-top:1px solid #EEF1F5}.sw:first-of-type{border-top:0}.sw .x{display:flex;align-items:center;gap:8px;min-width:0;background:none;border:0;padding:0;color:var(--tx);text-align:left}.sw .x.o{flex-direction:row-reverse;text-align:right}.sw .b{min-width:0}.sw .n{font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sw .s{font-size:11px;color:var(--mu)}.sw .ar{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;font-weight:800;color:var(--li)}.sw .ar svg{width:18px;height:18px}',
 '.swh{display:grid;grid-template-columns:1fr auto 1fr;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}.swh span:first-child{color:var(--li)}.swh span:last-child{color:var(--bad);text-align:right}',
 '.swn{font-size:12px;color:#9A5B00;background:#FFF4E0;border-radius:10px;padding:8px 10px;margin-top:8px}.swt{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid #EEF1F5;font-size:12px;color:var(--mu)}.swt b{color:var(--li);font-size:15px}'
 ].join('');document.head.appendChild(st)})();

// colores de fuerza (VOR) del Power ranking, legibles en fondo claro
vor=function(v){if(typeof v!=='number')return '';var c=v>=60?'#0E9F5A':v>=20?'#4F9F72':v>=0?'#667085':'#D92D20';return '<span style="color:'+c+';font-weight:700">'+Math.round(v)+'</span>'};

// ---------- logos de equipo NFL en listas; foto + logo en la ficha ----------
var TM={d:null,m:{}};
function tmCode(t){t=String(t||'').trim().toLowerCase();if(!t||t==='fa'||t==='—')return '';if(t==='la')t='lar';return t}
function tmLogo(t){t=tmCode(t);return t?'https://sleepercdn.com/images/team_logos/nfl/'+t+'.png':''}
function tmNfl(name){if(TM.d!==D){TM.d=D;TM.m={};['App_RankROS','App_RankSemana','App_Roster','App_Novedades','App_Streaming','App_Libres'].forEach(function(k){rows(k).forEach(function(r){if(r.Jugador&&r.NFL&&!TM.m[r.Jugador])TM.m[r.Jugador]=r.NFL})})}return TM.m[name]||''}
(function(){var _av=av;av=function(name,nfl,pos,cls){var t=nfl||tmNfl(name),dst=pos==='DST'||pos==='DEF';
 if(cls==='bigav'){var h=_av(name,t,pos,cls),u=tmLogo(t);return (u&&!dst)?'<div class="phw">'+h+'<span class="tmb" style="background-image:url('+u+')"></span></div>':h}
 if(cls&&cls!=='av')return _av(name,t,pos,cls);
 var u=tmLogo(t);if(!u||dst)return _av(name,t,pos,cls);
 return '<div class="av tm">'+esc(ini(name))+'<img src="'+u+'" alt="" loading="lazy" onerror="this.remove()"></div>'}})();
// franja verde a la izquierda = jugador tuyo
(function(){var _p=prow;prow=function(r,o){var h=_p(r,o),d=r&&r['Dueño'];return d&&R&&d===R.equipo?h.replace('<div class="row tap"','<div class="row tap mine"'):h}})();

// escudos claros sobre tarjeta blanca
(function(){var _sh=shield;shield=function(c){c=c==='#C8F36A'?'#0E9F5A':c==='#8B95A7'?'#98A2B3':c;return _sh(c).replace('#161B24','#FFFFFF')}})();

// ---------- CAMBIOS DE ALINEACIÓN: quién entra y quién sale ----------
function lnSlot(rec){var m=String(rec||'').match(/^TITULAR\s+(.+)$/i);return m?m[1].toUpperCase():''}
function lnChanges(){var ros=rows('App_Roster');if(!ros.length)return null;
 var cur={},live=typeof SL!=='undefined'&&SL.me&&SL.me.cur&&SL.me.cur.length&&SL.lid===R.liga_id;
 if(live)SL.me.cur.forEach(function(x){cur[x.Jugador]=1});else ros.forEach(function(r){var e=String(r['En Sleeper']||'');if(e&&e!=='Banca'&&e!=='IR'&&e!=='Taxi')cur[r.Jugador]=1});
 var rec=ros.filter(function(r){return lnSlot(r['Recomendación'])});
 var ins=rec.filter(function(r){return !cur[r.Jugador]}),outs=ros.filter(function(r){return cur[r.Jugador]&&!lnSlot(r['Recomendación'])});
 var fx=['RB','WR','TE'],pairs=[],used={};
 ins.sort(function(a,b){return (+b.Proy||0)-(+a.Proy||0)}).forEach(function(a){var sl=lnSlot(a['Recomendación']),pa=a.Pos==='DEF'?'DST':a.Pos;
  var ok=function(o){var po=o.Pos==='DEF'?'DST':o.Pos;return po===pa||(fx.indexOf(po)>=0&&fx.indexOf(pa)>=0)};
  var o=outs.filter(function(o){return !used[o.Jugador]&&(o.Pos===a.Pos)})[0]||outs.filter(function(o){return !used[o.Jugador]&&ok(o)})[0]||outs.filter(function(o){return !used[o.Jugador]})[0];
  if(o)used[o.Jugador]=1;pairs.push({inn:a,out:o||null,slot:sl,g:(+a.Proy||0)-(o?(+o.Proy||0):0)})});
 outs.filter(function(o){return !used[o.Jugador]}).forEach(function(o){pairs.push({inn:null,out:o,slot:'',g:-(+o.Proy||0)})});
 var warn=rec.filter(function(r){return String(r.Rival).toUpperCase()==='BYE'||(+r.Proy||0)<=0.01}).map(function(r){return r.Jugador+' ('+r.Pos+') está en bye o sin proyección: busca reemplazo'+(r.Pos==='K'||r.Pos==='DST'?' en Mercado › Streaming':' en Waivers')+'.'});
 var g=pairs.reduce(function(s,x){return s+x.g},0);return {pairs:pairs,g:g,warn:warn,live:live}}
function lnSide(r,cls){if(!r)return '<div class="x '+cls+'"><div class="b"><div class="n mu">—</div></div></div>';
 return '<button class="x '+cls+'" onclick="openP(\''+esc(r.Jugador).replace(/'/g,"\\'")+'\')">'+av(r.Jugador,r.NFL,r.Pos)+'<div class="b"><div class="n">'+esc(r.Jugador)+'</div><div class="s">'+esc(r.Pos)+' · '+n(r.Proy)+' pts</div></div></button>'}
function lnCard(title){var c=lnChanges();if(!c)return '';
 if(!c.pairs.length&&!c.warn.length)return card(title||'Alineación','<div class="pill ok" style="margin:0"><span>Tu alineación ya es la óptima</span></div>');
 var h='';if(c.pairs.length){h+='<div class="swh"><span>Entra</span><span></span><span>Sale</span></div>'+c.pairs.map(function(x){return '<div class="sw">'+lnSide(x.inn,'i')+'<div class="ar">'+svg('trades',2)+(x.slot?esc(x.slot):'')+'</div>'+lnSide(x.out,'o')+'</div>'}).join('');
  h+='<div class="swt"><span>'+c.pairs.length+(c.pairs.length===1?' cambio':' cambios')+' · hazlo en Sleeper</span><b>+'+n(Math.max(0,c.g))+' pts</b></div>'}
 h+=c.warn.map(function(w){return '<div class="swn">'+esc(w)+'</div>'}).join('');
 return card(title||'Cambios sugeridos',h,c.live?'<span>Según tu alineación actual en Sleeper</span>':'')}

// ---------- NUEVA NAVEGACIÓN: 5 secciones, cada una con sus pestañas siempre visibles ----------
var NAV3=[['home','Inicio','home'],['team','Mi equipo','players'],['matchup','Partido','matchup'],['market','Mercado','trades'],['players','Jugadores','star']];
var TTL3={team:'Mi equipo',matchup:'Partido',market:'Mercado',players:'Jugadores',profile:'Ajustes',tools:'Herramientas'};
var PTO=['Mi partido','Liga','Posiciones','Power','Precisión'];
function stripTabs(h){return String(h).replace(/<div class="tabs">[\s\S]*?<\/div>/,'')}
function qGo(tab,k,v){if(k)S.sub[k]=v;go(tab)}

navBar=function(){var on=S.tab;$('nv').innerHTML=NAV3.map(function(x){return '<button class="'+(on===x[0]?'on':'')+'" onclick="navTap(\''+x[0]+'\')" aria-label="'+x[1]+'"><span class="ni">'+svg(x[2],on===x[0]?2.1:1.8)+'</span>'+x[1]+'</button>'}).join('');document.documentElement.style.setProperty('--nvh',$('nv').offsetHeight+'px')};

header=function(){var hd=document.querySelector('body>header');if(!hd)return;
 var left=S.tab==='home'?'<div class="hlogo"><img src="icon.png" alt="" onerror="this.remove()"><div class="t"><b>SUNDAY</b><i>—LOCKER—</i></div></div>':
  (S.tab==='profile'?'<button class="hb" onclick="navBack()" aria-label="Atrás">'+svg('back',2)+'</button>':'')+'<div class="ttl2">'+esc(TTL3[S.tab]||'')+'</div>';
 var ks=ligaNames(),right='';
 var k=D?alUnseen():0;if(D)right+='<button class="ib" onclick="openMore(\'alerts\')" aria-label="Alertas">'+svg('bell',2)+(k?'<span class="badge">'+k+'</span>':'')+'</button>';
 right+='<button class="ib" onclick="openMore()" aria-label="Menú">'+svg('more',2)+'</button>';
 hd.innerHTML='<div class="hl">'+left+'</div><div class="hr">'+right+'</div>';
 document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px')};

// los accesos antiguos (Herramientas, Roster) llevan a su nueva sección
(function(){var _g=go;go=function(t,tool){
 if(t==='tools'){var m={waivers:['market','mk','Waivers'],stream:['market','mk','Streaming'],trades:['market','mk','Trades'],news:['team','tm','Novedades'],prec:['matchup','pt','Precisión']}[tool]||['market','mk',S.sub.mk||'Waivers'];S.sub[m[1]]=m[2];return _g(m[0])}
 if(t==='players'&&S.sub.pl==='Roster'){S.sub.tm='Alineación';return _g('team')}
 return _g.apply(null,arguments)}})();

var _VP=V.players;
V.team=function(){var t=cur('tm','Alineación'),h=tabs('tm',['Alineación','Novedades','Temporada']);
 if(t==='Novedades')return h+T.news();
 if(t==='Temporada')return h+pmOrig('Temporada');
 var sv=S.sub.pl;S.sub.pl='Roster';var b=_VP();S.sub.pl=sv;
 return h+lnCard('Cambios sugeridos')+stripTabs(b)};
V.players=function(){var t=cur('pl','Semana');if(t==='Roster'){t='Semana';S.sub.pl=t}return tabs('pl',['Semana','ROS','Comparar'])+stripTabs(_VP())};
V.market=function(){var t=cur('mk','Waivers'),h=tabs('mk',['Waivers','Streaming','Trades']);var k={Waivers:'waivers',Streaming:'stream',Trades:'trades'}[t]||'waivers';
 return h+String(T[k]()).replace(/<div class="tabs">/g,'<div class="seg">').replace(/<span class="sm">[^<]*<\/span><\/h3>/,'</h3>')};
(function(){var _m=V.matchup;V.matchup=function(){var t=cur('pt','Mi partido');if(PTO.indexOf(t)<0){t='Mi partido';S.sub.pt=t}
 var season=t==='Posiciones'||t==='Power'||t==='Precisión';if(season)WK.sel=null;
 var body=t==='Precisión'?T.prec():_m(),wk='';
 body=String(body).replace(/<div class="seg wkb">[\s\S]*?<\/div>/,function(x){wk=x;return ''});body=stripTabs(body);
 if(!wk&&!season)wk=wkBar();
 return tabs('pt',PTO)+(season?'':wk)+body}})();

// ---------- INICIO tipo dashboard ----------
function mvCard(o){return '<button class="mv" onclick="'+o.a+'"><div class="mvl k-'+o.k+'">'+esc(o.lab)+'</div><div class="mvb">'+(o.av||'<div class="ic2">'+svg(o.ic||'star')+'</div>')+'<div class="b"><div class="n">'+esc(o.t)+'</div><div class="s">'+esc(o.s)+'</div></div><div class="r"><b>'+o.m+'</b><small>'+esc(o.ml)+'</small></div></div><div class="mvf">'+esc(o.f||'Ver detalle')+svg('chev',2.2)+'</div></button>'}
V.home=function(){var lc=lnChanges(),pg=R.prob_ganar,gain=lc&&lc.pairs.length?Math.max(lc.g,0.01):0,p0=lc&&lc.pairs[0];
 var h='<div class="greet">'+greet()+'</div><div class="week">Semana '+esc(R.semana)+'</div>';
 h+=card('','<div class="vs"><div class="side">'+shield('#C8F36A')+'<div class="nm">'+esc(R.equipo)+'</div><div class="pts">'+n(R.proy_yo_sleeper)+'</div><div class="lbl">Proy. · '+esc(R.record_yo)+'</div></div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(R.rival)+'</div><div class="pts">'+n(R.proy_rival_sleeper)+'</div><div class="lbl">Proy. · '+esc(R.record_rival)+'</div></div></div>'+
  '<div class="prob"><i style="width:'+Math.round((+pg||0)*100)+'%"></i></div><div class="sm mu" style="margin-top:6px;display:flex;justify-content:space-between"><span>Prob. de ganar <b class="l">'+p(pg)+'</b></span><span>Playoffs '+p(R.playoffs_hoy)+'</span></div>'+
  (gain?'<div class="pill wa" onclick="qGo(\'team\',\'tm\',\'Alineación\')"><span>'+(p0&&p0.inn&&p0.out?'Entra '+esc(p0.inn.Jugador)+' por '+esc(p0.out.Jugador):'Cambia tu alineación')+(lc.pairs.length>1?' y '+(lc.pairs.length-1)+' más':'')+' · +'+n(lc.g)+'</span><span>›</span></div>':'<div class="pill ok" onclick="qGo(\'team\',\'tm\',\'Alineación\')"><span>Alineación lista</span><span>›</span></div>')+
  '<button class="hlk" onclick="qGo(\'matchup\',\'pt\',\'Mi partido\')">Ver el partido completo '+svg('chev',2.4)+'</button>');
 // movidas sugeridas
 var mv=[],al=typeof alList==='function'?alList():[];
 if(al.length)mv.push({k:'rd',lab:'Alertas',ic:'warn',t:al.length===1?al[0].nm:al.length+' jugadores para revisar',s:al.length===1?al[0].t:'Lesiones, dudas o byes en tu equipo',m:String(al.length),ml:'alertas',a:"openMore('alerts')",f:'Revisar'});
 if(gain)mv.push({k:'wa',lab:'Alineación',av:p0.inn?av(p0.inn.Jugador,p0.inn.NFL,p0.inn.Pos):'',ic:'players',t:p0.inn?'Entra '+p0.inn.Jugador:'Saca a '+p0.out.Jugador,s:p0.out&&p0.inn?'Sale '+p0.out.Jugador+(lc.pairs.length>1?' · y '+(lc.pairs.length-1)+' cambio(s) más':''):'',m:'+'+n(lc.g),ml:'pts',a:"qGo('team','tm','Alineación')",f:'Ver cambios'});
 if(lc&&lc.warn.length)mv.push({k:'rd',lab:'Bye',ic:'warn',t:'Titular sin jugar',s:lc.warn[0],m:String(lc.warn.length),ml:'aviso',a:"qGo('team','tm','Alineación')",f:'Ver detalle'});
 var w0=rows('App_Waivers')[0];if(w0&&w0.Tomar)mv.push({k:'ok',lab:'Waiver #1',av:av(w0.Tomar,'',w0.Pos),t:w0.Tomar,s:(w0.Pos?w0.Pos+' · ':'')+'Suelta a '+w0.Soltar,m:'$'+n(w0.Oferta,0),ml:'Oferta',a:"qGo('market','mk','Waivers')"});
 var sb=rows('App_Streaming').filter(function(r){return typeof r.Mejora==='number'&&r.Mejora>0.5}).sort(function(a,b){return b.Mejora-a.Mejora})[0];
 if(sb)mv.push({k:'in',lab:'Streaming '+sb.Pos,av:av(sb.Jugador,sb.NFL,sb.Pos),t:sb.Jugador,s:'vs '+sb.Rival+' · mejor que el tuyo',m:sg(sb.Mejora),ml:'pts',a:"S.sub.st='"+esc(sb.Pos)+"';qGo('market','mk','Streaming')"});
 var tr=rows('App_Trades')[0];if(tr&&tr.Contraparte)mv.push({k:'in',lab:'Trade sugerido',ic:'trades',t:'Con '+tr.Contraparte,s:'Recibes '+tr.Recibo,m:sg(tr['Mi cambio ROS']),ml:'pts ROS',a:"S.sub.tr='Sugeridos';qGo('market','mk','Trades')"});
 if(mv.length)h+='<div class="sech"><b>Movidas sugeridas</b><span>'+(mv.length>1?'Desliza →':'')+'</span></div><div class="car">'+mv.map(mvCard).join('')+'</div>';
 // accesos rápidos
 h+='<div class="sech"><b>Accesos rápidos</b></div><div class="qk">'+[['players','Alineación',"qGo('team','tm','Alineación')"],['waivers','Waivers',"qGo('market','mk','Waivers')"],['stream','Streaming',"qGo('market','mk','Streaming')"],['trades','Trades',"qGo('market','mk','Trades')"],['star','Tabla',"qGo('players','pl','Tabla')"],['compare','Comparar',"qGo('players','pl','Comparar')"],['chart','Posiciones',"qGo('matchup','pt','Posiciones')"],['news','Novedades',"qGo('team','tm','Novedades')"]].map(function(x){return '<button onclick="'+x[2]+'"><i>'+svg(x[0])+'</i>'+x[1]+'</button>'}).join('')+'</div>';
 // alineación y notas
 h+='<div class="sech"><b>Tu alineación</b><span>Toca un jugador para ver su ficha</span></div>'+card('',rows('App_Alineacion').map(function(r){return prow({Jugador:r.Jugador,Pos:r.Slot==='FLEX'?'FLEX':r.Slot,Proy:r.Proy,Rival:r.Rival},{sub:function(x){return 'vs '+x.Rival},right:function(x){return fmtP(x,'Proy')}})}).join('')||'<div class="empty">Sin datos.</div>');
 var msgs=[['Alineación','msg_alineacion'],['Bajas y byes','msg_bajas'],['QB','msg_qb'],['TE','msg_te'],['DST','msg_dst'],['K','msg_k'],['Waivers','msg_waivers'],['Enfoque','msg_prioridad']].map(function(x){return R[x[1]]?'<div class="msg"><b>'+x[0]+':</b> '+esc(R[x[1]])+'</div>':''}).join('');
 if(msgs)h+=card('Notas del modelo',msgs);
 return h};

// ---------- FICHA DE JUGADOR en ventana: se cierra con la X, tocando afuera o deslizando hacia abajo ----------
(function(){var sh=$('sheet'),bg=document.createElement('div');bg.id='shbg';bg.onclick=function(){closeP()};document.body.appendChild(bg);
 new MutationObserver(function(){bg.classList.toggle('on',sh.classList.contains('open'))}).observe(sh,{attributes:true,attributeFilter:['class']});
 var y0=null;sh.addEventListener('touchstart',function(e){y0=sh.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
 sh.addEventListener('touchmove',function(e){if(y0==null)return;var d=e.touches[0].clientY-y0;if(d>0){sh.style.transition='none';sh.style.transform='translateY('+d+'px)'}},{passive:true});
 sh.addEventListener('touchend',function(e){if(y0==null)return;var d=e.changedTouches[0].clientY-y0;y0=null;sh.style.transition='';sh.style.transform='';if(d>110)closeP()},{passive:true});
 var _op=openP;openP=function(name){_op(name);var b=sh.querySelector('header .ib');if(b){b.className='mx';b.setAttribute('aria-label','Cerrar');b.innerHTML=svg('x',2.2)}
  var r=rows('App_ProySem').filter(function(x){return x.Jugador===name})[0],m=sh.querySelector('main');
  if(r&&m&&m.children.length>1){var ws=[];for(var w=wkBase();w<=17;w++)if(typeof r['S'+w]==='number')ws.push(w);
   if(ws.length>1){var mx=Math.max.apply(null,ws.map(function(w){return r['S'+w]}))||1;
    m.children[1].insertAdjacentHTML('afterend',card('Proyección por semana','<div class="bars" style="height:120px">'+ws.map(function(w){var v=r['S'+w];return '<div class="bc"><div class="bv">'+(v>0?n(v,0):'')+'</div><div class="bb" style="height:'+Math.round(v/mx*80)+'px"></div><div class="bl">S'+w+'</div></div>'}).join('')+'</div><div class="note">Puntos esperados por semana según el modelo (0 = bye o lesión).</div>'))}}}})();

// ---------- PARTIDO: banca en una sola lista ordenada por proyección (sin huecos por posición) ----------
function benchFix(bn){return (bn||[]).slice().sort(function(a,b){var k=function(x){return x.proy!=null?x.proy:(+x.pts||0)};return k(b)-k(a)}).map(function(x){return x.empty?x:{nm:x.nm,nfl:x.nfl,pts:x.pts,proy:x.proy,rp:x.pos,pos:'BN'}})}
(function(){var _s=pmSide;pmSide=function(m,ix,pr){var r=_s(m,ix,pr);r.bn=benchFix(r.bn);return r};
 var _f=pfSide;pfSide=function(m,ix,pr){var r=_f(m,ix,pr);r.bn=benchFix(r.bn);return r};
 var _c=pmCell;pmCell=function(x,side,win){var h=_c(x,side,win);return x&&x.rp?h.replace('<div class="s">','<div class="s">'+esc(x.rp)+' · '):h}})();

// ======================= v4 =======================
// ---- arreglos: fondo al estirar la pantalla arriba (negro) y verde de marca en la pantalla de inicio ----
(function(){var st=document.createElement('style');st.textContent=[
 'html{background:linear-gradient(180deg,#0B0F17 0,#0B0F17 50%,#F2F4F8 50%,#F2F4F8 100%)!important}body{background:var(--ob)!important;min-height:100vh}',
 '.tabs{top:calc(var(--hh,54px) - 1px)!important}',
 '#splash .tag span,#splash .wm i{color:var(--br)!important}#splash .load i{background:var(--br)!important}',
 // tabla tipo Draft Sharks
 '.dtw{overflow-x:auto;margin:0 -14px;padding:0 0 6px;-webkit-overflow-scrolling:touch}',
 '.dt{border-collapse:separate;border-spacing:0;font-size:12px;min-width:100%;background:#fff}',
 '.dt th,.dt td{padding:7px 6px;text-align:center;white-space:nowrap;border-bottom:1px solid #EEF1F5}',
 '.dt thead th{position:sticky;top:0;background:#fff;font-size:10px;color:var(--mu);font-weight:700;z-index:2}',
 '.dt thead tr.g th{font-size:10.5px;color:var(--tx);border-bottom:0;padding-bottom:0}',
 '.dt th.s{cursor:pointer}.dt th.on{color:var(--tx)}.dt th.on::after{content:" ▾"}',
 '.dt td.p,.dt th.p{position:sticky;left:0;background:#fff;text-align:left;z-index:1;box-shadow:1px 0 0 #EEF1F5;min-width:150px;max-width:170px}',
 '.dt thead th.p{z-index:3}',
 '.dt td.p .w{display:flex;align-items:center;gap:7px}.dt td.p .av{width:28px;height:28px;font-size:9px}.dt td.p .nm{font-weight:700;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;max-width:105px}.dt td.p .sb{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--mu)}.dt td.p .pos{width:auto;height:16px;padding:0 5px;font-size:9px;border-radius:5px}',
 '.dt tr.me td.p{box-shadow:inset 3px 0 0 var(--li),1px 0 0 #EEF1F5}',
 '.dt td.m{font-size:10.5px;font-weight:600;border-radius:0}.dt td.m.e{background:#E3F5EA;color:#0E7A47}.dt td.m.h{background:#FDECEC;color:#B42318}.dt td.m.n{background:#F2F4F7;color:#4A5568}.dt td.m.b{background:#fff;color:#98A2B3}',
 '.dt td.v{background:#EEF4FF;font-weight:800;font-size:13px;color:#101828}.dt th.v{background:#0B0F17!important;color:#fff!important;border-radius:8px 8px 0 0}',
 '.dt td.k{font-weight:600}.dt td.po{font-size:11px}',
 '.dt tbody tr:active td{background:#F7F8FA}',
 '.dtn{font-size:11px;color:var(--mu);margin:8px 2px 0;line-height:1.45}.dtn b{color:var(--tx)}',
 // tabla de valores por tiers
 '.tierh{background:var(--ink);color:#fff;font-family:"Barlow Condensed",Inter,sans-serif;font-style:italic;font-weight:800;letter-spacing:.5px;font-size:14px;padding:6px 12px;border-radius:8px;margin:12px 0 6px}',
 '.vrow{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #E6EAF0;border-radius:12px;padding:9px 10px;margin-bottom:6px;width:100%;text-align:left;color:var(--tx)}.vrow.me{border-color:#BFE6D0;background:#F4FBF7}',
 '.vrow .rk{width:22px;text-align:right;color:var(--mu);font-size:11px;font-weight:700}.vrow .b{flex:1;min-width:0}.vrow .n{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vrow .s{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--mu)}.vrow .s .pos{width:auto;height:17px;padding:0 6px;font-size:9.5px}',
 '.vbx{min-width:58px;text-align:center;background:#0B0F17;color:#fff;border-radius:10px;padding:5px 6px}.vbx b{display:block;font-size:16px}.vbx small{font-size:8.5px;opacity:.7;letter-spacing:.5px;text-transform:uppercase}',
 // calculadora de trades
 '.vc{display:grid;grid-template-columns:1fr 1fr;gap:10px}.vc>div{background:#F7F8FA;border:1px solid #E6EAF0;border-radius:12px;padding:10px;text-align:center}.vc small{display:block;font-size:10px;color:var(--mu);text-transform:uppercase;letter-spacing:.6px}.vc b{display:block;font-size:24px;margin-top:2px}.vc i{font-style:normal;font-size:10.5px;color:var(--mu)}',
 '.vbar{display:flex;height:8px;border-radius:4px;overflow:hidden;margin:12px 0 4px;background:#E3E7EE}.vbar i{display:block;height:100%}.vbar i.a{background:#0E9F5A}.vbar i.b{background:#D92D20}',
 '.vv{display:inline-block;background:#EEF4FF;color:#24408E;border-radius:6px;padding:0 5px;font-weight:800;font-size:10.5px;margin-right:2px}',
 '.vsg{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.vsg button{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--ln);border-radius:18px;padding:5px 10px 5px 6px;font-size:12px;font-weight:600;color:var(--tx)}.vsg button b{color:#24408E}',
 '.vof{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #EEF1F5}.vof:first-of-type{border-top:0}.vof .b{flex:1;min-width:0}.vof .n{font-weight:700;font-size:13px}.vof .s{font-size:11px;color:var(--mu)}.vof button{background:var(--ink);color:#fff;border:0;border-radius:14px;padding:6px 12px;font-size:12px;font-weight:700}',
 '.stat3.s4{grid-template-columns:repeat(4,1fr)}.stat3 .vd{background:#0B0F17!important;color:#fff;border-color:#0B0F17!important}.stat3 .vd span{color:rgba(255,255,255,.7)!important}'
 ].join('');document.head.appendChild(st)})();

// ---------- datos de valor (hoja App_Valor del Excel) ----------
var VL={d:null,m:{},list:[]};
function vlMap(){if(VL.d!==D){VL.d=D;VL.m={};VL.list=rows('App_Valor');VL.list.forEach(function(r){VL.m[r.Jugador]=r})}return VL.m}
function vlOf(nm){var r=vlMap()[nm];return r&&typeof r.Valor==='number'?r.Valor:0}
function vlOwn(r){var o=typeof SL!=='undefined'&&SL.own&&SL.lid===R.liga_id?(SL.own[r.Jugador]||'Libre'):r['Dueño'];return o||'Libre'}
function vlDesc(){var v=+R.valor_desc;return isNaN(v)||R.valor_desc===''?0.2:v}
function vlMarg(){var v=+R.valor_margen;return isNaN(v)||R.valor_margen===''?0.1:v}
function vlPkg(names){var v=names.map(vlOf).sort(function(a,b){return b-a}),d=vlDesc();return v.reduce(function(s,x,i){return s+x*Math.max(0,1-d*i)},0)}
function vf(v){return typeof v==='number'?(Math.round(v*10)/10).toFixed(1):'—'}

// ---------- JUGADORES › Tabla (todo de un vistazo: semana, próximas 2, resto de temporada y valor) ----------
function dtCls(f,dif){if(dif)return dif==='Fácil'?'e':dif==='Difícil'?'h':'n';if(f===''||f==null)return 'b';if(+f===0)return 'b';return f>=1.05?'e':f<=0.95?'h':'n'}
function dtView(){var w=+R.semana||1,pos=cur('dtp','Todos'),own=cur('dto','Todos'),sk=cur('dts','v');
 var sem={},ros={},ps={};rows('App_RankSemana').forEach(function(r){sem[r.Jugador]=r});rows('App_RankROS').forEach(function(r){ros[r.Jugador]=r});rows('App_ProySem').forEach(function(r){ps[r.Jugador]=r});
 var okPos=function(q){q=q==='DEF'?'DST':q;return pos==='Todos'||(pos==='FLEX'?['RB','WR','TE'].indexOf(q)>=0:q===(pos==='DEF'?'DST':pos))};
 var L=(vlMap(),VL.list).map(function(r){var s=sem[r.Jugador]||{},o=ros[r.Jugador]||{},y=ps[r.Jugador]||{},d=vlOwn(r);
  return {r:r,nm:r.Jugador,pos:r.Pos,nfl:r.NFL,own:d,p0:s.Proy,rv0:s.Rival,dif0:s.Dificultad,p1:y['S'+(w+1)],rv1:r['Rival S+1'],f1:r['Factor S+1'],p2:y['S'+(w+2)],rv2:r['Rival S+2'],f2:r['Factor S+2'],ros:o.ROS!=null?o.ROS:r['Pts ROS'],rps:o['ROS por semana'],po:o.Playoffs,cpo:r['Cal playoffs'],v:r.Valor,rk:r['Rank pos valor']}})
 .filter(function(x){if(!okPos(x.pos))return false;if(own==='Mi equipo'&&x.own!==R.equipo)return false;if(own==='Libres'&&x.own!=='Libre')return false;if(own==='Rivales'&&(x.own===R.equipo||x.own==='Libre'))return false;return true});
 L.sort(function(a,b){return (+b[sk]||0)-(+a[sk]||0)});L=L.slice(0,150);window._dt=L.map(function(x){return x.nm});
 var th=function(k,t,c){return '<th class="s'+(sk===k?' on':'')+(c?' '+c:'')+'" onclick="setSub(\'dts\',\''+k+'\')">'+t+'</th>'};
 var mc=function(rv,f,dif){if(!rv)return '<td class="m b">—</td>';return '<td class="m '+(String(rv).toUpperCase()==='BYE'?'b':dtCls(f,dif))+'">'+esc(rv)+'</td>'};
 var star=function(v){if(typeof v!=='number')return '—';var c=v>=4?'#0E9F5A':v<=2?'#D92D20':'#667085';return '<span style="color:'+c+';font-weight:700">'+v+'★</span>'};
 var h='<div class="dtw"><table class="dt"><thead><tr class="g"><th class="p"></th><th colspan="2">Sem '+w+'</th><th colspan="2">Sem '+(w+1)+'</th><th colspan="2">Sem '+(w+2)+'</th><th colspan="3">Resto de temporada</th><th></th></tr>'+
  '<tr><th class="p">Jugador</th>'+th('p0','Proy')+'<th>Rival</th>'+th('p1','Proy')+'<th>Rival</th>'+th('p2','Proy')+'<th>Rival</th>'+th('ros','Pts ROS')+th('po','Playoffs')+'<th>Cal. PO</th>'+th('v','Valor','v')+'</tr></thead><tbody>'+
  L.map(function(x,i){return '<tr class="'+(x.own===R.equipo?'me':'')+'" onclick="openP(window._dt['+i+'])"><td class="p"><div class="w">'+av(x.nm,x.nfl,x.pos)+'<div style="min-width:0"><div class="nm">'+esc(x.nm)+'</div><div class="sb">'+pb(x.pos).replace('class="pos','class="pos')+esc(x.nfl)+' · '+esc(x.own===R.equipo?'Mío':x.own==='Libre'?'Libre':x.own)+'</div></div></div></td>'+
   '<td class="k">'+(typeof x.p0==='number'?n(x.p0):'—')+'</td>'+mc(x.rv0,null,x.dif0)+'<td class="k">'+(typeof x.p1==='number'?n(x.p1):'—')+'</td>'+mc(x.rv1,x.f1)+'<td class="k">'+(typeof x.p2==='number'?n(x.p2):'—')+'</td>'+mc(x.rv2,x.f2)+
   '<td class="k">'+(typeof x.ros==='number'?n(x.ros,0):'—')+'</td><td class="po">'+(typeof x.po==='number'?n(x.po,0):'—')+'</td><td>'+star(x.cpo)+'</td><td class="v">'+vf(x.v)+'</td></tr>'}).join('')+'</tbody></table></div>';
 h+='<div class="dtn"><b>Rival:</b> verde = fácil, rojo = difícil (para su posición). <b>Playoffs</b> = pts proyectados en semanas 15-17, ya incluidos en Pts ROS con el mismo peso; <b>Cal. PO</b> = calendario de playoffs (5★ fácil, 1★ difícil). <b>Valor</b> = pts ROS sobre el nivel de reemplazo (mejores libres de su posición), escala 0-100. Toca un encabezado para ordenar y un jugador para ver su ficha.</div>';
 return seg('dtp',['Todos','QB','RB','WR','TE','FLEX','K','DEF'])+seg('dto',['Todos','Mi equipo','Libres','Rivales'])+(L.length?card('',h):card('','<div class="empty">'+(VL.list.length?'Sin jugadores con este filtro.':'Falta la hoja App_Valor: corre ActualizarTodo en el Excel y guarda.')+'</div>'))}

// ---------- JUGADORES › Valores (tabla de valores de trade por tiers) ----------
function vtView(){var pos=cur('vtp','Todos');var L=(vlMap(),VL.list).filter(function(r){var q=r.Pos==='DEF'?'DST':r.Pos;return (pos==='Todos'||q===(pos==='DEF'?'DST':pos))&&typeof r.Valor==='number'&&r.Valor>0}).slice(0,pos==='Todos'?120:60);
 window._vt=L.map(function(r){return r.Jugador});var tier=0,h='';
 L.forEach(function(r,i){if(r.Tier!==tier){tier=r.Tier;h+='<div class="tierh">Tier '+esc(tier)+'</div>'}var o=vlOwn(r),me=o===R.equipo;
  h+='<button class="vrow'+(me?' me':'')+'" onclick="openP(window._vt['+i+'])"><span class="rk">'+(i+1)+'</span>'+av(r.Jugador,r.NFL,r.Pos)+'<div class="b"><div class="n">'+esc(r.Jugador)+'</div><div class="s">'+pb(r.Pos)+esc(r.NFL)+' · #'+esc(r['Rank pos valor'])+' '+esc(r.Pos)+' · '+esc(me?'Mío':o)+'</div></div><div class="vbx"><b>'+vf(r.Valor)+'</b><small>Valor</small></div></button>'});
 return seg('vtp',['Todos','QB','RB','WR','TE','K','DEF'])+(h||card('','<div class="empty">'+(VL.list.length?'Sin jugadores.':'Falta la hoja App_Valor: corre ActualizarTodo en el Excel y guarda.')+'</div>'))+'<div class="dtn">Valor = puntos ROS por encima de lo que conseguirías gratis en waivers en su posición (0-100; el mejor = 100). Úsalo para armar trades parejos en Mercado › Trades › Analizar.</div>'}

V.players=function(){var t=cur('pl','Tabla');if(['Tabla','Valores','Comparar'].indexOf(t)<0){t='Tabla';S.sub.pl=t}var h=tabs('pl',['Tabla','Valores','Comparar']);
 if(t==='Tabla')return h+dtView();if(t==='Valores')return h+vtView();var sv=S.sub.pl;return h+stripTabs(_VP())};

// ---------- MERCADO › Trades: valor en cada lado, veredicto y cómo equilibrarlo ----------
function taAddN(side,nm){var ta=taInit();var a=ta[side];if(a.indexOf(nm)<0&&a.length<5)a.push(nm);render()}
function taSetGive(i){var o=window._vof&&window._vof[i];if(!o)return;taInit().give=o.slice();render()}
function vlOffers(ta,mine,slots){var get=ta.get;if(!get.length)return [];var tv=vlPkg(get),m=vlMarg(),out=[];
 var pool=mine.filter(function(r){return vlOf(r.Jugador)>0}).map(function(r){return r.Jugador});
 var base=lineup(mine,slots,'ROS').t,theirs=rows('App_RankROS').filter(function(r){return r['Dueño']===ta.team}),tb=lineup(theirs,slots,'ROS').t;
 var by=function(names){return rows('App_RankROS').filter(function(r){return names.indexOf(r.Jugador)>=0})};
 var test=function(g){var gv=vlPkg(g);if(Math.abs(gv-tv)>m*Math.max(gv,tv))return;
  var mA=mine.filter(function(r){return g.indexOf(r.Jugador)<0}).concat(by(get)),tA=theirs.filter(function(r){return get.indexOf(r.Jugador)<0}).concat(by(g));
  out.push({g:g,gv:gv,d1:lineup(mA,slots,'ROS').t-base,d2:lineup(tA,slots,'ROS').t-tb})};
 pool.forEach(function(a,i){test([a]);for(var j=i+1;j<pool.length;j++)test([a,pool[j]])});
 return out.sort(function(a,b){return (b.d1+Math.min(0,b.d2)*0.3)-(a.d1+Math.min(0,a.d2)*0.3)}).slice(0,4)}
(function(){var _tv=taView;taView=function(){var h=_tv(),ta=taInit();vlMap();
 // valor junto a cada jugador de las listas
 rows('App_RankROS').forEach(function(r){if(r['Dueño']!==R.equipo&&r['Dueño']!==ta.team)return;var v=vlOf(r.Jugador);var key='<div class="n">'+esc(r.Jugador)+'</div><div class="s">';if(h.indexOf(key)>=0)h=h.split(key).join(key+'<b class="vv">'+vf(v)+'</b> ')});
 if(!ta.team)return h;
 var gv=vlPkg(ta.give),rv=vlPkg(ta.get),m=vlMarg(),mx=Math.max(gv,rv),diff=rv-gv,fair=mx>0&&Math.abs(diff)<=m*mx;
 var slots=String(R.slots||'QB,RB,RB,WR,WR,WR,TE,FLEX,K,DST').split(','),all=rows('App_RankROS');
 var mine=all.filter(function(r){return r['Dueño']===R.equipo}),theirs=all.filter(function(r){return r['Dueño']===ta.team});
 var verd=!ta.give.length&&!ta.get.length?['n','Elige jugadores de ambos lados para comparar su valor.']:fair?['ok','Trade justo: valores parejos, es probable que lo acepten.']:diff>0?['wa','Te llevas más valor (+'+vf(diff)+'). Es probable que lo rechacen: agrega algo de tu lado.']:['rd','Pagas de más ('+vf(diff)+'). Pide algo más o quita a alguien de tu lado.'];
 var c='<div class="vc"><div><small>Doy</small><b>'+vf(gv)+'</b><i>'+ta.give.length+' jugador(es)</i></div><div><small>Recibo</small><b>'+vf(rv)+'</b><i>'+ta.get.length+' jugador(es)</i></div></div>';
 if(mx>0)c+='<div class="vbar"><i class="a" style="width:'+Math.round(rv/(gv+rv)*100)+'%"></i><i class="b" style="width:'+Math.round(gv/(gv+rv)*100)+'%"></i></div>';
 c+='<div class="pill '+(verd[0]==='ok'?'ok':'wa')+'" style="margin-top:10px;'+(verd[0]==='rd'?'background:#FDECEC;color:#B42318;border-color:#F5C2C2':verd[0]==='n'?'background:#F2F4F7;color:#4A5568;border-color:#E3E7EE':'')+'"><span>'+verd[1]+'</span></div>';
 if(!fair&&mx>0){var need=Math.abs(diff),side=diff>0?'give':'get',src=diff>0?mine:theirs,used=ta[side];
  var cand=src.filter(function(r){return used.indexOf(r.Jugador)<0&&vlOf(r.Jugador)>0}).map(function(r){return {nm:r.Jugador,pos:r.Pos,v:vlOf(r.Jugador)}}).sort(function(a,b){return Math.abs(a.v-need/Math.max(0.2,1-vlDesc()*used.length))-Math.abs(b.v-need/Math.max(0.2,1-vlDesc()*used.length))}).slice(0,4);
  if(cand.length)c+='<div class="note" style="margin-top:10px"><b style="color:var(--tx)">Para equilibrar, '+(diff>0?'agrega de tu equipo':'pide además')+':</b></div><div class="vsg">'+cand.map(function(x){return '<button onclick="taAddN(\''+side+'\',\''+esc(x.nm).replace(/'/g,"\\'")+'\')">'+pb(x.pos)+esc(x.nm)+' <b>'+vf(x.v)+'</b></button>'}).join('')+'</div>'}
 c+='<div class="note" style="margin-top:10px">El mejor jugador de cada lado cuenta 100% y cada jugador extra '+Math.round((1-vlDesc())*100)+'%, '+Math.round((1-2*vlDesc())*100)+'%… (dos piezas medianas valen menos que una estrella). Justo = diferencia menor a '+Math.round(m*100)+'%.</div>';
 var card1=card('Valor del trade',c);
 // ofertas justas automáticas por lo que pides
 if(ta.get.length){var of=vlOffers(ta,mine,slots);window._vof=of.map(function(o){return o.g});
  card1+=card('Ofertas justas por '+esc(ta.get.join(' + ')),of.length?of.map(function(o,i){return '<div class="vof"><div class="b"><div class="n">Doy '+esc(o.g.join(' + '))+'</div><div class="s">Valor '+vf(o.gv)+' vs '+vf(rv)+' · tu alineación ROS '+(o.d1>=0?'+':'')+n(o.d1,0)+' · la de ellos '+(o.d2>=0?'+':'')+n(o.d2,0)+'</div></div><button onclick="taSetGive('+i+')">Usar</button></div>'}).join(''):'<div class="empty">No encontré combinaciones de 1 o 2 jugadores tuyos con valor parecido.</div>','<span>Ordenadas por lo que mejora tu alineación</span>')}
 var k=h.indexOf('</div><div class="card">');if(k<0)return h+card1;return h.slice(0,k+6)+card1+h.slice(k+6)}})();
// trades sugeridos: valor de cada lado y si es parejo
(function(){var _tr=T.trades;T.trades=function(){var s=cur('tr','Sugeridos');var h=_tr();if(s!=='Sugeridos')return h;var sg2=window._sugs||[];vlMap();
 sg2.forEach(function(r,i){var g=vlPkg(String(r.Doy).split(' + ')),v=vlPkg(String(r.Recibo).split(' + ')),mx=Math.max(g,v),ok=mx>0&&Math.abs(v-g)<=vlMarg()*mx;
  var chip='<span class="chip" style="background:'+(ok?'#E7F6EE':'#FFF4E0')+'">Valor <b>'+vf(g)+' → '+vf(v)+'</b> · '+(ok?'parejo':v>g?'difícil que acepten':'pagas de más')+'</span>';
  h=h.replace('onclick="taPre('+i+')"','onclick="taPre('+i+')" data-v="1"').replace(new RegExp('(taPre\\('+i+'\\)" data-v="1">[\\s\\S]*?<div class="chips">)'),'$1'+chip)});
 return h}})();

// ficha del jugador: valor de trade
(function(){var _op=openP;openP=function(name){_op(name);var s3=$('sheet').querySelector('.stat3');var v=vlMap()[name];if(s3&&v){s3.classList.add('s4');s3.insertAdjacentHTML('beforeend','<div class="vd"><span>Valor</span><b>'+vf(v.Valor)+'</b></div>')}}})();

if(S.tab==='tools'){S.tab='market'}
render();
// ======================= v5 (pegar al final de tema.js) =======================
(function(){var st=document.createElement('style');st.textContent=[
 // pantalla de inicio: sin el logo difuminado, solo la marca en texto
 '#splash>img{display:none!important}#wmSplash{display:flex!important}',
 // NFL en vivo
 '.nfh{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--mu);margin:0 2px 10px}.nfh button{background:#fff;border:1px solid var(--ln);border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;color:var(--tx)}',
 '.ng{background:#fff;border:1px solid #E6EAF0;border-radius:14px;padding:10px 12px;margin-bottom:10px}.ng.in{border-color:#F5C2C2}',
 '.ngt{display:flex;justify-content:space-between;font-size:11px;color:var(--mu);margin-bottom:4px}.ngt .st{font-weight:800;color:var(--tx)}.ngt .st.in{color:#D92D20}.ngt .st.in::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#D92D20;margin-right:5px;vertical-align:1px}',
 '.ngr{display:flex;align-items:center;gap:10px;padding:4px 0}.ngr img{width:28px;height:28px;object-fit:contain}.ngr .tn{flex:1;font-weight:700;font-size:14px}.ngr .tn small{font-weight:500;color:var(--mu);font-size:11px;margin-left:6px}.ngr .sc{font-size:20px;font-weight:800;min-width:34px;text-align:right}.ngr.lo .sc,.ngr.lo .tn{color:#98A2B3}.ngr .pz{width:8px;height:8px;border-radius:50%;background:var(--li);flex:none}',
 '.ngs{font-size:11px;color:var(--mu);margin-top:2px}.ngs.rz{color:#D92D20;font-weight:700}',
 '.ngp{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid #EEF1F5}.ngp span{font-size:11px;font-weight:600;border-radius:8px;padding:2px 7px;background:#E7F6EE;color:#0E7A47}.ngp span.rv{background:#FDECEC;color:#B42318}.ngp span b{margin-left:3px}',
 // barra del trade en Valores
 '.tvb{display:flex;align-items:center;gap:10px;background:var(--ink);color:#fff;border-radius:14px;padding:10px 12px;margin-bottom:12px}.tvb .b{flex:1;min-width:0;font-size:12px;line-height:1.35}.tvb .b b{color:var(--br)}.tvb button{background:var(--br);color:var(--ink);border:0;border-radius:12px;padding:7px 12px;font-size:12px;font-weight:800}',
 '.vrow .add{font-size:18px;font-weight:800;color:var(--li);width:20px;text-align:center}'
 ].join('');document.head.appendChild(st)})();

// ---------- VALOR calculado en la app (funciona aunque la hoja App_Valor no llegue, y en ambas ligas) ----------
vlMap=function(){var stt=typeof SL!=='undefined'?SL.t:0;if(VL.d===D&&VL.st===stt&&VL.list.length)return VL.m;VL.d=D;VL.st=stt;VL.m={};
 var ex={};rows('App_Valor').forEach(function(r){ex[r.Jugador]=r});
 var ros=rows('App_RankROS').filter(function(r){return r.Jugador&&typeof r.ROS==='number'}),N=+R.valor_libres||3,pq=function(q){return q==='DEF'?'DST':q};
 var rep={};['QB','RB','WR','TE','K','DST'].forEach(function(q){var f=ros.filter(function(r){return pq(r.Pos)===q&&vlOwn(r)==='Libre'}).map(function(r){return r.ROS}).sort(function(a,b){return b-a}).slice(0,N);rep[q]=f.length?f.reduce(function(s,x){return s+x},0)/f.length:0});
 var L=ros.map(function(r){var q=pq(r.Pos),v=Math.max(0,r.ROS-(rep[q]||0)),e=ex[r.Jugador]||{};return {Jugador:r.Jugador,Pos:r.Pos,NFL:r.NFL,'Dueño':vlOwn(r),vor:v,'Pts ROS':r.ROS,Reemplazo:rep[q]||0,'Cal ROS':r['Cal ROS'],'Cal playoffs':r['Cal playoffs'],'Rival S+1':e['Rival S+1'],'Factor S+1':e['Factor S+1'],'Rival S+2':e['Rival S+2'],'Factor S+2':e['Factor S+2']}});
 var mx=Math.max.apply(null,L.map(function(x){return x.vor}).concat([0]));
 L.forEach(function(x){x.Valor=mx>0?Math.round(1000*x.vor/mx)/10:0;x.Tier=x.Valor>=80?1:x.Valor>=60?2:x.Valor>=40?3:x.Valor>=20?4:5});
 L.sort(function(a,b){return b.Valor-a.Valor||b['Pts ROS']-a['Pts ROS']});var rk={};L.forEach(function(x){var q=pq(x.Pos);rk[q]=(rk[q]||0)+1;x['Rank pos valor']=rk[q];VL.m[x.Jugador]=x});
 VL.list=L;return VL.m};
vlOf=function(nm){var r=vlMap()[nm];return r&&typeof r.Valor==='number'?r.Valor:0};

// valor junto al nombre en todas las listas de jugadores
(function(){var _p=prow;prow=function(r,o){var h=_p(r,o),nm=r&&(r.Jugador||r.Tomar),v=nm?vlOf(nm):0;return v>0?h.replace('<div class="s">','<div class="s"><b class="vv">'+vf(v)+'</b> '):h}})();

// ---------- Tabla de valores: en Jugadores › Valores y en Mercado › Trades › Valores (ahí, tocar = agregar al trade) ----------
function vtOpen(i){openP(window._vt[i])}
function vtPick(i){var nm=window._vt[i],r=vlMap()[nm];if(!r)return;var o=vlOwn(r),ta=taInit();
 if(o===R.equipo){var a=ta.give,k=a.indexOf(nm);if(k>=0)a.splice(k,1);else if(a.length<5)a.push(nm)}
 else if(o==='Libre'){openP(nm);return}
 else{if(ta.team!==o){ta.team=o;ta.get=[]}var b=ta.get,j=b.indexOf(nm);if(j>=0)b.splice(j,1);else if(b.length<5)b.push(nm)}
 var y=scrollY;render();scrollTo(0,y)}
vtView=function(mode){var pos=cur('vtp','Todos'),ta=mode?taInit():null;vlMap();
 var L=VL.list.filter(function(r){var q=r.Pos==='DEF'?'DST':r.Pos;return (pos==='Todos'||q===(pos==='DEF'?'DST':pos))&&r.Valor>0}).slice(0,pos==='Todos'?150:70);
 window._vt=L.map(function(r){return r.Jugador});var tier=0,h='';
 L.forEach(function(r,i){if(r.Tier!==tier){tier=r.Tier;h+='<div class="tierh">Tier '+esc(tier)+'</div>'}var o=vlOwn(r),me=o===R.equipo,on=ta&&(ta.give.indexOf(r.Jugador)>=0||ta.get.indexOf(r.Jugador)>=0);
  h+='<button class="vrow'+(me?' me':'')+'"'+(on?' style="border-color:#0B0F17;border-width:2px"':'')+' onclick="'+(mode?'vtPick':'vtOpen')+'('+i+')">'+(mode?'<span class="add">'+(on?'✓':o==='Libre'?'':'+')+'</span>':'<span class="rk">'+(i+1)+'</span>')+av(r.Jugador,r.NFL,r.Pos)+'<div class="b"><div class="n">'+esc(r.Jugador)+'</div><div class="s">'+pb(r.Pos)+esc(r.NFL)+' · #'+esc(r['Rank pos valor'])+' '+esc(r.Pos)+' · '+esc(me?'Mío':o)+'</div></div><div class="vbx"><b>'+vf(r.Valor)+'</b><small>Valor</small></div></button>'});
 var top='';if(mode){var g=vlPkg(ta.give),v=vlPkg(ta.get);top='<div class="tvb"><div class="b">'+(ta.give.length||ta.get.length?'Doy <b>'+vf(g)+'</b> ('+esc(ta.give.join(', ')||'—')+')<br>Recibo <b>'+vf(v)+'</b> ('+esc(ta.get.join(', ')||'—')+(ta.team?' de '+esc(ta.team):'')+')':'Toca jugadores tuyos para darlos y de otro equipo para pedirlos.')+'</div><button onclick="S.sub.tr=\'Analizar\';render();scrollTo(0,0)">Analizar</button></div>'}
 return top+seg('vtp',['Todos','QB','RB','WR','TE','K','DEF'])+(h||card('','<div class="empty">Sin jugadores con valor.</div>'))+'<div class="dtn">Valor = puntos ROS por encima de lo que conseguirías gratis en waivers en su posición (0-100; el mejor = 100). Se recalcula con los dueños actuales de Sleeper.</div>'};
(function(){var TR5=['Sugeridos','Analizar','Comprar','Vender','Riesgo'],TR6=['Sugeridos','Analizar','Valores','Comprar','Vender','Riesgo'],_t=T.trades;
 T.trades=function(){var s=cur('tr','Sugeridos');if(s==='Valores')return tabs('tr',TR6)+vtView(true);return String(_t()).replace(tabs('tr',TR5),tabs('tr',TR6))}})();

// ---------- PARTIDO › NFL: marcadores de la NFL en tiempo real (ESPN) con tus jugadores y los del rival ----------
var NF={t:0,ev:[],busy:false,err:'',live:false,f:''};
function nfOn(){return S.tab==='matchup'&&cur('pt','Mi partido')==='NFL'}
function nfLoad(force){if(NF.busy)return;if(!force&&NF.t&&Date.now()-NF.t<(NF.live?25000:300000))return;NF.busy=true;
 var wk=(typeof LV!=='undefined'&&LV.wk)||(typeof SL!=='undefined'&&SL.wk)||+R.semana,season=(typeof LV!=='undefined'&&LV.season)||String(new Date().getFullYear());
 jget('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week='+wk+'&dates='+season).then(function(j){
  NF.ev=(j.events||[]).map(function(ev){var c=(ev.competitions||[])[0]||{},s=ev.status||c.status||{},ty=s.type||{},si=c.situation||{};
   var tm=function(ha){var x=(c.competitors||[]).filter(function(y){return y.homeAway===ha})[0]||{},t=x.team||{};return {ab:t.abbreviation||'',t:nfl(t.abbreviation),logo:t.logo||tmLogo(nfl(t.abbreviation)),sc:x.score,rec:((x.records||[])[0]||{}).summary||'',id:t.id,pos:si.possession&&si.possession===t.id}};
   var st=ty.state||'pre',det=String(ty.shortDetail||'').replace('Halftime','Medio tiempo').replace('End of ','Fin del ').replace(/ Quarter/,'');
   return {a:tm('away'),h:tm('home'),st:st,lab:st==='pre'?new Date(ev.date).toLocaleString('es',{weekday:'short',hour:'2-digit',minute:'2-digit'}):st==='post'?(/OT/.test(det)?'Final (TE)':'Final'):det,date:+new Date(ev.date),dd:si.downDistanceText||'',rz:!!si.isRedZone,tv:(((c.broadcasts||[])[0]||{}).names||[])[0]||''}});
  NF.wk=wk;NF.t=Date.now();NF.busy=false;NF.err='';NF.live=NF.ev.some(function(e){return e.st==='in'});if(nfOn()){var y=scrollY;render();scrollTo(0,y)}})
 .catch(function(e){NF.busy=false;NF.err=e.message;NF.t=Date.now();if(nfOn())render()})}
function nfPeople(){var mine={},riv={},pts={},sl=typeof SL!=='undefined'&&SL.lid===R.liga_id;
 var add=function(o,nm,t){t=nfl(t);if(!t||!nm)return;(o[t]=o[t]||[]).push(nm)};
 if(sl&&SL.me&&SL.me.pl)SL.me.pl.forEach(function(p){if(!p.ir)add(mine,p.Jugador,p.NFL)});else rows('App_Roster').forEach(function(r){add(mine,r.Jugador,r.NFL)});
 if(sl&&SL.rv&&SL.rv.pl)SL.rv.pl.forEach(function(p){if(!p.ir)add(riv,p.Jugador,p.NFL)});else rows('App_Rival').forEach(function(r){add(riv,r.Jugador,r.NFL)});
 if(typeof LV!=='undefined'&&LV.m&&LV.lid===R.liga_id&&sl&&SL.I)LV.m.forEach(function(m){var pp=m.players_points||{};for(var id in pp){var x=SL.I[id];if(x)pts[x.nm]=+pp[id]||0}});
 return {mine:mine,riv:riv,pts:pts}}
function nfShort(nm){var a=String(nm).replace(/ (Jr\.|Sr\.|II|III|IV)$/,'').split(' ');return a.length>1?a[0].charAt(0)+'. '+a.slice(1).join(' '):nm}
function nflView(){var h='';
 if(!NF.t){nfLoad(true);return '<div class="sk" style="height:120px"></div><div class="sk" style="height:120px"></div><div class="sk" style="height:120px"></div>'}
 if(NF.err&&!NF.ev.length)return card('NFL','<div class="empty">No se pudo leer ESPN: '+esc(NF.err)+'</div><button class="btn sec" onclick="NF.t=0;render()">Reintentar</button>');
 var pe=nfPeople(),flt=cur('nff','Todos'),ago=Math.round((Date.now()-NF.t)/1000);
 var ord={in:0,pre:1,post:2},E=NF.ev.slice().sort(function(a,b){return (ord[a.st]-ord[b.st])||(a.date-b.date)});
 if(flt==='Con mis jugadores')E=E.filter(function(e){return pe.mine[e.a.t]||pe.mine[e.h.t]||pe.riv[e.a.t]||pe.riv[e.h.t]});
 h+='<div class="nfh"><span>Semana '+esc(NF.wk)+' · '+(NF.live?'<b style="color:#D92D20">EN JUEGO</b> · ':'')+'actualizado hace '+(ago<60?ago+' s':Math.round(ago/60)+' min')+'</span><button onclick="NF.t=0;if(typeof liveLoad===\'function\')liveLoad(true);render()">↻</button></div>';
 h+=seg('nff',['Todos','Con mis jugadores']);
 h+=E.map(function(e){var as=+e.a.sc||0,hs=+e.h.sc||0,done=e.st==='post';
  var row=function(x,lo){return '<div class="ngr'+(lo?' lo':'')+'"><img src="'+esc(x.logo)+'" alt="" onerror="this.style.visibility=\'hidden\'"><div class="tn">'+esc(x.ab)+'<small>'+esc(x.rec)+'</small></div>'+(x.pos&&e.st==='in'?'<span class="pz"></span>':'')+'<div class="sc">'+(e.st==='pre'?'':esc(x.sc))+'</div></div>'};
  var ppl=function(o,cls){return [e.a.t,e.h.t].map(function(t){return (o[t]||[]).map(function(nm){var v=pe.pts[nm];return '<span class="'+cls+'">'+esc(nfShort(nm))+(e.st!=='pre'&&v!=null?'<b>'+n(v)+'</b>':'')+'</span>'}).join('')}).join('')};
  var pm=ppl(pe.mine,''),pr=ppl(pe.riv,'rv');
  return '<div class="ng'+(e.st==='in'?' in':'')+'"><div class="ngt"><span class="st '+e.st+'">'+esc(e.lab)+'</span><span>'+esc(e.tv)+'</span></div>'+row(e.a,done&&as<hs)+row(e.h,done&&hs<as)+(e.st==='in'&&e.dd?'<div class="ngs'+(e.rz?' rz':'')+'">'+esc(e.dd)+(e.rz?' · zona roja':'')+'</div>':'')+(pm||pr?'<div class="ngp">'+pm+pr+'</div>':'')+'</div>'}).join('')||card('','<div class="empty">Sin partidos con este filtro.</div>');
 return h+'<div class="dtn"><span style="color:#0E7A47;font-weight:700">Verde</span> = tus jugadores, <span style="color:#B42318;font-weight:700">rojo</span> = los de tu rival, con sus puntos fantasy en vivo. Se actualiza solo cada ~25 s mientras haya partidos en juego.</div>'}
if(PTO.indexOf('NFL')<0)PTO.splice(1,0,'NFL');
(function(){var _m=V.matchup;V.matchup=function(){if(cur('pt','Mi partido')==='NFL'){WK.sel=null;nfLoad(false);return tabs('pt',PTO)+nflView()}return _m()}})();
setInterval(function(){if(document.visibilityState!=='visible'||!D||!nfOn())return;nfLoad(false);if(typeof liveLoad==='function')liveLoad(false)},10000);
// acceso rápido en Inicio
(function(){var _h=V.home;V.home=function(){return String(_h()).replace('<button onclick="qGo(\'matchup\',\'pt\',\'Posiciones\')"><i>'+svg('chart')+'</i>Posiciones</button>','<button onclick="qGo(\'matchup\',\'pt\',\'NFL\')"><i>'+svg('live')+'</i>NFL en vivo</button>')}})();

render();
// ======================= v6 (pegar al final de tema.js) =======================
// iOS pone un difuminado arriba con el color de fondo de la página: el fondo pasa a negro y solo el contenido es claro
(function(){var st=document.createElement('style');st.textContent=[
 'html,html body{background:#0B0F17!important;background-image:none!important}',
 'body{padding-bottom:0!important}',
 'main#m{background:var(--ob);min-height:100vh;padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}',
 '#sltop{position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top);background:#0B0F17;z-index:65;pointer-events:none}'
 ].join('');document.head.appendChild(st);
 var d=document.createElement('div');d.id='sltop';document.body.appendChild(d);
 var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute('content','#0B0F17')})();
render();
