// Teste de interface do circuito. Mesma configuração de browser-tests.cjs.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://localhost:4173/**',async route=>{const p=new URL(route.request().url()).pathname,file=path.join(root,p==='/'?'index.html':p);await route.fulfill({body:fs.readFileSync(file),contentType:({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png'})[path.extname(file)]||'text/plain'});});
 await page.goto('http://localhost:4173');await page.waitForSelector('[data-action=next]');
 // Simula estado persistido da versão anterior, com histórico, medidas e rascunho.
 await page.evaluate(async()=>{const m=await import('./data.js'),db=await m.openDB(),d=m.fresh();d.version=2;delete d.circuitDraft;d.profile.goal=84;d.plans[0].ex[0].load=37.5;d.sessions=[{id:'old',date:new Date().toISOString(),plan:0,minutes:35,sets:{'0-0':true},loads:{0:'30'}}];d.measures=[{date:new Date().toISOString(),weight:77,waist:84}];d.drafts={0:{elapsed:1000,started:null,paused:true,sets:{'0-0':true},loads:{0:'30'}}};await m.writeDB(db,d);});
 await page.reload();await page.waitForSelector('[data-action=next]');
 const read=()=>page.evaluate(async()=>{const m=await import('./data.js');return m.readDB(await m.openDB());});
 let state=await read();assert.equal(state.version,3);assert.equal(state.profile.goal,84);assert.equal(state.plans[0].ex[0].load,37.5);assert.equal(state.measures[0].weight,77);assert.equal(state.drafts[0].elapsed,1000);
 await page.click('[data-mode=outside]');await page.waitForSelector('#circuit-preset');assert.equal(await page.locator('#circuit-preset').inputValue(),'classic');
 await page.click('[data-circuit=start]');await page.click('[data-circuit=rep]');await page.click('[data-circuit=movement]');await page.click('[data-circuit=movement]');await page.click('[data-circuit=movement]');await page.click('[data-circuit=rep]');await page.click('[data-circuit=undo]');
 await page.click('[data-circuit=pause]');await page.waitForFunction(()=>document.querySelector('#circuit-status').textContent==='PAUSADO');await page.reload();await page.click('[data-mode=outside]');assert.equal(await page.locator('[data-circuit=rep]').isDisabled(),true);
 state=await read();assert.equal(state.circuitDraft.events.reduce((n,e)=>n+e.count,0),30);assert.equal(state.circuitDraft.pauseCount,1);assert.equal(state.drafts[0].elapsed,1000);
 await page.click('[data-circuit=start]');await page.click('[data-circuit=rep]');page.once('dialog',d=>d.accept());await page.click('[data-circuit=finish]');await page.waitForSelector('.timer');assert.match(await page.locator('#app').innerText(),/1 \+ 1/);assert.match(await page.locator('#app').innerText(),/com pausas no relógio/);
 state=await read();assert.equal(state.sessions.length,2);assert.equal(state.sessions[0].id,'old');assert.equal(state.circuitDraft,null);
 await page.click('[data-page=train]');await page.click('[data-mode=outside]');await page.selectOption('#circuit-preset','floor');assert.match(await page.locator('#app').innerText(),/não é o Cindy clássico/);
 await page.click('[data-circuit=start]');await page.click('[data-circuit=rep]');page.once('dialog',d=>d.accept());await page.click('[data-circuit=finish]');await page.waitForFunction(()=>document.querySelector('#app').innerText.includes('Circuito sem barra'));
 // Expiração real do cronômetro usando um rascunho perto do limite.
 await page.evaluate(async()=>{const m=await import('./data.js'),c=await import('./circuit.js'),db=await m.openDB(),d=await m.readDB(db);d.circuitDraft=c.newCircuit('classic',Date.now()-1200000+1000);await m.writeDB(db,d);});
 await page.reload();await page.click('[data-mode=outside]');await page.waitForFunction(()=>document.querySelector('#circuit-status').textContent==='TEMPO ENCERRADO');assert.equal(await page.locator('#circuit-clock').textContent(),'00:00');assert.equal(await page.locator('[data-circuit=rep]').isDisabled(),true);
 page.once('dialog',d=>d.accept());await page.click('[data-circuit=finish]');await page.waitForSelector('.timer');state=await read();assert.equal(state.sessions.at(-1).durationMs,1200000);assert.equal(state.sessions.at(-1).preset,'classic');
 await page.click('[data-page=profile]');const promise=page.waitForEvent('download');await page.click('[data-action=export]');const download=await promise,backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.version,3);assert.equal(backup.sessions.length,4);
 page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'v3.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('importado'));assert.equal((await read()).sessions.length,4);
 await page.click('[data-page=train]');await page.click('[data-mode=outside]');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.setViewportSize({width:1280,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('OK: atualização v2 preservada, abas, Cindy 1+1, desfazer, pausa/recarga/retomada, histórico, sem barra, expiração em 20 min, backup v3 sem duplicação, academia preservada e layouts mobile/desktop.');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
