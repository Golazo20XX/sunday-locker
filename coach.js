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
'#cbtn{position:fixed;right:14px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:11;border:0;border-radius:24px;padding:10px 14px;background:var(--li);color:#0A0D13;font:700 12px Inter,system-ui;box-shadow:0 4px 14px rgba(0,0,0,.45)}'+
'#cpn{position:fixed;inset:0;z-index:30;background:var(--ob);display:none;flex-direction:column}#cpn.on{display:flex}'+
'#cpn .ch{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid var(--ln)}'+
'#cpn .ch b{font-family:Unbounded;font-size:16px}#cpn .ch button{background:none;border:0;color:var(--mu);font-size:22px}'+
'#cms{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}'+
'.cm{max-width:88%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}'+
'.cm.u{align-self:flex-end;background:var(--li);color:#0A0D13}.cm.a{align-self:flex-start;background:var(--gr2);border:1px solid var(--ln)}'+
'.cm.e{align-self:flex-start;color:var(--bad);font-size:12px}'+
'#csg{display:flex;gap:6px;overflow-x:auto;padding:0 14px 8px}#csg button{flex:none;border:1px solid var(--ln);background:var(--gr2);color:var(--tx);border-radius:16px;padding:6px 10px;font-size:12px}'+
'#cfm{display:flex;gap:8px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));border-top:1px solid var(--ln)}'+
'#cfm textarea{flex:1;resize:none;height:42px;border-radius:12px;border:1px solid var(--ln);background:var(--gr2);color:var(--tx);padding:10px;font:14px Inter,system-ui}'+
'#cfm button{border:0;border-radius:12px;background:var(--li);color:#0A0D13;font-weight:700;padding:0 14px}';
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
function enviar(q){q=(q||'').trim();if(!q||ocupado)return;
 if(COACH_URL.indexOf('http')!==0){add('Falta pegar la URL del Worker en coach.js (COACH_URL).','e');return}
 ocupado=true;add(q,'u');var w=add('Pensando…','a');document.getElementById('cq').value='';
 fetch(COACH_URL,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({pregunta:q,historial:H.slice(-6),contexto:contexto()})})
 .then(function(r){return r.json()})
 .then(function(j){if(j.error)throw new Error(j.error);w.innerHTML=esc(j.respuesta).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  H.push({rol:'user',texto:q},{rol:'model',texto:j.respuesta})})
 .catch(function(e){w.className='cm e';w.textContent='No pude responder: '+e.message})
 .then(function(){ocupado=false;var m=document.getElementById('cms');m.scrollTop=m.scrollHeight})}
var SUG=['¿Qué alineación pongo esta semana?','¿Qué waiver pido y cuánto ofrezco?','¿Cómo voy contra mi rival?','¿A quién debería vender?','¿Qué DST hago streaming?'];
function abrir(){var p=document.getElementById('cpn');p.classList.add('on');
 if(!document.getElementById('cms').children.length)add('Hola, soy Coach Intel. Pregúntame sobre tu alineación, rival, waivers, trades o cualquier jugador. Respondo con los datos del modelo de esta liga.','a');
 setTimeout(function(){document.getElementById('cq').focus()},50)}
function init(){if(document.getElementById('cbtn'))return;
 var b=document.createElement('button');b.id='cbtn';b.textContent='💬 Coach';b.onclick=abrir;document.body.appendChild(b);
 var p=document.createElement('div');p.id='cpn';
 p.innerHTML='<div class="ch"><b>Coach Intel</b><button aria-label="Cerrar">×</button></div><div id="cms"></div>'+
  '<div id="csg">'+SUG.map(function(s){return '<button>'+esc(s)+'</button>'}).join('')+'</div>'+
  '<form id="cfm"><textarea id="cq" placeholder="Escribe tu pregunta…"></textarea><button type="submit">Enviar</button></form>';
 document.body.appendChild(p);
 p.querySelector('.ch button').onclick=function(){p.classList.remove('on')};
 [].forEach.call(p.querySelectorAll('#csg button'),function(x){x.onclick=function(){enviar(x.textContent)}});
 document.getElementById('cfm').onsubmit=function(e){e.preventDefault();enviar(document.getElementById('cq').value)};
 document.getElementById('cq').onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();enviar(this.value)}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
