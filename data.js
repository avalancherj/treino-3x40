import {validateCircuit} from './circuit.js';
export const GROUPS=['Peitoral','Costas','Ombros','Bíceps','Tríceps','Abdômen','Quadríceps','Posterior','Glúteos','Panturrilhas'];
const ex=(name,primary,secondary,reps,alternatives,unit='reps')=>({id:name.toLowerCase().replaceAll(' ','-'),name,primary,secondary,sets:2,reps,load:0,unit,alternatives});
export const DEFAULT_PLANS=[
{name:'A',ex:[ex('Leg press',['Quadríceps'],['Glúteos'],12,['Agachamento no banco']),ex('Supino máquina',['Peitoral'],['Tríceps','Ombros'],12,['Supino com halteres']),ex('Puxada frontal',['Costas'],['Bíceps'],12,['Puxada com elástico']),ex('Mesa flexora',['Posterior'],[],12,['Flexora sentada']),ex('Prancha',['Abdômen'],['Ombros'],30,['Prancha com joelhos apoiados'],'s')]},
{name:'B',ex:[ex('Agachamento no banco',['Quadríceps','Glúteos'],['Abdômen'],12,['Leg press']),ex('Remada sentada',['Costas'],['Bíceps','Ombros'],12,['Remada com halteres']),ex('Desenvolvimento máquina',['Ombros'],['Tríceps'],12,['Desenvolvimento com halteres']),ex('Ponte de glúteos',['Glúteos'],['Posterior'],12,['Elevação pélvica']),ex('Abdominal curto',['Abdômen'],[],15,['Dead bug'])]},
{name:'C',ex:[ex('Leg press',['Quadríceps'],['Glúteos'],12,['Agachamento no banco']),ex('Supino máquina',['Peitoral'],['Tríceps','Ombros'],12,['Supino com halteres']),ex('Remada sentada',['Costas'],['Bíceps'],12,['Remada com halteres']),ex('Mesa flexora',['Posterior'],[],12,['Flexora sentada']),ex('Rosca bíceps ou tríceps polia',['Bíceps','Tríceps'],[],12,['Rosca com halteres','Tríceps com elástico'])]}];
export const clone=x=>JSON.parse(JSON.stringify(x));
export const fresh=()=>({version:3,circuitDraft:null,sessions:[],measures:[],profile:{height:172,goal:83,initialWeight:76},drafts:{},plans:clone(DEFAULT_PLANS),schedule:[],migration:null});
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
export function validate(o){
 if(!o||typeof o!=='object'||!Array.isArray(o.sessions)||!Array.isArray(o.measures)||!o.profile)throw Error('Estrutura de backup inválida.');
 if(o.version!==undefined&&![2,3].includes(o.version))throw Error('Versão não suportada.');
 if(!finite(o.profile.height,100,250)||!finite(o.profile.goal,20,400))throw Error('Perfil inválido.');
 if(o.sessions.length>100000||o.measures.length>100000)throw Error('Backup excede o limite.');
 for(const s of o.sessions){if(s.kind==='circuit'){validateCircuit(s,true);if(!finite(s.minutes,0,100000))throw Error('Duração inválida.');continue;}if(!date(s.date)||!Number.isInteger(s.plan)||s.plan<0||s.plan>2||!finite(s.minutes,0,100000))throw Error('Sessão inválida.');if(s.exercises){if(!Array.isArray(s.exercises))throw Error('Exercícios inválidos.');for(const e of s.exercises){if(typeof e.name!=='string'||!Array.isArray(e.results))throw Error('Exercício inválido.');for(const r of e.results)if(typeof r.done!=='boolean'||!finite(r.reps,0,10000)||!finite(r.load,0,2000))throw Error('Série inválida.');}}}
 for(const m of o.measures)if(!date(m.date)||(m.weight!=null&&!finite(m.weight,20,400))||(m.waist!=null&&!finite(m.waist,30,250)))throw Error('Medida inválida.');
 const result={...fresh(),...clone(o),version:3};
 if(!Array.isArray(result.plans)||result.plans.length!==3)throw Error('Planos inválidos.');
 for(const p of result.plans){if(typeof p.name!=='string'||!Array.isArray(p.ex)||!p.ex.length||p.ex.length>30)throw Error('Plano inválido.');for(const e of p.ex)if(typeof e.name!=='string'||e.name.length>150||!finite(e.sets,1,10)||!Number.isInteger(e.sets)||!finite(e.reps,1,1000)||!finite(e.load,0,2000)||!['reps','s'].includes(e.unit)||!Array.isArray(e.primary)||!Array.isArray(e.secondary)||[...e.primary,...e.secondary].some(g=>!GROUPS.includes(g))||!Array.isArray(e.alternatives)||e.alternatives.some(a=>typeof a!=='string'||a.length>150))throw Error('Prescrição inválida.');}
 if(!Array.isArray(result.schedule)||result.schedule.some(s=>!date(s.date)||!Number.isInteger(s.plan)||s.plan<0||s.plan>2||typeof s.id!=='string'))throw Error('Agenda inválida.');
 if(!result.drafts||typeof result.drafts!=='object'||Array.isArray(result.drafts))throw Error('Rascunhos inválidos.');
 for(const [k,d] of Object.entries(result.drafts)){if(!['0','1','2'].includes(k)||!d||typeof d!=='object')throw Error('Rascunho inválido.');if(d.paused!==undefined&&typeof d.paused!=='boolean')throw Error('Pausa inválida.');if(d.exercises){const check=fresh();check.sessions=[{...d,date:d.date||new Date().toISOString(),plan:Number(k),minutes:0}];check.plans[Number(k)].ex=d.exercises;validate(check);}else{if(d.sets&&Object.values(d.sets).some(x=>typeof x!=='boolean'))throw Error('Séries antigas inválidas.');if(d.loads&&Object.values(d.loads).some(x=>!Number.isFinite(Number(x))||Number(x)<0||Number(x)>2000))throw Error('Carga antiga inválida.');}if(d.elapsed!==undefined&&!finite(d.elapsed,0,1e12))throw Error('Duração inválida.');if(d.started!=null&&!finite(d.started,0,1e15))throw Error('Cronômetro inválido.');}
 if(result.rest!=null&&(!finite(result.rest.end,0,1e15)||(result.rest.remaining!=null&&!finite(result.rest.remaining,0,3600000))))throw Error('Descanso inválido.');
 if(result.circuitDraft!=null)validateCircuit(result.circuitDraft);
 return result;
}
export function migrate(o){const d=validate(o);d.migration={key:'treino340_v1',date:new Date().toISOString()};return d;}
export function duration(d,now=Date.now()){return (d.elapsed||0)+(d.started&&!d.paused?Math.max(0,now-d.started):0);}
export function legacyDraft(d,plan){if(d.exercises)return d;return {...d,date:d.date||new Date(d.started||Date.now()).toISOString(),exercises:clone(plan.ex).map((e,i)=>({...e,results:Array.from({length:e.sets},(_,j)=>({done:!!d.sets?.[i+'-'+j],load:Number(d.loads?.[i])||0,reps:0,unknown:true}))}))};}
export async function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('treino340',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function readDB(db){return new Promise((resolve,reject)=>{const t=db.transaction('state');const r=t.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function writeDB(db,data){const snapshot=clone(data);return new Promise((resolve,reject)=>{const t=db.transaction('state','readwrite');t.objectStore('state').put(snapshot,'main');t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||Error('Gravação cancelada'));});}
