// ===== SUNDAY LOCKER · coach.js · Coach IA (Gemini gratis vía Cloudflare Worker) =====
(function(){
var COACH_URL='https://coach-intel.joseandres87.workers.dev/'; // ej. https://coach-intel.tuusuario.workers.dev
var TABLAS=[['App_Resumen',60],['App_Alineacion',20],['App_Rival',12],['App_Roster',25],['App_Calendario',12],
 ['App_Posiciones',14],['App_Partidos',8],['App_Fuerza',8],['App_Waivers',15],['App_Pujas',10],['App_Libres',25],
 ['App_Streaming',30],['App_Radar',12],['App_Byes',10],['App_Trades',15],['App_Comprar',12],['App_Vender',12],
 ['App_Riesgo',10],['App_Mercado',14],['App_Hallazgos',8],['App_Ajustes',10],['App_Novedades',40],
 ['App_RankSemana',60],['App_RankROS',60]];
var MAX=60000,H=[],ocupado=false;
var st=document.createElement('style');st.textContent=
'#cbtn{position:fixed!important;z-index:11;display:none;align-items:center;justify-content:center;background:none!important;border:0!important;box-shadow:none!important;padding:0;margin:0;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent}'+
'#cbtn.ok{display:flex}#cbtn svg{display:block;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}'+
'body.coach-on #cbtn{display:none!important}'+
'#cpn{position:fixed!important;left:0;right:0;top:0;height:100vh;height:100dvh;z-index:2147483600!important;background:#0A0D13;color:#F4F5F7;display:none!important;flex-direction:column;font-family:Inter,system-ui}'+
'#cpn.on{display:flex!important}body.coach-on{overflow:hidden}'+
'#cpn .ch{flex:none;display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:1px solid #2E3746}'+
'#cpn .ch b{flex:1;font-family:Unbounded,Inter;font-size:16px}'+
'#cpn .cx{all:unset;box-sizing:border-box;cursor:pointer;padding:8px 12px;border-radius:10px;background:#252D3A;color:#F4F5F7;font:600 13px Inter,system-ui}'+
'#cms{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}'+
'#cpn .cm{max-width:88%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}'+
'#cpn .cm.u{align-self:flex-end;background:#C8F36A;color:#0A0D13}#cpn .cm.a{align-self:flex-start;background:#161B24;border:1px solid #2E3746}'+
'#cpn .cm.e{align-self:flex-start;color:#F87171;font-size:12px;border:1px solid #F87171;background:transparent}'+
'#csg{flex:none;display:flex;gap:6px;overflow-x:auto;padding:8px 14px}'+
'#csg .cs{all:unset;box-sizing:border-box;flex:none;cursor:pointer;border:1px solid #2E3746;background:#161B24;color:#F4F5F7;border-radius:16px;padding:6px 10px;font:500 12px Inter,system-ui;white-space:nowrap}'+
'#cfm{flex:none;display:flex!important;gap:8px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));border-top:1px solid #2E3746;background:#0A0D13}'+
'#cpn #cq{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;-webkit-user-select:text!important;user-select:text!important;-webkit-appearance:none;appearance:none;flex:1;min-width:0;height:44px;margin:0;border-radius:12px;border:1px solid #2E3746;background:#161B24!important;color:#F4F5F7!important;-webkit-text-fill-color:#F4F5F7;caret-color:#C8F36A;padding:0 12px;font:16px Inter,system-ui;outline:none}'+
'#cpn #cq::placeholder{color:#8B95A7;-webkit-text-fill-color:#8B95A7}'+
'#cpn #cgo{all:unset;box-sizing:border-box;cursor:pointer;border-radius:12px;background:#C8F36A;color:#0A0D13;font:700 14px Inter,system-ui;padding:0 16px;display:flex;align-items:center}';
document.head.appendChild(st);
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function csv(rs){if(!rs||!rs.length)return '';var k=Object.keys(rs[0]);
 return k.join('|')+'\n'+rs.map(function(r){return k.map(function(c){var v=r[c];if(typeof v==='number')v=Math.round(v*10)/10;return String(v==null?'':v).replace(/[\n|]/g,' ')}).join('|')}).join('\n')}
function contexto(){
 if(typeof D==='undefined'||!D||!D.datos)return '';
 var out='Liga: '+(typeof LIGA!=='undefined'&&LIGA?LIGA:'(única)')+'\nDatos actualizados: '+(D.actualizado||'')+'\n';
 TABLAS.forEach(function(t){var rs=(D.datos[t[0]]||[]);if(!rs.length)return;var s='\n## '+t[0]+'\n'+csv(rs.slice(0,t[1]))+'\n';
  if(out.length+s.length<MAX)out+=s});
 return out}
function add(t,c){var d=document.createElement('div');d.className='cm '+c;d.innerHTML=esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
 var m=document.getElementById('cms');m.appendChild(d);m.scrollTop=m.scrollHeight;return d}
function leer(){return (document.getElementById('cq').value||'').trim()}
function enviar(q){q=(q||'').trim();if(!q||ocupado)return;
 if(COACH_URL.indexOf('http')!==0){add('Falta pegar la URL del Worker en coach.js (COACH_URL).','e');return}
 ocupado=true;add(q,'u');var w=add('Pensando…','a');document.getElementById('cq').value='';
 fetch(COACH_URL,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({pregunta:q,historial:H.slice(-6),contexto:contexto()})})
 .then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error(/hello world/i.test(t)?'El Worker todavía tiene el código de ejemplo (Hello World). Pega worker.js en Edit code y toca Deploy.':'Respuesta rara del Worker ('+r.status+'): '+t.slice(0,150))}return j})},
  function(e){throw new Error('No llegué al Worker. Revisa la URL en coach.js y que ORIGEN en el Worker sea '+location.origin+' ('+e.message+')')})
 .then(function(j){if(j.error)throw new Error(j.error);w.innerHTML=esc(j.respuesta).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  H.push({rol:'user',texto:q},{rol:'model',texto:j.respuesta})})
 .catch(function(e){w.className='cm e';w.textContent='No pude responder: '+e.message})
 .then(function(){ocupado=false;var m=document.getElementById('cms');m.scrollTop=m.scrollHeight})}
var SUG=['¿Qué alineación pongo esta semana?','¿Qué waiver pido y cuánto ofrezco?','¿Cómo voy contra mi rival?','¿A quién debería vender?','¿Qué DST hago streaming?'];
function abierto(){return document.getElementById('cpn').classList.contains('on')}
function abrir(){var p=document.getElementById('cpn');if(abierto())return;p.classList.add('on');document.body.classList.add('coach-on');
 setTimeout(function(){try{document.getElementById('cq').focus()}catch(e){}},80);
 if(!document.getElementById('cms').children.length)add('Hola, soy Coach Intel. Escribe tu pregunta abajo o toca una sugerida. Respondo con los datos del modelo de esta liga.','a')}
function cerrar(deHist){if(!abierto())return;document.getElementById('cpn').classList.remove('on');document.body.classList.remove('coach-on');
}
function init(){if(document.getElementById('cbtn'))return;
 var b=document.createElement('button');b.id='cbtn';b.type='button';b.title='Coach Intel';b.setAttribute('aria-label','Coach Intel');
 b.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" stroke-width="2"><path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.3-4.6A7.5 7.5 0 1 1 20 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.6"/></svg>';
 document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#cbtn');if(t){e.preventDefault();e.stopPropagation();abrir()}},true);
 ['touchstart','touchend','mousedown','pointerdown'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation()},false)});
 var bell=document.getElementById('bdg'),hb=bell&&bell.closest('button');
 window.__cbtn=b;document.body.appendChild(b);ponerBtn();arreglarAviso();
 try{new MutationObserver(function(){arreglarAviso();ponerBtn()}).observe(document.getElementById('m')||document.body,{childList:true,subtree:true})}catch(e){}
 var p=document.createElement('div');p.id='cpn';
 p.innerHTML='<div class="ch"><button type="button" class="cx">‹ Volver</button><b>Coach Intel</b></div><div id="cms"></div>'+
  '<div id="csg">'+SUG.map(function(s){return '<button type="button" class="cs">'+esc(s)+'</button>'}).join('')+'</div>'+
  '<div id="cfm"><input id="cq" type="text" autocomplete="off" enterkeyhint="send" placeholder="Escribe tu pregunta…"><button type="button" id="cgo">Enviar</button></div>';
 document.body.appendChild(p);
 ['touchstart','touchmove','touchend','mousedown','mouseup','click','keydown','keyup','input','focusin','pointerdown','pointerup'].forEach(function(ev){p.addEventListener(ev,function(e){e.stopPropagation()},false)});
 p.querySelector('.cx').onclick=function(){cerrar(false)};
 [].forEach.call(p.querySelectorAll('#csg .cs'),function(x){x.onclick=function(){enviar(x.textContent)}});
 document.getElementById('cgo').onclick=function(){enviar(leer())};
 document.getElementById('cq').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();enviar(leer())}};
 document.addEventListener('keydown',function(e){if(e.key==='Escape')cerrar(false)});
 document.getElementById('cq').addEventListener('keydown',function(e){if(e.key==='Escape')cerrar(false)})}
function visible(el){if(!el)return false;var s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0.05}
var T0=Date.now();
function ponerBtn(){var b=document.getElementById('cbtn')||window.__cbtn;if(!b)return;window.__cbtn=b;
 if(b.parentNode!==document.body)document.body.appendChild(b);
 var bell=document.getElementById('bdg'),hb=bell&&bell.closest('button'),r=hb&&hb.getBoundingClientRect();
 var pronto=Date.now()-T0<3500,sp=document.getElementById('splash');
 if(pronto&&sp&&visible(sp)&&!sp.classList.contains('hide')){b.classList.remove('ok');return} // solo al abrir la app
 if(!r||!r.width||r.bottom<=0||r.top>window.innerHeight){ // sin campana visible: flota arriba a la derecha
  b.style.zIndex='2147483000';b.style.top='calc(12px + env(safe-area-inset-top))';b.style.left='auto';b.style.right='64px';
  b.style.width='34px';b.style.height='34px';b.style.color='#F4F5F7';b.classList.add('ok');return}
 var z=0,e;for(e=hb;e&&e!==document.body;e=e.parentElement){var zz=parseInt(getComputedStyle(e).zIndex,10);if(!isNaN(zz))z=Math.max(z,zz)}
 b.style.zIndex=String(Math.max(z+1,12));
 var cs=getComputedStyle(hb),sv=hb.querySelector('svg'),ss=sv&&getComputedStyle(sv),bs=b.querySelector('svg');
 b.style.color=cs.color;b.style.width=r.width+'px';b.style.height=r.height+'px';
 if(ss&&bs){bs.setAttribute('width',parseFloat(ss.width)||22);bs.setAttribute('height',parseFloat(ss.height)||22);
  var sw=sv.getAttribute('stroke-width')||ss.strokeWidth;if(sw)bs.setAttribute('stroke-width',parseFloat(sw)||2)}
 var gap=8,sig=hb.nextElementSibling;
 if(sig&&visible(sig)){var r2=sig.getBoundingClientRect();if(r2.width&&r2.left>=r.right&&r2.left-r.right<40)gap=r2.left-r.right}
 b.style.right='auto';b.style.top=Math.round(r.top)+'px';b.style.left=Math.max(4,Math.round(r.left-gap-r.width))+'px';b.classList.add('ok')}function arreglarAviso(){var m=document.getElementById('m');if(!m)return;
 [].forEach.call(m.querySelectorAll('div'),function(d){var t=d.textContent||'';if(t.indexOf('ActualizarTodo')<0)return;
  if([].some.call(d.querySelectorAll('div'),function(x){return (x.textContent||'').indexOf('ActualizarTodo')>=0}))return;
  var n=t.match(/semana\s+(\d+)[^\d]+?(\d+)/),sl=n?+n[1]:0,mo=n?+n[2]:0;
  if(sl>mo){var tx=d.querySelector('span')||d;tx.textContent='Sleeper ya está en la semana '+sl+' y el modelo todavía en la '+mo+'. Se actualiza solo en unas horas.'}
  else d.remove()});
 var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT,null,false),x;
 while((x=w.nextNode()))if(x.nodeValue.indexOf('del Excel')>=0)x.nodeValue=x.nodeValue.replace(/del Excel/g,'del modelo')}
setInterval(function(){ponerBtn();arreglarAviso()},300);window.addEventListener('scroll',ponerBtn,{passive:true});window.addEventListener('resize',ponerBtn);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
