// ===== SUNDAY LOCKER · tema.js v3 · navegación, tema claro, inicio tipo dashboard, ficha en ventana y cambios de alineación =====
// Va DESPUÉS de partido.js en index.html. No cambia datos ni cálculos del modelo: cambia la organización y cómo se ve.
(function(){
 var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&display=swap';document.head.appendChild(lk);
 var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute('content','#0B0F17');
 var st=document.createElement('style');st.id='tema';st.textContent=[
 ':root{--ink:#0B0F17;--br:#C8F36A;--ob:#F2F4F8;--gr2:#FFFFFF;--gr:#EEF1F6;--ln:#E3E7EE;--tx:#101828;--mu:#667085;--li:#0E9F5A;--ok:#12A150;--bad:#D92D20;--wa:#B76E00}',
 'html,body{background:var(--ob);color:var(--tx)}body{font-variant-numeric:tabular-nums}',
 '.ttl2,.week,.wkh b,.card h3,.ph h2,.sech b{font-family:"Barlow Condensed",Inter,sans-serif!important;font-style:italic;font-weight:800;letter-spacing:.3px;text-transform:uppercase}',
 '.ttl2{font-size:23px}.week{font-size:34px;line-height:1;margin:2px 0 14px}.wkh b{font-size:22px}.ph h2{font-size:30px;line-height:1;margin:12px 0 4px}',
 '#splash{background:var(--ink)!important;color:#fff}#splash .wm small,#splash .tag{color:#fff}#splash .load{background:#2E3746}',
 'header,header.sc{background:var(--ink)!important;color:#fff;border-bottom:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'+
 '.hlogo .t i{color:rgba(255,255,255,.72)!important;letter-spacing:2.5px}#ptr{background:#fff!important;border-color:var(--ln)!important;box-shadow:none!important}header .ib,header .hb{color:#fff}.hb:active{background:rgba(255,255,255,.1)!important}',
 '.badge{background:var(--br)!important;color:var(--ink)!important}',
 '.lgp{background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important}.lgp i{background:var(--br)!important}.lgp svg{color:rgba(255,255,255,.6)!important}',
 '.tabs{background:var(--ink)!important;margin:-18px -14px 14px!important;padding:0 16px!important;gap:22px!important;border:0!important}',
 '.tabs button{border:0!important;border-radius:0!important;background:none!important;padding:11px 0 10px!important;color:rgba(255,255,255,.55)!important;font-weight:600!important;border-bottom:3px solid transparent!important}',
 '.tabs button.on{color:#fff!important;font-weight:700!important;border-bottom-color:var(--br)!important}',
 '.seg button{background:#fff!important;border:1px solid var(--ln)!important;color:var(--mu)!important;border-radius:16px;font-weight:600}',
 '.seg button.on{background:var(--ink)!important;border-color:var(--ink)!important;color:#fff!important}',
 '.wkb button.cur:not(.on){color:var(--tx)!important;border-color:#98A2B3!important}',
 'nav,nav#nv{background:#fff!important;border-top:1px solid var(--ln)!important;box-shadow:none!important}',
 'nav button{color:#6B7689!important}nav button.on{color:var(--ink)!important;font-weight:700}nav button.on .ni{background:var(--br)!important}',
 '#busy{background:var(--br)!important}',
 '.card{background:#fff;border:1px solid #E6EAF0;border-radius:16px;box-shadow:none}',
 '.card h3{font-size:17px;color:var(--tx);align-items:baseline;margin-bottom:10px}',
 '.card h3>:nth-child(2){font-family:Inter,sans-serif;font-style:normal;font-size:10.5px;font-weight:600;letter-spacing:.6px;color:var(--mu)}',
 '.card:has(>.vs){background:linear-gradient(180deg,#F3FBEA 0%,#FFFFFF 75%);border:1px solid #D7EBC2}',
 '.card:has(>.vs) .vsc{background:#fff;border-color:#D7EBC2;color:var(--mu)}.card:has(>.vs) .prob{background:#E3E7EE}.card:has(>.vs) .prob i{background:var(--li)}',
 '.hlk{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:12px;color:var(--li);font-size:12px;font-weight:700;background:none;border:0;width:100%}.hlk svg{width:14px;height:14px}',
 '.pos{width:34px;height:22px;border-radius:7px;font-size:10px;font-weight:800;letter-spacing:.3px;border:0!important}.pos svg{width:14px;height:14px}',
 '.QB{background:#D9EEFB;color:#1D6FA5}.RB{background:#F7DED5;color:#A04A2A}.WR{background:#E2DEFB;color:#4B3FB5}.TE{background:#FBEDC9;color:#8A6200}',
 '.K,.DST,.DEF,.BN{background:#E9ECF1;color:#4A5568}.FLEX{background:#E3F5EA;color:#0E7A47}',
 '.av{background:var(--gr);color:var(--mu)}.av.tm{border-radius:10px;background:#F4F6F9;border:1px solid #E6EAF0}.av.tm img{object-fit:contain;padding:4px}',
 '.phw{position:relative;display:inline-block}.phw .tmb{position:absolute;right:-2px;bottom:-2px;width:34px;height:34px;border-radius:50%;background:#fff center/74% no-repeat;border:2px solid #fff;box-shadow:0 2px 6px rgba(16,24,40,.15)}',
 '.ph .bigav{border-color:var(--br)!important;background:var(--gr)!important;color:var(--ink)!important}',
 '.row{border-top-color:#EEF1F5}.row .r{min-width:56px;padding:6px 8px;border-radius:10px;background:#F2F5F9;text-align:center}.row .r b{font-size:15px}.row .r small{font-size:8.5px}',
 '.row.mine{box-shadow:inset 3px 0 0 var(--li);padding-left:10px}',
 '.row.tap:active,.ins:active,.mt:active,.pml:active{background:rgba(16,24,40,.04)!important}',
 '.row.sel,.mt.me,.pml.me{background:#EEF8F2!important;border:1px solid #BFE6D0!important}',
 '.chip{background:#F2F4F7;border:1px solid transparent;border-radius:8px;padding:2px 8px;color:var(--mu)}.chip b{color:var(--tx)}',
 '.chip:has(.g){background:#E7F6EE}.chip:has(.rd){background:#FDECEC}.chip:has(.y){background:#FFF4E0}',
 '.pill.ok{background:#E7F6EE;color:#0E7A47;border:1px solid #BFE6D0}.pill.wa{background:#FFF4E0;color:#9A5B00;border:1px solid #F5D9A8}',
 '.pill[style*="3a1a1a"]{background:#FDECEC!important;color:#B42318!important;border-color:#F5C2C2!important}',
 '.res.w{background:#E7F6EE;color:#0E7A47}.res.l{background:#FDECEC;color:#B42318}',
 '.prob,.pbar{background:#E3E7EE!important}.prob i,.pbar i{background:var(--li)}.bb{background:var(--li)}',
 '.stat3 div{background:#F4F6F9;border:1px solid #E6EAF0}.vg div{background:#F7F8FA;border-color:#E6EAF0}',
 '.bnr{background:#FFF7E6!important;border-color:#F5D9A8!important;color:#8A5A00!important}.bnr.err{background:#FDECEC!important;border-color:#F5C2C2!important;color:#B42318!important}',
 'input,select{background:#fff!important;color:var(--tx)!important;border-color:var(--ln)!important}',
 '.btn{background:var(--ink);color:#fff;border-radius:14px}.btn.sec{background:#fff;color:var(--tx);border:1px solid var(--ln)}',
 '#more .pn{background:#fff!important;border-color:var(--ln)!important}.mg{background:#F7F8FA!important;border-color:#E6EAF0!important}.mi:active{background:rgba(16,24,40,.04)!important}.mi .mic{background:#F0F9DC!important;color:#3F6212!important}',
 '.tst{background:#111827!important;color:#fff!important;border-color:#111827!important}',
 '.sk{background:#E9EDF3!important;animation:none!important;border-color:#E6EAF0!important}',
 '.ins .ic.ici,.row .ic.ici{background:#F0F9DC!important;color:#3F6212!important}',
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
 '#sheet{inset:6vh 0 0 0!important;z-index:80!important;border-radius:22px 22px 0 0;background:var(--ob)!important;transform:translateY(105%)!important;transition:transform .3s cubic-bezier(.2,.8,.2,1)!important;box-shadow:0 -10px 40px rgba(0,0,0,.25)!important}#sheet.open{transform:none!important}',
 '#shbg{position:fixed;inset:0;z-index:79;background:rgba(11,15,23,.5);opacity:0;pointer-events:none;transition:opacity .25s}#shbg.on{opacity:1;pointer-events:auto}',
 '#sheet header{position:sticky!important;top:0;z-index:3;background:var(--ob)!important;color:var(--tx);padding:14px 12px 2px!important;min-height:0!important;justify-content:flex-end!important;border:0!important}#sheet header .ttl,#sheet header>span{display:none}',
 '#sheet header::before{content:"";position:absolute;left:50%;top:8px;width:40px;height:4px;margin-left:-20px;border-radius:2px;background:#C5CCD6}',
 '#sheet header .mx{position:static;background:#E6EAF0;color:var(--tx)}#sheet main{padding-top:0}',
 '.pmt{margin-top:16px}',
 '.sw{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;padding:10px 0;border-top:1px solid #EEF1F5}.sw:first-of-type{border-top:0}.sw .x{display:flex;align-items:center;gap:8px;min-width:0;background:none;border:0;padding:0;color:var(--tx);text-align:left}.sw .x.o{flex-direction:row-reverse;text-align:right}.sw .b{min-width:0}.sw .n{font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sw .s{font-size:11px;color:var(--mu)}.sw .ar{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;font-weight:800;color:var(--li)}.sw .ar svg{width:18px;height:18px}',
 '.swh{display:grid;grid-template-columns:1fr auto 1fr;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}.swh span:first-child{color:var(--li)}.swh span:last-child{color:var(--bad);text-align:right}',
 '.swn{font-size:12px;color:#9A5B00;background:#FFF4E0;border-radius:10px;padding:8px 10px;margin-top:8px}.swt{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid #EEF1F5;font-size:12px;color:var(--mu)}.swt b{color:var(--li);font-size:15px}'
 ].join('');document.head.appendChild(st)})();

vor=function(v){if(typeof v!=='number')return '';var c=v>=60?'#0E9F5A':v>=20?'#4F9F72':v>=0?'#667085':'#D92D20';return '<span style="color:'+c+';font-weight:700">'+Math.round(v)+'</span>'};

var TM={d:null,m:{}};
function tmCode(t){t=String(t||'').trim().toLowerCase();if(!t||t==='fa'||t==='—')return '';if(t==='la')t='lar';return t}
function tmLogo(t){t=tmCode(t);return t?'https://sleepercdn.com/images/team_logos/nfl/'+t+'.png':''}
function tmNfl(name){if(TM.d!==D){TM.d=D;TM.m={};['App_RankROS','App_RankSemana','App_Roster','App_Novedades','App_Streaming','App_Libres'].forEach(function(k){rows(k).forEach(function(r){if(r.Jugador&&r.NFL&&!TM.m[r.Jugador])TM.m[r.Jugador]=r.NFL})})}return TM.m[name]||''}
(function(){var _av=av;av=function(name,nfl,pos,cls){var t=nfl||tmNfl(name),dst=pos==='DST'||pos==='DEF';
 if(cls==='bigav'){var h=_av(name,t,pos,cls),u=tmLogo(t);return (u&&!dst)?'<div class="phw">'+h+'<span class="tmb" style="background-image:url('+u+')"></span></div>':h}
 if(cls&&cls!=='av')return _av(name,t,pos,cls);
 var u=tmLogo(t);if(!u||dst)return _av(name,t,pos,cls);
 return '<div class="av tm">'+esc(ini(name))+'<img src="'+u+'" alt="" loading="lazy" onerror="this.remove()"></div>'}})();
(function(){var _p=prow;prow=function(r,o){var h=_p(r,o),d=r&&r['Dueño'];return d&&R&&d===R.equipo?h.replace('<div class="row tap"','<div class="row tap mine"'):h}})();

(function(){var _sh=shield;shield=function(c){c=c==='#C8F36A'?'#0E9F5A':c==='#8B95A7'?'#98A2B3':c;return _sh(c).replace('#161B24','#FFFFFF')}})();

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

function mvCard(o){return '<button class="mv" onclick="'+o.a+'"><div class="mvl k-'+o.k+'">'+esc(o.lab)+'</div><div class="mvb">'+(o.av||'<div class="ic2">'+svg(o.ic||'star')+'</div>')+'<div class="b"><div class="n">'+esc(o.t)+'</div><div class="s">'+esc(o.s)+'</div></div><div class="r"><b>'+o.m+'</b><small>'+esc(o.ml)+'</small></div></div><div class="mvf">'+esc(o.f||'Ver detalle')+svg('chev',2.2)+'</div></button>'}
V.home=function(){var lc=lnChanges(),pg=R.prob_ganar,gain=lc&&lc.pairs.length?Math.max(lc.g,0.01):0,p0=lc&&lc.pairs[0];
 var h='<div class="greet">'+greet()+'</div><div class="week">Semana '+esc(R.semana)+'</div>';
 h+=card('','<div class="vs"><div class="side">'+shield('#C8F36A')+'<div class="nm">'+esc(R.equipo)+'</div><div class="pts">'+n(R.proy_yo_sleeper)+'</div><div class="lbl">Proy. · '+esc(R.record_yo)+'</div></div><div class="vsc">VS</div><div class="side">'+shield('#8B95A7')+'<div class="nm">'+esc(R.rival)+'</div><div class="pts">'+n(R.proy_rival_sleeper)+'</div><div class="lbl">Proy. · '+esc(R.record_rival)+'</div></div></div>'+
  '<div class="prob"><i style="width:'+Math.round((+pg||0)*100)+'%"></i></div><div class="sm mu" style="margin-top:6px;display:flex;justify-content:space-between"><span>Prob. de ganar <b class="l">'+p(pg)+'</b></span><span>Playoffs '+p(R.playoffs_hoy)+'</span></div>'+
  (gain?'<div class="pill wa" onclick="qGo(\'team\',\'tm\',\'Alineación\')"><span>'+(p0&&p0.inn&&p0.out?'Entra '+esc(p0.inn.Jugador)+' por '+esc(p0.out.Jugador):'Cambia tu alineación')+(lc.pairs.length>1?' y '+(lc.pairs.length-1)+' más':'')+' · +'+n(lc.g)+'</span><span>›</span></div>':'<div class="pill ok" onclick="qGo(\'team\',\'tm\',\'Alineación\')"><span>Alineación lista</span><span>›</span></div>')+
  '<button class="hlk" onclick="qGo(\'matchup\',\'pt\',\'Mi partido\')">Ver el partido completo '+svg('chev',2.4)+'</button>');
 var mv=[],al=typeof alList==='function'?alList():[];
 if(al.length)mv.push({k:'rd',lab:'Alertas',ic:'warn',t:al.length===1?al[0].nm:al.length+' jugadores para revisar',s:al.length===1?al[0].t:'Lesiones, dudas o byes en tu equipo',m:String(al.length),ml:'alertas',a:"openMore('alerts')",f:'Revisar'});
 if(gain)mv.push({k:'wa',lab:'Alineación',av:p0.inn?av(p0.inn.Jugador,p0.inn.NFL,p0.inn.Pos):'',ic:'players',t:p0.inn?'Entra '+p0.inn.Jugador:'Saca a '+p0.out.Jugador,s:p0.out&&p0.inn?'Sale '+p0.out.Jugador+(lc.pairs.length>1?' · y '+(lc.pairs.length-1)+' cambio(s) más':''):'',m:'+'+n(lc.g),ml:'pts',a:"qGo('team','tm','Alineación')",f:'Ver cambios'});
 if(lc&&lc.warn.length)mv.push({k:'rd',lab:'Bye',ic:'warn',t:'Titular sin jugar',s:lc.warn[0],m:String(lc.warn.length),ml:'aviso',a:"qGo('team','tm','Alineación')",f:'Ver detalle'});
 var w0=rows('App_Waivers')[0];if(w0&&w0.Tomar)mv.push({k:'ok',lab:'Waiver #1',av:av(w0.Tomar,'',w0.Pos),t:w0.Tomar,s:(w0.Pos?w0.Pos+' · ':'')+'Suelta a '+w0.Soltar,m:'$'+n(w0.Oferta,0),ml:'Oferta',a:"qGo('market','mk','Waivers')"});
 var sb=rows('App_Streaming').filter(function(r){return typeof r.Mejora==='number'&&r.Mejora>0.5}).sort(function(a,b){return b.Mejora-a.Mejora})[0];
 if(sb)mv.push({k:'in',lab:'Streaming '+sb.Pos,av:av(sb.Jugador,sb.NFL,sb.Pos),t:sb.Jugador,s:'vs '+sb.Rival+' · mejor que el tuyo',m:sg(sb.Mejora),ml:'pts',a:"S.sub.st='"+esc(sb.Pos)+"';qGo('market','mk','Streaming')"});
 var tr=rows('App_Trades')[0];if(tr&&tr.Contraparte)mv.push({k:'in',lab:'Trade sugerido',ic:'trades',t:'Con '+tr.Contraparte,s:'Recibes '+tr.Recibo,m:sg(tr['Mi cambio ROS']),ml:'pts ROS',a:"S.sub.tr='Sugeridos';qGo('market','mk','Trades')"});
 if(mv.length)h+='<div class="sech"><b>Movidas sugeridas</b><span>'+(mv.length>1?'Desliza →':'')+'</span></div><div class="car">'+mv.map(mvCard).join('')+'</div>';
 h+='<div class="sech"><b>Accesos rápidos</b></div><div class="qk">'+[['players','Alineación',"qGo('team','tm','Alineación')"],['waivers','Waivers',"qGo('market','mk','Waivers')"],['stream','Streaming',"qGo('market','mk','Streaming')"],['trades','Trades',"qGo('market','mk','Trades')"],['star','Rankings',"qGo('players','pl','Semana')"],['compare','Comparar',"qGo('players','pl','Comparar')"],['chart','Posiciones',"qGo('matchup','pt','Posiciones')"],['news','Novedades',"qGo('team','tm','Novedades')"]].map(function(x){return '<button onclick="'+x[2]+'"><i>'+svg(x[0])+'</i>'+x[1]+'</button>'}).join('')+'</div>';
 h+='<div class="sech"><b>Tu alineación</b><span>Toca un jugador para ver su ficha</span></div>'+card('',rows('App_Alineacion').map(function(r){return prow({Jugador:r.Jugador,Pos:r.Slot==='FLEX'?'FLEX':r.Slot,Proy:r.Proy,Rival:r.Rival},{sub:function(x){return 'vs '+x.Rival},right:function(x){return fmtP(x,'Proy')}})}).join('')||'<div class="empty">Sin datos.</div>');
 var msgs=[['Alineación','msg_alineacion'],['Bajas y byes','msg_bajas'],['QB','msg_qb'],['TE','msg_te'],['DST','msg_dst'],['K','msg_k'],['Waivers','msg_waivers'],['Enfoque','msg_prioridad']].map(function(x){return R[x[1]]?'<div class="msg"><b>'+x[0]+':</b> '+esc(R[x[1]])+'</div>':''}).join('');
 if(msgs)h+=card('Notas del modelo',msgs);
 return h};

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

function benchFix(bn){return (bn||[]).slice().sort(function(a,b){var k=function(x){return x.proy!=null?x.proy:(+x.pts||0)};return k(b)-k(a)}).map(function(x){return x.empty?x:{nm:x.nm,nfl:x.nfl,pts:x.pts,proy:x.proy,rp:x.pos,pos:'BN'}})}
(function(){var _s=pmSide;pmSide=function(m,ix,pr){var r=_s(m,ix,pr);r.bn=benchFix(r.bn);return r};
 var _f=pfSide;pfSide=function(m,ix,pr){var r=_f(m,ix,pr);r.bn=benchFix(r.bn);return r};
 var _c=pmCell;pmCell=function(x,side,win){var h=_c(x,side,win);return x&&x.rp?h.replace('<div class="s">','<div class="s">'+esc(x.rp)+' · '):h}})();

if(S.tab==='tools'){S.tab='market'}
render();
