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
'#cbtn{position:fixed!important;display:none;align-items:center;justify-content:center;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0!important;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent}'+
'#cbtn.ok{display:flex}#cbtn svg{display:block;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}'+
'body.coach-on #cbtn{display:none!important}'+
'#cbtn .cdot{display:none;position:absolute;top:-3px;right:-4px;width:9px;height:9px;border-radius:50%;background:#C8F36A;box-shadow:0 0 0 2px #0A0D13}#cbtn.nuevo .cdot{display:block}'+ 
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
function marca(){return (typeof D!=='undefined'&&D&&D.actualizado?D.actualizado:'')+'|'+(typeof LIGA!=='undefined'?LIGA:'')}
function punto(){var b=document.getElementById('cbtn');if(!b)return;var m=marca();var v=null;try{v=localStorage.getItem('coach_visto')}catch(e){}b.classList.toggle('nuevo',!!m&&m!=='|'&&v!==m)}
function abierto(){return document.getElementById('cpn').classList.contains('on')}
function abrir(){var p=document.getElementById('cpn');if(abierto())return;try{localStorage.setItem('coach_visto',marca())}catch(e){}punto();p.classList.add('on');document.body.classList.add('coach-on');
 setTimeout(function(){try{document.getElementById('cq').focus()}catch(e){}},80);
 if(!document.getElementById('cms').children.length)add('Hola, soy Coach Intel. Escribe tu pregunta abajo o toca una sugerida. Respondo con los datos del modelo de esta liga.','a')}
function cerrar(deHist){if(!abierto())return;document.getElementById('cpn').classList.remove('on');document.body.classList.remove('coach-on');
}
function init(){if(document.getElementById('cbtn'))return;
 var b=document.createElement('button');b.id='cbtn';b.type='button';b.title='Coach Intel';b.setAttribute('aria-label','Coach Intel');
 b.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" stroke-width="2"><path d="M12 4.2C10.9 2.9 8.6 2.8 7.4 4 5.6 3.9 4.2 5.4 4.4 7.1 2.9 7.9 2.4 9.9 3.4 11.2 2.5 12.6 2.9 14.6 4.4 15.3 4.3 17.1 5.8 18.6 7.6 18.4 8.6 19.9 10.8 20.2 12 19"/><path d="M12 4.2C13.1 2.9 15.4 2.8 16.6 4 18.4 3.9 19.8 5.4 19.6 7.1 21.1 7.9 21.6 9.9 20.6 11.2 21.5 12.6 21.1 14.6 19.6 15.3 19.7 17.1 18.2 18.6 16.4 18.4 15.4 19.9 13.2 20.2 12 19"/><path d="M12 4.2V19"/><path d="M10.4 7.4h3.2M10.4 10.2h3.2M10.4 13h3.2M10.4 15.8h3.2"/><path d="M7.6 7.4c-.9.6-1.2 1.6-.8 2.6M6.4 12.6c.9-.3 1.9 0 2.4.8M16.4 7.4c.9.6 1.2 1.6.8 2.6M17.6 12.6c-.9-.3-1.9 0-2.4.8"/></svg><i class="cdot"></i>';
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
function iconosArriba(b){var out=[];
 [].forEach.call(document.querySelectorAll('svg'),function(s){if(b.contains(s)||s.closest('#cpn')||!visible(s))return;
  var q=s.getBoundingClientRect();if(q.width<12||q.width>44||q.height<12||q.top<0||q.top>110)return;
  var el=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);if(!el||!(s===el||s.contains(el)||(el.contains&&el.contains(s))))return;
  if(!out.some(function(o){return Math.abs(o.r.left-q.left)<6}))out.push({s:s,r:q})});
 return out.sort(function(x,y){return y.r.right-x.r.right})}
function ponerBtn(){var b=document.getElementById('cbtn')||window.__cbtn;if(!b)return;window.__cbtn=b;
 if(b.parentNode!==document.body)document.body.appendChild(b);
 var sp=document.getElementById('splash');
 if(Date.now()-T0<3500&&sp&&visible(sp)&&!sp.classList.contains('hide')){b.classList.remove('ok');return}
 var was=b.classList.contains('ok');b.classList.remove('ok'); // no medirse a sí mismo
 var ic=iconosArriba(b),der=ic[0],bel=ic[1];
 if(!der||!bel||der.r.left<window.innerWidth/2){b.style.zIndex='2147483000';b.style.top='calc(12px + env(safe-area-inset-top))';
  b.style.left='auto';b.style.right='120px';b.style.width='24px';b.style.height='24px';b.style.color='#F4F5F7';b.classList.add('ok');return}
 var r=bel.r,gap=Math.max(6,der.r.left-r.right),ss=getComputedStyle(bel.s),bs=b.querySelector('svg');
 b.style.zIndex='2147483000';b.style.color=ss.color||'#F4F5F7';b.style.width=r.width+'px';b.style.height=r.height+'px';
 if(bs){bs.setAttribute('width',r.width);bs.setAttribute('height',r.height);
  var sw=bel.s.getAttribute('stroke-width')||ss.strokeWidth;if(sw)bs.setAttribute('stroke-width',parseFloat(sw)||2)}
 b.style.right='auto';b.style.top=Math.round(r.top)+'px';b.style.left=Math.max(4,Math.round(r.left-gap-r.width))+'px';b.classList.add('ok')}function arreglarAviso(){var m=document.getElementById('m');if(!m)return;
 [].forEach.call(m.querySelectorAll('div'),function(d){var t=d.textContent||'';if(t.indexOf('ActualizarTodo')<0)return;
  if([].some.call(d.querySelectorAll('div'),function(x){return (x.textContent||'').indexOf('ActualizarTodo')>=0}))return;
  var n=t.match(/semana\s+(\d+)[^\d]+?(\d+)/),sl=n?+n[1]:0,mo=n?+n[2]:0;
  if(sl>mo){var tx=d.querySelector('span')||d;tx.textContent='Sleeper ya está en la semana '+sl+' y el modelo todavía en la '+mo+'. Se actualiza solo en unas horas.'}
  else d.remove()});
 var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT,null,false),x;
 while((x=w.nextNode()))if(x.nodeValue.indexOf('del Excel')>=0)x.nodeValue=x.nodeValue.replace(/del Excel/g,'del modelo')}
setInterval(function(){ponerBtn();arreglarAviso();punto()},300);window.addEventListener('scroll',ponerBtn,{passive:true});window.addEventListener('resize',ponerBtn);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
