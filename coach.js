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
'#cbtn{background:none;border:0;color:inherit;font-size:20px;line-height:1;padding:6px;cursor:pointer}'+
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
 try{history.pushState({coach:1},'')}catch(e){}
 setTimeout(function(){try{document.getElementById('cq').focus()}catch(e){}},80);
 if(!document.getElementById('cms').children.length)add('Hola, soy Coach Intel. Escribe tu pregunta abajo o toca una sugerida. Respondo con los datos del modelo de esta liga.','a')}
function cerrar(deHist){if(!abierto())return;document.getElementById('cpn').classList.remove('on');document.body.classList.remove('coach-on');
 if(!deHist){try{if(history.state&&history.state.coach)history.back()}catch(e){}}}
function init(){if(document.getElementById('cbtn'))return;
 var b=document.createElement('button');b.id='cbtn';b.type='button';b.title='Coach Intel';b.setAttribute('aria-label','Coach Intel');b.textContent='💬';b.onclick=abrir;
 ['touchstart','touchend','mousedown','pointerdown'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation()},false)});
 var bell=document.getElementById('bdg'),hb=bell&&bell.closest('button');
 if(hb&&hb.parentNode)hb.parentNode.insertBefore(b,hb);else{var hd=document.querySelector('header');if(hd)hd.appendChild(b);else{b.style.cssText='position:fixed;top:10px;right:60px;z-index:20';document.body.appendChild(b)}}
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
 window.addEventListener('popstate',function(){cerrar(true)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')cerrar(false)});
 document.getElementById('cq').addEventListener('keydown',function(e){if(e.key==='Escape')cerrar(false)})}
setInterval(function(){var b=document.getElementById('cbtn'),bell=document.getElementById('bdg'),hb=bell&&bell.closest('button');if(b&&hb&&b.nextSibling!==hb&&hb.parentNode)hb.parentNode.insertBefore(b,hb)},1500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
