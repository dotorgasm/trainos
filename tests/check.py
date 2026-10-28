"""Logic smoke tests using the JavaScriptCore runtime bundled with macOS. No dependencies."""
import ctypes, json
from pathlib import Path
j=ctypes.CDLL('/System/Library/Frameworks/JavaScriptCore.framework/JavaScriptCore')
p=ctypes.c_void_p
j.JSGlobalContextCreate.argtypes=[p];j.JSGlobalContextCreate.restype=p
j.JSStringCreateWithUTF8CString.argtypes=[ctypes.c_char_p];j.JSStringCreateWithUTF8CString.restype=p
j.JSEvaluateScript.argtypes=[p,p,p,p,ctypes.c_int,ctypes.POINTER(p)];j.JSEvaluateScript.restype=p
j.JSValueToStringCopy.argtypes=[p,p,ctypes.POINTER(p)];j.JSValueToStringCopy.restype=p
j.JSStringGetMaximumUTF8CStringSize.argtypes=[p];j.JSStringGetMaximumUTF8CStringSize.restype=ctypes.c_size_t
j.JSStringGetUTF8CString.argtypes=[p,p,ctypes.c_size_t]
ctx=j.JSGlobalContextCreate(None)
def run(src):
    err=p(); result=j.JSEvaluateScript(ctx,j.JSStringCreateWithUTF8CString(src.encode()),None,None,1,ctypes.byref(err))
    s=j.JSValueToStringCopy(ctx,err.value or result,None);size=j.JSStringGetMaximumUTF8CStringSize(s);buf=ctypes.create_string_buffer(size);j.JSStringGetUTF8CString(s,buf,size)
    text=buf.value.decode()
    if err.value: raise AssertionError(text)
    return text
run('''
var elements={};function el(){return {value:'',style:{},dataset:{},children:[],classList:{toggle(){}},setAttribute(k,v){this[k]=v},append(...c){this.children.push(...c)},replaceChildren(...c){this.children=c},addEventListener(){},checkValidity(){return true},setCustomValidity(){},reset(){},focus(){},select(){},click(){},remove(){}}}
var document={getElementById(id){return elements[id]||(elements[id]=el())},createElement:el,querySelectorAll(){return []},body:el()};
var localStorage={data:{},getItem(k){return this.data[k]||null},setItem(k,v){this.data[k]=v}};
var window={scrollTo(){}},navigator={},confirm=()=>true,setTimeout=()=>0,clearTimeout=()=>{};
''')
run(Path(__file__).resolve().parents[1].joinpath('app.js').read_text())
print(run('''
const assert=(v,m)=>{if(!v)throw Error(m)};
assert(state.draft.exercises.length===5,'demo');
state.draft.exercises[0].sets[0]={kg:22.5,reps:8,done:true};persist();
assert(JSON.parse(localStorage.data[KEY]).draft.exercises[0].sets[0].kg===22.5,'draft persisted');
$('finish').onclick();assert(state.sessions.length===1,'session saved');
assert(state.draft.exercises[0].sets[0].kg===22.5,'previous load reused');
assert(!state.draft.exercises[0].sets[0].done,'checkbox resets');
assert(report().includes('22.5 kg × 8 [completata]'),'report includes completed set');
$('skip-reason').value='Poco tempo';$('skip-note').value='Test';$('skip-form').onsubmit({preventDefault(){}});
assert(state.sessions[0].reason==='Poco tempo','skip saved');assert(report().includes('SALTATO'),'skip report');
checkBackup(JSON.parse(JSON.stringify(state)));
let rejected=false;try{checkProgram({schemaVersion:2})}catch(e){rejected=true}assert(rejected,'invalid program rejected');
let bad=clone(DEMO);bad.workouts[0].exercises[0].sets[0].reps=-1;rejected=false;try{checkProgram(bad)}catch(e){rejected=true}assert(rejected,'invalid reps rejected');
const previousCount=state.sessions.length;state.draft.exercises[0].sets[0].done=true;localStorage.setItem=()=>{throw Error('quota')};$('finish').onclick();assert(state.sessions.length===previousCount,'failed save rolls back');
'PASS: demo, persistence, completed session, previous values, checkbox reset, skipped session, report, backup validation, invalid JSON data, storage failure rollback.'
'''))
