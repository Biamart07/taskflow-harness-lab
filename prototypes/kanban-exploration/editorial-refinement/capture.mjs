import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const directory=fileURLToPath(new URL('.',import.meta.url));
const output=path.join(directory,'screenshots');
await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1312,height:1800}});
const report={fixtureChecks:0,layoutChecks:0,keyboardChecks:0,stateChecks:0,scenarioChecks:0,galleryChecks:0,contrast:[],fonts:[],errors:[]};
page.on('pageerror',error=>report.errors.push(error.message));
let frame;
async function configure(layout,theme,scenario='Quadro completo',view='Dashboard') {
 await frame.evaluate(({layout,theme,scenario,view})=>{
  document.querySelectorAll('[data-variant]').forEach(section=>section.hidden=section.querySelector('.ed-window').dataset.layout!==layout);
  window.editorialPrototype.configure({theme,scenario,view});
 },{layout,theme,scenario,view});
 await frame.evaluate(()=>document.fonts.ready);
 return frame.locator(`.ed-window[data-layout="${layout}"]`);
}
try {
 await page.goto(pathToFileURL(path.join(directory,'index.html')).href);
 await page.frameLocator('iframe').locator('.ed-card').first().waitFor();
 frame=page.frames().find(candidate=>candidate.parentFrame());
 const fixture=await frame.evaluate(()=>window.editorialPrototype.tasks);
 for(const layout of ['stacked','tabs']) for(const theme of ['Claro','Escuro']) {
  const suffix=theme==='Claro'?'light':'dark';
  for(const width of [1280,1024,768,390,320]) {
   await page.setViewportSize({width:width+32,height:1800});
   const win=await configure(layout,theme);
   assert.deepEqual(await win.locator('.ed-dashboard .ed-card').evaluateAll(cards=>cards.map(card=>card.dataset.task)),fixture.map(task=>task.id));
   assert.deepEqual(await win.locator('.ed-dashboard .ed-title').allTextContents(),fixture.map(task=>task.title));
   report.fixtureChecks++;
   const layoutResult=await win.evaluate(root=>{
    const bounds=root.getBoundingClientRect();
    const outside=[...root.querySelectorAll('*')].filter(element=>{
     const rect=element.getBoundingClientRect();return rect.width>0&&(rect.left<bounds.left-1||rect.right>bounds.right+1);
    });return {overflow:root.scrollWidth>root.clientWidth,outside:outside.length,width:bounds.width};
   });
   assert.equal(layoutResult.overflow,false,`${layout}/${theme}/${width} overflow`);
   assert.equal(layoutResult.outside,0,`${layout}/${theme}/${width} bounds`);
   report.layoutChecks++;
   if(width===1280||width===390)await win.screenshot({path:path.join(output,`${layout}-${suffix}-${width===1280?'desktop':'mobile'}.png`)});
  }
  await page.setViewportSize({width:1312,height:1800});
  const win=await configure(layout,theme);
  const card=win.locator('.ed-dashboard .ed-card').first(),button=card.locator('button');
  const border=await card.evaluate(element=>getComputedStyle(element).borderColor);
  await button.hover();assert.notEqual(await card.evaluate(element=>getComputedStyle(element).borderColor),border);report.stateChecks++;
  await page.mouse.move(1,1);
  await win.locator('.ed-primary').focus();await page.keyboard.press('Tab');
  assert.equal(await win.locator('input[type="search"]').evaluate(element=>element===document.activeElement),true);report.keyboardChecks++;
  await button.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await button.evaluate(element=>element.matches(':focus-visible')),true);
  assert.equal(await button.evaluate(element=>getComputedStyle(element).outlineWidth),'3px');report.keyboardChecks++;
  const box=await card.boundingBox();
  await page.screenshot({path:path.join(output,`${layout}-${suffix}-keyboard-focus.png`),clip:{x:box.x-8,y:box.y-8,width:box.width+16,height:box.height+16}});
  await page.keyboard.press('Space');assert.equal(await button.getAttribute('aria-pressed'),'true');report.stateChecks++;
  await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'false');report.stateChecks++;
  assert.deepEqual(await frame.evaluate(()=>window.editorialPrototype.tasks),fixture);
  report.contrast.push(...await win.evaluate(root=>{
   const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
   const lum=value=>{const c=rgb(value).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
   const ratio=(a,b)=>{const values=[lum(a),lum(b)].sort((a,b)=>b-a);return(values[0]+.05)/(values[1]+.05);};
   const css=element=>getComputedStyle(element);
   const bg=css(root).backgroundColor,surface=css(root.querySelector('.ed-card')).backgroundColor;
   const pairs=[['text',css(root).color,bg,4.5],['muted',css(root.querySelector('.ed-subtitle')).color,bg,4.5],['title',css(root.querySelector('.ed-title')).color,surface,4.5],['description',css(root.querySelector('.ed-description')).color,surface,4.5],['control',css(root.querySelector('input')).borderColor,surface,3],['focus on surface',css(root.querySelector('.ed-primary')).backgroundColor,surface,3],['focus on canvas',css(root.querySelector('.ed-primary')).backgroundColor,bg,3]];
   for(const element of root.querySelectorAll('.ed-dashboard .ed-priority,.ed-primary'))pairs.push([element.dataset.priority||'primary',css(element).color,css(element).backgroundColor,4.5]);
   for(const element of root.querySelectorAll('.ed-indicator'))pairs.push(['status symbol',css(element).color,bg,3]);
   return pairs.map(([name,foreground,background,minimum])=>({name,foreground,background,minimum,ratio:ratio(foreground,background)}));
  }).then(items=>items.map(item=>({layout,theme,...item}))));
  await configure(layout,theme,'Quadro completo','Estados dos componentes');
  const invalid=win.locator('.ed-showcase input');assert.equal(await invalid.getAttribute('aria-invalid'),'true');
  assert.ok(await invalid.getAttribute('aria-describedby'));assert.equal(await win.locator('.ed-showcase button:disabled').count(),1);report.stateChecks+=2;
  const stateBox=await win.locator('.ed-showcase').boundingBox();
  await page.screenshot({path:path.join(output,`${layout}-${suffix}-states.png`),clip:{x:stateBox.x-8,y:stateBox.y-8,width:stateBox.width+16,height:stateBox.height+16}});
  report.contrast.push(...await win.evaluate(root=>{
   const lum=value=>{const c=value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
   const ratio=(a,b)=>{const values=[lum(a),lum(b)].sort((a,b)=>b-a);return(values[0]+.05)/(values[1]+.05);};
   const bg=getComputedStyle(root).backgroundColor;
   const selected=root.querySelector('[data-state="selected"]'),selectedBg=getComputedStyle(selected).backgroundColor;
   const error=root.querySelector('.ed-error-text'),input=root.querySelector('.ed-invalid'),disabled=root.querySelector('button:disabled');
   return [
    ['selected title',getComputedStyle(selected.querySelector('.ed-title')).color,selectedBg,4.5],
    ['selected description',getComputedStyle(selected.querySelector('.ed-description')).color,selectedBg,4.5],
    ['selected marker',getComputedStyle(selected.querySelector('.ed-selected')).color,selectedBg,4.5],
    ['error text',getComputedStyle(error).color,bg,4.5],
    ['error border',getComputedStyle(input).borderColor,getComputedStyle(input).backgroundColor,3],
    ['disabled label (project target)',getComputedStyle(disabled).color,getComputedStyle(disabled).backgroundColor,4.5]
   ].map(([name,foreground,background,minimum])=>({name,foreground,background,minimum,ratio:ratio(foreground,background)}));
  }).then(items=>items.map(item=>({layout,theme,...item}))));
  await page.setViewportSize({width:352,height:1800});
  assert.equal(await win.evaluate(root=>root.scrollWidth>root.clientWidth),false);report.layoutChecks++;
  await page.setViewportSize({width:1312,height:1800});
  for(const scenario of ['Coluna vazia','Quadro vazio','Sem resultados','Carregamento','Erro']) {
   await configure(layout,theme,scenario);
   const count=await win.locator('.ed-dashboard .ed-card').count();assert.equal(count,scenario==='Coluna vazia'?5:0);
   if(scenario==='Erro')assert.equal(await win.locator('[role="alert"]').count(),1);
   if(scenario==='Carregamento')assert.equal(await win.locator('[role="status"]').count(),3);
   report.scenarioChecks++;
   if(layout==='tabs'&&scenario==='Coluna vazia') {
    await page.setViewportSize({width:422,height:1800});
    const tabs=win.locator('[role="tab"]');await tabs.first().focus();await page.keyboard.press('End');
    assert.equal(await tabs.nth(2).getAttribute('aria-selected'),'true');
    await page.keyboard.press('Tab');assert.equal(await win.locator('#tabs-panel-2').evaluate(element=>element===document.activeElement),true);
    await win.screenshot({path:path.join(output,`tabs-${suffix}-empty-mobile.png`)});
    await page.setViewportSize({width:1312,height:1800});report.keyboardChecks+=2;
   }
  }
  if(layout==='tabs') {
   await page.setViewportSize({width:422,height:1800});await configure(layout,theme);
   const tabs=win.locator('[role="tab"]');await tabs.first().click();
   for(const [key,index] of [['ArrowRight',1],['ArrowRight',2],['ArrowRight',0],['ArrowLeft',2],['Home',0],['End',2]]) {
    await page.keyboard.press(key);assert.equal(await tabs.nth(index).getAttribute('aria-selected'),'true');
    assert.equal(await tabs.nth(index).evaluate(element=>element===document.activeElement),true);
    assert.equal(await win.locator('.ed-column:visible').count(),1);report.keyboardChecks++;
   }
   await tabs.first().click();await page.keyboard.press('Tab');
   assert.equal(await win.locator('.ed-column[data-column="0"] .ed-card-button').first().evaluate(element=>element===document.activeElement),true);report.keyboardChecks++;
  }
 }
 assert.ok(report.contrast.every(item=>item.ratio>=item.minimum),'Contrast failed');
 report.fonts=await frame.evaluate(()=>({family:getComputedStyle(document.querySelector('.ed-window')).fontFamily,dmSansLoaded:[...document.fonts].some(font=>font.family==='DM Sans'&&font.status==='loaded')}));
 assert.equal(report.errors.length,0);
 await page.goto(pathToFileURL(path.join(directory,'gallery.html')).href);
 await page.setViewportSize({width:1280,height:1800});
 for(const theme of ['light','dark'])for(const view of ['mobile','desktop','states','keyboard-focus']) {
  await page.selectOption('#theme',theme);await page.selectOption('#view',view);
  await page.locator('#sheet img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  assert.equal(await page.locator('#sheet img').count(),2);report.galleryChecks++;
  if(view==='mobile'||view==='states')await page.locator('#sheet').screenshot({path:path.join(output,`comparison-${view}-${theme}.png`)});
 }
 await page.goto(pathToFileURL(path.join(directory,'index.html')).href);
 frame=page.frames().find(candidate=>candidate.parentFrame());
 await frame.locator('#editorial-theme').selectOption('Escuro');
 assert.equal(await frame.evaluate(()=>window.editorialPrototype.snapshot().theme),'Escuro');
 await frame.getByRole('button',{name:'Próxima',exact:true}).click();
 assert.equal(await frame.locator('.ed-window[data-layout="tabs"]').isVisible(),true);report.galleryChecks+=2;
 assert.equal(report.errors.length,0);
 await writeFile(path.join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({fixtureChecks:report.fixtureChecks,layoutChecks:report.layoutChecks,keyboardChecks:report.keyboardChecks,stateChecks:report.stateChecks,scenarioChecks:report.scenarioChecks,galleryChecks:report.galleryChecks,contrastPairs:report.contrast.length,minimumTextContrast:Math.min(...report.contrast.filter(x=>x.minimum===4.5).map(x=>x.ratio)),minimumNonTextContrast:Math.min(...report.contrast.filter(x=>x.minimum===3).map(x=>x.ratio)),fonts:report.fonts,errors:report.errors}));
} finally {await browser.close();}
