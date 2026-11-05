// Sunday Locker: usa las proyecciones del modelo propio (carpeta data/ del repo, se actualiza sola cada 3 h)
(function(){
var REPO='https://raw.githubusercontent.com/Golazo20XX/sunday-locker/main/data/';
var TABLAS=['App_RankSemana','App_RankROS','App_ProySem','App_Valor','App_Novedades'];
var MC={},ult=0,bajando=false,avisado=false;
function slug(s){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.'\u2019]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')}
function objetos(t){if(!t||t.length<2)return null;var h=t[0];return t.slice(1).map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i]});return o})}
function aplicar(){
 if(!window.J||!J.ligas)return false;var hubo=false;
 Object.keys(J.ligas).forEach(function(k){var m=MC[k];if(!m)return;var d=J.ligas[k].datos;
  TABLAS.forEach(function(t){if(m['_'+t]===undefined)m['_'+t]=objetos(m[t]);if(m['_'+t]){d[t]=m['_'+t];hubo=true}})});
 if(hubo)pickLiga();return hubo}
function bajar(){
 if(bajando||Date.now()-ult<600000||!window.J||!J.ligas)return;bajando=true;
 var ks=Object.keys(J.ligas).filter(function(k){return k}),cambio=false;
 Promise.all(ks.map(function(k){return fetch(REPO+'modelo_'+slug(k)+'.json?t='+Date.now(),{cache:'no-store'})
  .then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&(!MC[k]||MC[k].generado!==j.generado)){MC[k]=j;cambio=true}}).catch(function(){})}))
 .then(function(){bajando=false;ult=Date.now();if(cambio&&aplicar()){if(typeof render==='function')render();
  var m=MC[LIGA];if(m&&!avisado&&typeof toast==='function'){avisado=true;toast('Proyecciones del modelo propio · semana '+m.semana+' · '+String(m.generado).slice(0,16).replace('T',' ')+' UTC')}}})}
var original=window.setData;
window.setData=function(j){original(j);aplicar();bajar()};
document.addEventListener('visibilitychange',function(){if(!document.hidden)bajar()});
if(window.J)bajar();
})();
