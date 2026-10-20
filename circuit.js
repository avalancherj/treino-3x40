// Estado do circuito independente dos rascunhos A/B/C.
export const CIRCUITS = {
  classic: {name:'Cindy clássico',minutes:20,equipment:'Barra fixa firme',
    note:'5 barras, 10 flexões e 15 agachamentos, repetidos por 20 minutos. Descanse quando necessário; no protocolo contínuo o relógio segue durante o descanso.',
    exercises:[{name:'Barra fixa',reps:5,primary:['Costas'],secondary:['Bíceps'],tip:'Use uma barra instalada para suportar seu peso. Faça o movimento com controle.'},{name:'Flexão de braço',reps:10,primary:['Peitoral'],secondary:['Tríceps','Ombros','Abdômen'],tip:'Mantenha o tronco alinhado e a amplitude que consegue controlar.'},{name:'Agachamento livre',reps:15,primary:['Quadríceps','Glúteos'],secondary:['Abdômen'],tip:'Mantenha os pés apoiados e agache em amplitude confortável.'}]},
  scaled: {name:'Cindy adaptado',minutes:12,equipment:'Argolas ou barra de remada instalada para suportar seu peso',
    note:'Adaptação: 3 remadas, 6 flexões assistidas e 9 agachamentos em 12 minutos. Não compare diretamente com o clássico.',
    exercises:[{name:'Remada em argolas',reps:3,primary:['Costas'],secondary:['Bíceps'],tip:'Use equipamento próprio e fixado com segurança; ajuste a inclinação à sua capacidade.'},{name:'Flexão com joelhos apoiados',reps:6,primary:['Peitoral'],secondary:['Tríceps','Ombros'],tip:'Apoie os joelhos e controle a descida.'},{name:'Agachamento livre',reps:9,primary:['Quadríceps','Glúteos'],secondary:['Abdômen'],tip:'Priorize controle e amplitude confortável.'}]},
  floor: {name:'Circuito sem barra',minutes:20,equipment:'Espaço livre e parede; colchonete opcional',
    note:'Circuito inspirado no formato 5–10–15. O movimento de braços no chão não equivale à barra fixa e esta modalidade não é o Cindy clássico.',
    exercises:[{name:'Anjo reverso no chão',reps:5,primary:['Costas'],secondary:['Ombros'],tip:'De bruços, mova os braços em arco com controle, sem forçar a lombar. Não substitui a sobrecarga de uma puxada.'},{name:'Flexão na parede',reps:10,primary:['Peitoral'],secondary:['Tríceps','Ombros'],tip:'Apoie as mãos em parede firme e ajuste a distância dos pés.'},{name:'Agachamento livre',reps:15,primary:['Quadríceps','Glúteos'],secondary:['Abdômen'],tip:'Mantenha os pés apoiados e amplitude confortável.'}]}
};

export function newCircuit(key,now=Date.now()) {
  const p=CIRCUITS[key];if(!p)throw Error('Circuito desconhecido.');
  return {kind:'circuit',preset:key,name:p.name,limitMs:p.minutes*60000,
    date:new Date(now).toISOString(),started:now,elapsed:0,paused:false,pauseCount:0,
    expired:false,events:[],movements:JSON.parse(JSON.stringify(p.exercises))};
}
export function circuitElapsed(d,now=Date.now()) {
  return Math.min(d.limitMs,(d.elapsed||0)+(!d.paused&&d.started!==null?Math.max(0,now-d.started):0));
}
export function circuitScore(d) {
  const total=d.events.reduce((n,e)=>n+e.count,0),size=d.movements.reduce((n,e)=>n+e.reps,0);
  const rounds=Math.floor(total/size),partial=total%size;
  let offset=partial,index=0;
  while(offset>=d.movements[index].reps){offset-=d.movements[index].reps;index++;}
  const totals=d.movements.map((e,i)=>rounds*e.reps+Math.min(e.reps,Math.max(0,partial-d.movements.slice(0,i).reduce((n,m)=>n+m.reps,0))));
  return {total,rounds,partial,index,current:offset,remaining:d.movements[index].reps-offset,totals};
}
export function addCircuitReps(d,count,now=Date.now()) {
  if(d.paused||circuitElapsed(d,now)>=d.limitMs)throw Error('Retome o circuito ou finalize se o tempo acabou.');
  if(!Number.isInteger(count)||count<1||count>circuitScore(d).remaining)throw Error('Quantidade inválida para este movimento.');
  d.events.push({count,at:new Date(now).toISOString(),elapsedMs:circuitElapsed(d,now)});
}
export function validateCircuit(d,finished=false) {
  const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
  if(!d||!Object.hasOwn(CIRCUITS,d.preset)||d.kind!=='circuit'||d.name!==CIRCUITS[d.preset].name||d.limitMs!==CIRCUITS[d.preset].minutes*60000||!Number.isFinite(Date.parse(d.date)))throw Error('Circuito inválido.');
  if(!number(d.elapsed,0,d.limitMs)||typeof d.paused!=='boolean'||!Number.isInteger(d.pauseCount)||d.pauseCount<0||typeof d.expired!=='boolean'||(d.started!==null&&!number(d.started,0,1e15)))throw Error('Cronômetro de circuito inválido.');
  const expected=CIRCUITS[d.preset].exercises;
  if(!Array.isArray(d.movements)||d.movements.length!==3||d.movements.some((m,i)=>m.name!==expected[i].name||m.reps!==expected[i].reps))throw Error('Movimentos de circuito inválidos.');
  // Aceita somente as prescrições conhecidas, evitando dados arbitrários no guia.
  if(JSON.stringify(d.movements)!==JSON.stringify(expected))throw Error('Prescrição do circuito inválida.');
  if(!Array.isArray(d.events)||d.events.length>100000)throw Error('Eventos de circuito inválidos.');
  let total=0,last=0;const size=expected.reduce((n,m)=>n+m.reps,0);
  for(const e of d.events){let offset=total%size,i=0;while(offset>=expected[i].reps){offset-=expected[i++].reps;}
    if(!Number.isInteger(e.count)||e.count<1||e.count>expected[i].reps-offset||!Number.isFinite(Date.parse(e.at))||!number(e.elapsedMs,last,d.limitMs))throw Error('Repetições de circuito inválidas.');total+=e.count;last=e.elapsedMs;}
  if(finished&&(!number(d.durationMs,0,d.limitMs)||d.durationMs<last||!Number.isFinite(Date.parse(d.finishedAt))||d.started!==null||!d.paused))throw Error('Conclusão de circuito inválida.');
  return d;
}

export function circuitView(d,key,{esc,time,anatomy,fmt}) {
  const preset=d?.preset||key,p=CIRCUITS[preset],score=d?circuitScore(d):null;
  const elapsed=d?circuitElapsed(d):0,ended=d&&(d.expired||elapsed>=d.limitMs);
  const canCount=d&&!d.paused&&!ended;
  return `<small>FORA DA ACADEMIA · PESO DO CORPO</small><h2>Cindy & circuitos.</h2>
    <div class="card"><label for="circuit-preset">Modalidade</label><select id="circuit-preset" ${d?'disabled':''}>${Object.entries(CIRCUITS).map(([k,v])=>`<option value="${k}" ${preset===k?'selected':''}>${v.name} · ${v.minutes} min</option>`).join('')}</select><p>${p.note}</p><p class="note">Equipamento: ${p.equipment}. Faça um aquecimento antes. Você pode descansar; não há obrigação de completar sem pausas. Este circuito pode substituir uma sessão planejada conforme sua recuperação.</p><a href="https://www.crossfit.com/cindy" target="_blank" rel="noopener">Referência do Cindy e adaptações</a></div>
    <div class="card hero"><div class="row"><div><small>TEMPO RESTANTE</small><div class="timer" id="circuit-clock">${time((d?d.limitMs:p.minutes*60000)-elapsed)}</div></div><span class="badge" id="circuit-status">${ended?'TEMPO ENCERRADO':d?(d.paused?'PAUSADO':'EM ANDAMENTO'):'PRONTO PARA COMEÇAR'}</span></div>
    <p class="note">O tempo é salvo após recarga. Pausar o relógio marca o resultado como “com pausas”; para o protocolo contínuo, descanse com o relógio correndo.</p>
    <div class="row actions"><button data-circuit="start" ${d&&!d.paused||ended?'disabled':''}>${d?'Retomar':'Iniciar circuito'}</button><button class="secondary" data-circuit="pause" ${!d||d.paused||ended?'disabled':''}>Pausar relógio</button><button class="secondary" data-circuit="finish" ${!d?'disabled':''}>Finalizar e salvar</button></div></div>
    <div class="stats"><div class="stat"><small>RODADAS</small><b>${score?.rounds||0}</b></div><div class="stat"><small>REPS PARCIAIS</small><b>${score?.partial||0}</b></div><div class="stat"><small>REPS TOTAIS</small><b>${score?.total||0}</b></div></div>
    <div class="card"><h3>${d?`Rodada ${score.rounds+1} · ${esc(d.movements[score.index].name)}`:'Conte apenas o que realizou'}</h3>${d?`<p class="timer">${score.current} / ${d.movements[score.index].reps}</p>`:'<p class="muted">Inicie para registrar os movimentos na ordem do circuito.</p>'}
    <div class="row actions"><button data-circuit="rep" ${!canCount?'disabled':''}>+1 repetição</button><button data-circuit="movement" ${!canCount?'disabled':''}>Concluir ${d?score.remaining:'—'} restantes</button><button class="secondary" data-circuit="undo" ${!d?.events.length?'disabled':''}>Desfazer último toque</button></div><p class="note">“Concluir restantes” registra todas as repetições restantes deste movimento. Use +1 para registrar uma parte. Desfazer reverte o último toque, inclusive após o tempo encerrar.</p></div>
    <div class="card"><h3>Uma rodada</h3>${p.exercises.map((e,i)=>`<div class="exercise"><h3>${e.reps} × ${e.name}</h3><p class="note">${e.tip}</p><p class="muted">Total registrado: ${score?score.totals[i]:0} repetições</p><details><summary>Ver músculos trabalhados</summary>${anatomy(e)}</details></div>`).join('')}</div>
    ${d?`<p class="note">Início: ${fmt(d.date)} · ${d.pauseCount} pausa(s) no cronômetro. Registros salvos automaticamente.</p>`:''}`;
}
export function circuitHistory(s,{esc,time,fmt}) {
  const score=circuitScore(s);
  return `<div class="card"><div class="row"><h3>${esc(s.name)}</h3><span class="badge">FORA DA ACADEMIA</span></div><p class="timer">${score.rounds} + ${score.partial}</p><p class="muted">Rodadas completas + repetições parciais · ${score.total} reps totais</p><p>${time(s.durationMs)} de ${time(s.limitMs)} · ${s.durationMs<s.limitMs?'encerrado antes do limite':'tempo concluído'} · ${s.pauseCount?'com pausas no relógio':'relógio contínuo'}</p><p class="note">Início: ${fmt(s.date)} · Fim: ${fmt(s.finishedAt)}</p><details><summary>Movimentos e registro</summary>${s.movements.map((m,i)=>`<p>${esc(m.name)}: ${score.totals[i]} repetições · alvo ${m.reps}/rodada</p>`).join('')}<p class="note">Carga externa: 0 kg (peso do corpo). ${s.pauseCount} pausa(s) no relógio. Compare apenas a mesma modalidade, duração e condições.</p>${s.events.map((e,i)=>`<p class="note">${i+1}. ${fmt(e.at)} · +${e.count} reps · ${time(e.elapsedMs)} ativo</p>`).join('')}</details></div>`;
}
