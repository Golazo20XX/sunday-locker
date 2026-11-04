// ===== SUNDAY LOCKER · tema.js · Entrega 1: paleta "Estadio de noche", tipografía, filtros, chips de posición y logos de equipo =====
// Va DESPUÉS de partido.js en index.html. No cambia datos ni cálculos: solo cómo se ve.
(function(){
 var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&display=swap';document.head.appendChild(lk);
 var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute('content','#0B1220');
 var st=document.createElement('style');st.id='tema';st.textContent=[
 ':root{--ob:#0B1220;--gr2:#121B2D;--gr:#1A2540;--ln:#24324D;--tx:#EEF2F8;--mu:#8C9AB3;--li:#2EE59D;--vi:#8B7CFF;--ok:#34D399;--bad:#F87171;--wa:#FBBF24;--gt:rgba(46,229,157,.10);--gb:rgba(46,229,157,.28);--vt:rgba(139,124,255,.12)}',
 'html,body{background:var(--ob)}body{font-variant-numeric:tabular-nums}',
 '.hd2,.ttl2,.week,.wkh b,.card h3,.ph h2{font-family:"Barlow Condensed",Inter,sans-serif!important;font-style:italic;font-weight:800;letter-spacing:.3px;text-transform:uppercase}',
 '.ttl2{font-size:22px}.week{font-size:34px;line-height:1}.wkh b{font-size:22px}.ph h2{font-size:30px;line-height:1;margin:12px 0 4px}',
 'header{background:var(--ob)!important}',
 'nav,nav#nv{background:#0D1526!important;border-top:1px solid var(--ln)}',
 'nav button.on{color:var(--li)}nav button.on .ni{background:var(--gt)!important}',
 '#busy{background:var(--li)!important}',
 '.card{background:var(--gr2);border:1px solid var(--ln);border-radius:16px}',
 '.card h3{font-size:16px;color:var(--tx);align-items:baseline;margin-bottom:12px}',
 '.card h3>:nth-child(2){font-family:Inter,sans-serif;font-style:normal;font-size:10.5px;font-weight:600;letter-spacing:.6px;color:var(--mu)}',
 '.card:has(>.vs){background:linear-gradient(180deg,#17233D 0%,var(--gr2) 70%);border-color:#2B3B5C}',
 '.tabs{gap:22px!important;padding:0 16px!important;border-bottom:1px solid var(--ln)!important;margin-bottom:14px!important;background:var(--ob)}',
 '.tabs button{border:0!important;border-radius:0!important;background:none!important;padding:12px 0 10px!important;color:var(--mu)!important;font-weight:600;border-bottom:2px solid transparent!important}',
 '.tabs button.on{color:var(--tx)!important;font-weight:700!important;border-bottom-color:var(--li)!important}',
 '.seg button{background:var(--gr2);border:1px solid var(--ln);color:var(--mu);border-radius:16px;font-weight:600}',
 '.seg button.on{background:var(--vi)!important;border-color:var(--vi)!important;color:#fff!important}',
 '.wkb button.cur:not(.on){color:var(--tx);border-color:#3A4B6E}',
 '.pos{width:34px;height:22px;border-radius:7px;font-size:10px;font-weight:800;letter-spacing:.3px;border:0!important}.pos svg{width:14px;height:14px}',
 '.QB{background:rgba(124,196,250,.16);color:#7CC4FA}.RB{background:rgba(242,184,160,.16);color:#F2B8A0}.WR{background:rgba(184,176,255,.18);color:#B8B0FF}.TE{background:rgba(249,210,122,.16);color:#F9D27A}',
 '.K,.DST,.DEF{background:rgba(174,184,201,.14);color:#AEB8C9}.FLEX{background:var(--gt);color:var(--li)}',
 '.av.tm{border-radius:10px;background:var(--gr)}.av.tm img{object-fit:contain;padding:4px}',
 '.phw{position:relative;display:inline-block}.phw .tmb{position:absolute;right:-2px;bottom:-2px;width:34px;height:34px;border-radius:50%;background:#fff center/74% no-repeat;border:2px solid var(--ob)}',
 '.ph .bigav{border-color:var(--li)}',
 '.row .r{min-width:56px;padding:6px 8px;border-radius:10px;background:var(--vt);text-align:center}.row .r b{font-size:15px}.row .r small{font-size:8.5px}',
 '.row.mine{box-shadow:inset 3px 0 0 var(--li);padding-left:10px}.row.fa{box-shadow:inset 3px 0 0 var(--vi);padding-left:10px}',
 '.row.sel,.mt.me,.pml.me{background:var(--gt)!important;border:1px solid var(--gb)!important}',
 '.chip{background:var(--gr);border:1px solid transparent;border-radius:8px;padding:2px 8px}',
 '.chip:has(.g){background:rgba(52,211,153,.13)}.chip:has(.rd){background:rgba(248,113,113,.13)}.chip:has(.y){background:rgba(251,191,36,.12)}',
 '.pill.ok{background:var(--gt);color:var(--li);border:1px solid var(--gb)}',
 '.pill.wa{background:rgba(251,191,36,.10);color:var(--wa);border:1px solid rgba(251,191,36,.30)}',
 '.res.w{background:var(--gt);color:var(--li)}.res.l{background:rgba(248,113,113,.13);color:var(--bad)}',
 '.prob,.pbar{background:#24324D}.prob i,.pbar i{background:linear-gradient(90deg,var(--vi),#A99BFF)}.bb{background:var(--vi)}',
 '.stat3 div{background:var(--vt);border:1px solid transparent}.vg div{background:var(--ob)}',
 '.btn{background:var(--li);color:#04231A;border-radius:14px}.btn.sec{background:var(--gr);color:var(--tx);border:1px solid var(--ln)}',
 '.tile{background:var(--gr2);border-color:var(--ln)}.tile .tic,.tile .e.ici{background:var(--gt)!important;color:var(--li)!important}',
 '.lgp{background:var(--gr2);border-color:var(--ln)}.lgp i{background:var(--li)}',
 '#more .pn{background:var(--gr2)}.mg{background:var(--ob)}',
 '.tst{background:var(--gr)}',
 '.sk{background:linear-gradient(90deg,var(--gr2) 0,#1B2742 50%,var(--gr2) 100%);background-size:600px 100%}',
 '.cmp td.best{color:var(--li)}'
 ].join('');document.head.appendChild(st)})();

(function(){var _sh=shield;shield=function(c){c=c==='#C8F36A'?'#2EE59D':c==='#8B95A7'?'#5B6B88':c;return _sh(c).replace('#161B24','#121B2D')}})();
vor=function(v){if(typeof v!=='number')return '';var c=v>=60?'#2EE59D':v>=20?'#9BE8C6':v>=0?'#8C9AB3':'#F87171';return '<span style="color:'+c+';font-weight:700">'+Math.round(v)+'</span>'};

var TM={d:null,m:{}};
function tmCode(t){t=String(t||'').trim().toLowerCase();if(!t||t==='fa'||t==='—')return '';if(t==='la')t='lar';return t}
function tmLogo(t){t=tmCode(t);return t?'https://sleepercdn.com/images/team_logos/nfl/'+t+'.png':''}
function tmNfl(name){if(TM.d!==D){TM.d=D;TM.m={};['App_RankROS','App_RankSemana','App_Roster','App_Novedades','App_Streaming','App_Libres'].forEach(function(k){rows(k).forEach(function(r){if(r.Jugador&&r.NFL&&!TM.m[r.Jugador])TM.m[r.Jugador]=r.NFL})})}return TM.m[name]||''}
(function(){var _av=av;av=function(name,nfl,pos,cls){var t=nfl||tmNfl(name),dst=pos==='DST'||pos==='DEF';
 if(cls==='bigav'){var h=_av(name,t,pos,cls),u=tmLogo(t);return (u&&!dst)?'<div class="phw">'+h+'<span class="tmb" style="background-image:url('+u+')"></span></div>':h}
 if(cls&&cls!=='av')return _av(name,t,pos,cls);
 var u=tmLogo(t);if(!u||dst)return _av(name,t,pos,cls);
 return '<div class="av tm">'+esc(ini(name))+'<img src="'+u+'" alt="" loading="lazy" onerror="this.remove()"></div>'}})();

(function(){var _p=prow;prow=function(r,o){var h=_p(r,o),d=r&&r['Dueño'];var c=d&&R&&d===R.equipo?' mine':d==='Libre'?' fa':'';return c?h.replace('<div class="row tap"','<div class="row tap'+c+'"'):h}})();

render();
