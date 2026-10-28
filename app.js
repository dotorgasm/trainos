'use strict';
const KEY='train-os-v1';
const DEMO={"schemaVersion":1,"name":"Palestra Casa","workouts":[{"id":"full-body","name":"Full Body","description":"Demo · 5 esercizi · circa 40 min","exercises":[{"id":"squat","name":"Goblet squat","muscles":["Gambe","Glutei"],"rest":"90 sec","sets":[{"kg":16,"reps":10},{"kg":16,"reps":10},{"kg":16,"reps":10}],"equipment":"1 manubrio · in piedi, senza panca"},{"id":"press","name":"Distensioni con manubri","muscles":["Petto","Tricipiti"],"rest":"90 sec","sets":[{"kg":10,"reps":10},{"kg":10,"reps":10},{"kg":10,"reps":10}],"equipment":"2 manubri + panca piana"},{"id":"row","name":"Rematore con manubrio","muscles":["Dorso","Bicipiti"],"rest":"75 sec","sets":[{"kg":12,"reps":12},{"kg":12,"reps":12},{"kg":12,"reps":12}],"equipment":"1 manubrio + panca come appoggio"},{"id":"rdl","name":"Stacco rumeno con manubri","muscles":["Femorali","Glutei"],"rest":"90 sec","sets":[{"kg":12,"reps":10},{"kg":12,"reps":10},{"kg":12,"reps":10}],"equipment":"2 manubri · in piedi, senza panca"},{"id":"shoulder","name":"Spinte sopra la testa","muscles":["Spalle","Tricipiti"],"rest":"75 sec","sets":[{"kg":8,"reps":10},{"kg":8,"reps":10}],"equipment":"2 manubri · in piedi, senza panca"}]}]};
const $=id=>document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x));
let state={version:1,program:clone(TARGET_PROGRAM),sessions:[],draft:null,week:1},storageOK=true,unreadableRaw=null,timer;
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('toast').style.display='none',5000)}
function num(x,max){return typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=max}
function optionalString(x){return x===undefined||typeof x==='string'}
function checkExercises(exercises,draft){
 if(!Array.isArray(exercises)||!exercises.length||exercises.length>40)throw Error('Esercizi non validi.');
 const ids=new Set();
 for(const e of exercises){
  if(!e||typeof e.id!=='string'||!e.id||ids.has(e.id)||typeof e.name!=='string'||!['equipment','loadLabel','repRange','guidance','rest'].every(k=>optionalString(e[k]))||!Array.isArray(e.muscles)||!e.muscles.every(m=>typeof m==='string')||!Array.isArray(e.sets)||!e.sets.length||e.sets.length>20)throw Error('Esercizio non valido.');
  if(e.type!==undefined&&!['strength','cardio'].includes(e.type))throw Error('Tipo esercizio non valido.');
  if(draft&&(typeof e.note!=='string'||(e.rir!==undefined&&e.rir!==null&&(!num(e.rir,10)||!Number.isInteger(e.rir)))))throw Error('Nota o RIR non valido.');
  ids.add(e.id);
  for(const s of e.sets){
   if(!s)throw Error('Serie non valida.');
   if(e.type==='cardio'){if(!num(s.minutes,1440))throw Error('Minuti non validi.');}
   else if(!(s.kg===null||num(s.kg,1000))||!num(s.reps,1000)||!Number.isInteger(s.reps))throw Error('Kg o ripetizioni non validi.');
   if(draft&&(typeof s.done!=='boolean'||(s.done&&e.type!=='cardio'&&s.kg===null)))throw Error('Serie completata senza carico.');
  }
 }
}
function checkProgram(p){
 if(!p||p.schemaVersion!==1||typeof p.name!=='string'||!optionalString(p.intro)||!Array.isArray(p.workouts)||!p.workouts.length||p.workouts.length>30)throw Error('Programma non valido.');
 const ids=new Set();for(const w of p.workouts){if(!w||typeof w.id!=='string'||!w.id||ids.has(w.id)||typeof w.name!=='string'||!optionalString(w.day)||!optionalString(w.description))throw Error('Scheda non valida o ID duplicato.');ids.add(w.id);checkExercises(w.exercises,false)}return p;
}
function checkDraft(d){if(!d||typeof d.workoutId!=='string'||typeof d.name!=='string'||typeof d.note!=='string'||(d.week!==undefined&&(!Number.isInteger(d.week)||d.week<1||d.week>4)))throw Error('Sessione non valida.');checkExercises(d.exercises,true);return d}
function checkBackup(b){
 if(!b||b.version!==1||!Array.isArray(b.sessions)||b.sessions.length>10000||(b.week!==undefined&&(!Number.isInteger(b.week)||b.week<1||b.week>4)))throw Error('Backup non riconosciuto.');checkProgram(b.program);
 if(b.draft){checkDraft(b.draft);if(!b.program.workouts.some(w=>w.id===b.draft.workoutId))throw Error('Bozza senza scheda.');}
 for(const s of b.sessions){if(!s||!['done','skipped'].includes(s.status)||typeof s.id!=='string'||!Number.isFinite(Date.parse(s.date)))throw Error('Storico non valido.');if(s.status==='done')checkDraft(s);else if(typeof s.name!=='string'||typeof s.reason!=='string'||typeof s.note!=='string'||!Array.isArray(s.muscles)||!s.muscles.every(m=>typeof m==='string'))throw Error('Pausa non valida.');}return b;
}
try{const raw=localStorage.getItem(KEY);if(raw){unreadableRaw=raw;state=checkBackup(JSON.parse(raw));unreadableRaw=null}}catch(e){storageOK=false;toast('Archivio non leggibile o memoria non disponibile. Scarica un backup prima di continuare.')}
state.week=state.week||1;
function persist(){
 if(unreadableRaw!==null){$('save-status').textContent='ARCHIVIO DA RECUPERARE';toast('Esporta i dati originali da Dati, poi ripristina un backup valido.');return false}
 try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;$('save-status').textContent='SALVATO SUL DISPOSITIVO';return true}catch(e){storageOK=false;$('save-status').textContent='SALVATAGGIO NON RIUSCITO';toast('Memoria non disponibile o piena. Scarica subito il backup JSON.');return false}
}
function makeDraft(id){
 const w=state.program.workouts.find(w=>w.id===id)||state.program.workouts[0],week=state.week||1;
 return {workoutId:w.id,name:w.name,week,note:'',exercises:w.exercises.map(e=>{
  // Reuse only completed sets, within the same workout, exercise and load convention.
  const prev=state.sessions.find(s=>s.status==='done'&&s.workoutId===w.id&&s.exercises.some(x=>x.id===e.id&&(x.loadLabel||'Carico (kg)')===(e.loadLabel||'Carico (kg)')&&x.sets.some(s=>s.done))),pe=prev?.exercises.find(x=>x.id===e.id);
  const count=state.program.cycleWeeks===4&&week<=2&&e.type!=='cardio'?Math.max(1,e.sets.length-1):e.sets.length;
  return {id:e.id,name:e.name,muscles:e.muscles,equipment:e.equipment||'',type:e.type||'strength',rest:e.rest||'',loadLabel:e.loadLabel||'Carico (kg)',repRange:e.repRange||'',guidance:e.guidance||'',rir:null,note:'',sets:e.sets.slice(0,count).map((s,i)=>{
   if(e.type==='cardio')return {minutes:s.minutes,done:false};
   const ps=pe?.sets[i];return {kg:ps?.done?ps.kg:s.kg,reps:ps?.done?ps.reps:s.reps,done:false};
  })};
 })};
}
if(!state.draft)state.draft=makeDraft();
function node(tag,attrs={},content){const n=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')n.className=v;else n.setAttribute(k,v)}if(content!==undefined)n.textContent=content;return n}
function show(page){for(const id of ['workout','history','data'])$(id).hidden=id!==page;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));if(page==='history')renderHistory();window.scrollTo(0,0)}
function inputNumber(value,{max=1000,step='1',label,nullable=false,onchange}){
 const i=node('input',{type:'number',min:'0',max:String(max),step,inputmode:step==='1'?'numeric':'decimal','aria-label':label,placeholder:'—'});i.value=value??'';
 i.addEventListener('input',()=>{if(i.value===''&&nullable){i.setCustomValidity('');onchange(null);return}const v=Number(i.value);if(i.value===''||!num(v,max)||(step==='1'&&!Number.isInteger(v))){i.setCustomValidity('Inserisci un valore valido.');$('save-status').textContent='CONTROLLA I VALORI';return}i.setCustomValidity('');onchange(v)});
 return i;
}
function render(){
 const d=state.draft,w=state.program.workouts.find(w=>w.id===d.workoutId);
 $('workout-title').textContent=d.name;$('workout-meta').textContent=[w.day,w.description].filter(Boolean).join(' · ');
 $('workout-select').replaceChildren(...state.program.workouts.map(w=>node('option',{value:w.id},[w.day,w.name].filter(Boolean).join(' · '))));$('workout-select').value=d.workoutId;
 $('week-control').hidden=state.program.cycleWeeks!==4;$('week-select').value=String(state.week);
 $('program-info').textContent=state.program.intro||'Scheda demo. I primi carichi sono esempi, non una prescrizione personale.';
 $('cycle-info').hidden=state.program.cycleWeeks!==4;$('cycle-info').textContent=`Settimana ${d.week||state.week} · ${state.week<=2?'volume ridotto':'volume completo'} · Obiettivo RIR 2–3. I carichi vuoti vanno impostati prima di spuntare la serie. 0 kg = nessuna zavorra nei movimenti a corpo libero.`;
 $('load-program-top').hidden=JSON.stringify(state.program)===JSON.stringify(TARGET_PROGRAM);
 $('session-note').value=d.note;$('exercises').replaceChildren();
 d.exercises.forEach((e,ei)=>{
  const meta=w.exercises.find(x=>x.id===e.id)||{},card=node('article',{class:'exercise'}),head=node('div',{class:'exercise-head'}),cardio=e.type==='cardio';
  head.append(node('span',{},String(ei+1).padStart(2,'0')),node('h2',{},e.name));card.append(head,node('p',{class:'equipment'},e.equipment||meta.equipment||'Attrezzatura non specificata'));
  card.append(node('p',{},cardio?'Registra i minuti effettivi':`${e.muscles.join(' / ')} · ${e.sets.length} serie${e.repRange?' × '+e.repRange:''} · Recupero ${e.rest||'libero'}`));
  if(e.guidance||meta.guidance)card.append(node('p',{class:'guidance'},e.guidance||meta.guidance));
  if(!cardio)card.append(node('p',{class:'load-label'},e.loadLabel||meta.loadLabel||'Carico (kg)'));
  const labels=node('div',{class:cardio?'set-grid cardio labels':'set-grid labels'});(cardio?['BLOCCO','MINUTI','FATTO']:['SET','KG','REPS','FATTO']).forEach(t=>labels.append(node('span',{},t)));card.append(labels);
  e.sets.forEach((s,si)=>{
   const row=node('div',{class:cardio?'set-grid cardio':'set-grid'});row.append(node('span',{class:'set-number'},String(si+1).padStart(2,'0')));
   for(const field of cardio?['minutes']:['kg','reps'])row.append(inputNumber(s[field],{max:field==='minutes'?1440:1000,step:field==='reps'?'1':'any',nullable:field==='kg',label:`${e.name}, ${cardio?'blocco':'serie'} ${si+1}, ${field}`,onchange:v=>{s[field]=v;if(field==='kg'&&v===null){s.done=false;done.checked=false}persist()}}));
   const done=node('input',{type:'checkbox','aria-label':`${e.name}, ${cardio?'blocco':'serie'} ${si+1} completato`});done.checked=s.done;done.addEventListener('change',()=>{if(done.checked&&!cardio&&s.kg===null){done.checked=false;return toast('Imposta il carico effettivo prima di completare la serie.')}s.done=done.checked;persist()});row.append(done);card.append(row);
  });
  if(!cardio){const rirLabel=node('label',{class:'rir-label'},'RIR · opzionale (0–10)'),rir=inputNumber(e.rir??null,{max:10,nullable:true,label:`RIR ${e.name}`,onchange:v=>{e.rir=v;persist()}});rirLabel.append(rir);card.append(rirLabel)}
  const details=node('details'),summary=node('summary',{},'Aggiungi una nota'),note=node('textarea',{'aria-label':`Nota per ${e.name}`,maxlength:'1000'});note.value=e.note;note.addEventListener('input',()=>{e.note=note.value;persist()});details.append(summary,note);if(e.note)details.open=true;card.append(details);$('exercises').append(card);
 });
 $('exercises').append(node('p',{class:'fine'},'I carichi UNICA sono quelli indicati sulla macchina; i kg dei manubri sono per singolo manubrio. Corpo libero: registra solo la zavorra aggiunta. La settimana si cambia manualmente; nessun aumento automatico.'));
}
function progress(s){const all=s.exercises.flatMap(e=>e.sets),done=all.filter(s=>s.done).length;return {done,total:all.length,label:done===all.length?'COMPLETA':'PARZIALE'}}
function exerciseText(e){return `${e.name}${e.equipment?' · '+e.equipment:''}${e.loadLabel&&e.type!=='cardio'?' · '+e.loadLabel:''}: ${e.sets.map((x,i)=>`${e.type==='cardio'?'B':'S'}${i+1} ${e.type==='cardio'?x.minutes+' min':(x.kg??'—')+' kg × '+x.reps} ${x.done?'[completata]':'[non completata]'}`).join('; ')}${e.rir!==null&&e.rir!==undefined?' · RIR '+e.rir:''}${e.note?' · Nota: '+e.note:''}`}
function report(){const lines=['TRAIN/OS · Palestra Casa',`Programma attuale: ${state.program.name}`,`Report esportato: ${new Date().toLocaleString('it-IT')}`,'Dati registrati manualmente. Nessun recupero o aumento automatico.',''];for(const s of [...state.sessions].reverse()){lines.push(`${new Date(s.date).toLocaleString('it-IT')} — ${s.name}${s.week?' · settimana '+s.week:''} — ${s.status==='skipped'?'SALTATO':progress(s).label}`);if(s.status==='skipped')lines.push(`Motivo: ${s.reason}`,`Gruppi previsti: ${s.muscles.join(', ')}`);else s.exercises.forEach(e=>lines.push(exerciseText(e)));if(s.note)lines.push(`Note sessione: ${s.note}`);lines.push('')}if(!state.sessions.length)lines.push('Nessuna sessione registrata.');return lines.join('\n')}
function renderHistory(){
 $('history-list').replaceChildren();if(!state.sessions.length)$('history-list').append(node('p',{},'Nessuna sessione salvata.'));
 for(const s of state.sessions){const card=node('article',{class:'history-item'});card.append(node('p',{class:'eyebrow'},new Date(s.date).toLocaleString('it-IT')),node('h2',{},s.name));if(s.week)card.append(node('p',{},`Settimana ${s.week}`));if(s.status==='skipped')card.append(node('p',{},`Saltato · ${s.reason}`),node('p',{},`Gruppi previsti: ${s.muscles.join(', ')}`));else{const p=progress(s);card.append(node('p',{},`${p.label} · ${p.done}/${p.total} serie / blocchi completati`));const details=node('details'),list=node('ul');details.append(node('summary',{},'Dettaglio sessione'));s.exercises.forEach(e=>list.append(node('li',{},exerciseText(e))));details.append(list);card.append(details)}if(s.note)card.append(node('p',{},s.note));$('history-list').append(card)}$('report').value=report();
}
function uid(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`}
function validInputs(){const bad=[...document.querySelectorAll('#exercises input')].find(i=>!i.checkValidity());if(bad){bad.reportValidity();return false}return true}
function replaceDraft(id,week){if(!confirm('La bozza corrente verrà sostituita. Lo storico resta. Continuare?')){render();return}const previous=clone(state);if(week)state.week=week;state.draft=makeDraft(id);if(!persist())state=previous;render()}
for(const b of document.querySelectorAll('nav button'))b.onclick=()=>show(b.dataset.page);
$('session-note').oninput=()=>{state.draft.note=$('session-note').value;persist()};
$('workout-select').onchange=()=>replaceDraft($('workout-select').value);
$('week-select').onchange=()=>replaceDraft(state.draft.workoutId,Number($('week-select').value));
$('finish').onclick=()=>{if(!validInputs())return;const p=progress(state.draft);if(!p.done)return toast('Spunta almeno una serie / blocco oppure registra una sessione saltata.');if(!confirm(`Salvare sessione ${p.label.toLowerCase()}: ${p.done}/${p.total} serie / blocchi?`))return;const previous=clone(state);state.sessions.unshift({...clone(state.draft),id:uid(),date:new Date().toISOString(),status:'done'});state.draft=makeDraft(state.draft.workoutId);if(!persist()){state=previous;return}render();show('history');toast('Allenamento salvato.')};
$('skip-toggle').onclick=()=>{$('skip-form').hidden=!$('skip-form').hidden};
$('skip-form').onsubmit=ev=>{ev.preventDefault();if(!confirm('Registrare la sessione saltata e chiudere la bozza corrente?'))return;const previous=clone(state),d=state.draft;state.sessions.unshift({id:uid(),date:new Date().toISOString(),status:'skipped',week:d.week||state.week,workoutId:d.workoutId,name:d.name,muscles:[...new Set(d.exercises.flatMap(e=>e.muscles))],reason:$('skip-reason').value,note:$('skip-note').value});state.draft=makeDraft(d.workoutId);if(!persist()){state=previous;return}$('skip-form').reset();$('skip-form').hidden=true;render();show('history');toast('Pausa registrata.')};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(report());toast('Report copiato. Incollalo nella tua chat.')}catch(e){$('report').focus();$('report').select();toast('Seleziona e copia il testo del report.')}};
function download(name,data,raw=false){const url=URL.createObjectURL(new Blob([raw?data:JSON.stringify(data,null,2)],{type:'application/json'}));const a=node('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
$('backup').onclick=()=>unreadableRaw!==null?download('train-os-originale-da-recuperare.json',unreadableRaw,true):download(`train-os-backup-${new Date().toISOString().slice(0,10)}.json`,state);
function activateProgram(p){checkProgram(p);if(!confirm(`Caricare “${p.name}”? La bozza verrà sostituita, lo storico resta. Se necessario scarica prima un backup.`))return;const previous=clone(state);state.program=clone(p);state.week=1;state.draft=makeDraft();if(!persist()){state=previous;return}render();toast('Programma caricato. Seleziona la seduta e imposta i carichi.')}
$('load-program').onclick=()=>activateProgram(TARGET_PROGRAM);$('load-program-top').onclick=()=>activateProgram(TARGET_PROGRAM);
async function readFile(input){const f=input.files[0];if(!f)return null;if(f.size>10000000)throw Error('File troppo grande: massimo 10 MB.');return JSON.parse(await f.text())}
$('restore').onchange=async()=>{try{const b=await readFile($('restore'));if(!b)return;checkBackup(b);if(!confirm(`Ripristinare ${b.sessions.length} sessioni? I dati correnti saranno sostituiti. Scarica prima un backup se vuoi conservarli.`))return;const previous=state,previousRaw=unreadableRaw;unreadableRaw=null;state=b;state.week=state.week||1;if(!state.draft)state.draft=makeDraft();if(!persist()){state=previous;unreadableRaw=previousRaw;return}render();toast('Backup ripristinato.')}catch(e){toast('Importazione annullata: '+e.message)}finally{$('restore').value=''}};
$('import-program').onchange=async()=>{try{const p=await readFile($('import-program'));if(p)activateProgram(p)}catch(e){toast('Importazione annullata: '+e.message)}finally{$('import-program').value=''}};
render();if(storageOK)persist();else $('save-status').textContent='DATI NON DISPONIBILI';
