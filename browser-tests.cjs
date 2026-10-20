// npm install --no-save playwright (opcional, apenas para testes)
// PLAYWRIGHT_MODULE pode apontar para uma instalação existente do Playwright.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Interceptação local: testa UI e IndexedDB; não testa Service Worker/rede.
 await page.route('http://localhost:4173/**',async route=>{const p=new URL(route.request().url()).pathname;const file=path.join(root,p==='/'?'index.html':p);const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png'};await route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'text/plain'});});
 const legacy={sessions:[],measures:[],profile:{height:172,goal:83},drafts:{}};await context.addInitScript(raw=>{if(!localStorage.getItem('treino340_v1'))localStorage.setItem('treino340_v1',raw);},JSON.stringify(legacy));
 await page.goto('http://localhost:4173');await page.waitForSelector('[data-action=next]');
 const migrated=await page.evaluate(async()=>{const m=await import('./data.js');return m.readDB(await m.openDB());});assert.equal(migrated.migration.key,'treino340_v1');assert.equal(await page.evaluate(()=>localStorage.getItem('treino340_v1')),JSON.stringify(legacy));
 await page.click('[data-page=train]');await page.click('[data-action=start]');
 await page.locator('[data-result=reps]').first().fill('11');await page.locator('[data-result=load]').first().fill('22.5');
 await page.click('[data-action=set]');await page.click('[data-action=pause]');await page.reload();await page.click('[data-page=train]');
 assert.equal(await page.locator('[data-result=reps]').first().inputValue(),'11');assert.equal(await page.locator('[data-result=load]').first().inputValue(),'22.5');
 page.once('dialog',d=>d.accept());await page.click('[data-action=finish]');await page.waitForSelector('summary');await page.click('summary');assert.match(await page.locator('#app').innerText(),/11 reps · 22.5 kg/);
 await page.click('[data-page=progress]');await page.locator('[name=weight]').fill('76.4');await page.locator('[name=waist]').fill('85');await page.locator('#measure button').click();await page.waitForFunction(()=>document.querySelector('#app').innerText.includes('76.4'));
 await page.click('[data-page=train]');await page.click('[data-action=edit]');await page.locator('[name=name0]').fill('Leg press editado');await page.locator('#editor > .row button').last().click();await page.waitForSelector('[data-action=start]');assert.match(await page.locator('#app').innerText(),/Leg press editado/);
 await page.click('[data-page=home]');await page.locator('#schedule button').click();await page.waitForSelector('[data-action=reschedule]');const field=page.locator('[id^=date-]').first();await field.fill('2026-11-02T18:30');await page.locator('[data-action=reschedule]').first().click();await page.waitForFunction(()=>document.querySelector('[id^=date-]').value==='2026-11-02T18:30');
 await page.click('[data-page=profile]');const downloadPromise=page.waitForEvent('download');await page.click('[data-action=export]');const download=await downloadPromise;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.sessions.length,1);assert.equal(backup.measures[0].weight,76.4);
 await page.locator('#import').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from('{"sessions":[]}')});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Backup recusado'));
 page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'valido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('importado'));
 const imported=await page.evaluate(async()=>{const m=await import('./data.js');return m.readDB(await m.openDB());});assert.equal(imported.sessions.length,1);assert.equal(imported.measures.length,1);
 await page.click('[data-page=home]');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.setViewportSize({width:1280,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('OK: iniciar, preencher, concluir série, pausar, recarregar, finalizar, histórico, medidas, editar, agendar, reagendar, exportar, recusar backup inválido, importar, sem duplicação e layouts 390/1280.');
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
