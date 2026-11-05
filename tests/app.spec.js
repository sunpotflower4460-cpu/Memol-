import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => { await page.clock.setFixedTime(new Date('2026-11-06T03:00:00Z')); });
for(const size of [{width:390,height:844},{width:1440,height:1000},{width:320,height:740}]){
 test(`responsive layout and search ${size.width}`,async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);await page.goto('/');await expect(page.locator('h1')).toContainText('次のチャンス');await expect(page.locator('.opportunity')).toHaveCount(82);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('searchbox').fill('SMA');await expect(page.locator('.opportunity')).toHaveCount(1);await page.getByRole('searchbox').fill('見つからない検索');await expect(page.locator('.empty')).toBeVisible();await page.getByRole('button',{name:'検索条件をリセット'}).click();await expect(page.locator('.opportunity')).toHaveCount(82);expect(errors).toEqual([]);});
}
test('save, notes, apply, reload and remove',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await page.locator('.bookmark').first().click();await page.locator('.bottom-nav [data-view=saved]').click();await expect(page.locator('.opportunity')).toHaveCount(1);await page.locator('.card-title').click();await expect(page.getByRole('dialog')).toBeVisible();await page.locator('#note').fill('応募用の作品を準備する');await page.locator('#applied').check();await page.getByRole('button',{name:'閉じる',exact:true}).click();await page.reload();await page.locator('.bottom-nav [data-view=applied]').click();await expect(page.locator('.opportunity')).toHaveCount(1);await page.locator('.card-title').click();await expect(page.locator('#note')).toHaveValue('応募用の作品を準備する');await expect(page.locator('#applied')).toBeChecked();await page.keyboard.press('Escape');await page.locator('.bottom-nav [data-view=saved]').click();await page.locator('.bookmark').click();await expect(page.locator('.empty')).toBeVisible();});
test('category filters, sorting and closed entries',async({page})=>{await page.goto('/');await page.locator('[data-category="AIクリエイター"]').click();await expect(page.locator('.opportunity')).toHaveCount(6);await page.locator('#include-closed').check();await expect(page.locator('.opportunity')).toHaveCount(9);await page.locator('#sort').selectOption('name');await page.locator('[data-category=""]').click();await expect(page.locator('.opportunity')).toHaveCount(94);});
test('install instructions and accessible modal',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'ホーム画面に追加',exact:true}).first().click();await expect(page.locator('#install-dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#install-dialog')).not.toBeVisible();});
test('offline reload keeps all functions',async({browser})=>{const context=await browser.newContext();const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-11-06T03:00:00Z'));await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;await new Promise(resolve=>{if(navigator.serviceWorker.controller)resolve();else navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});});});await context.setOffline(true);await page.reload();await expect(page.locator('.opportunity')).toHaveCount(82);await expect(page.locator('#connection')).toBeVisible();await page.getByRole('searchbox').fill('SMA');await expect(page.locator('.opportunity')).toHaveCount(1);await context.close();});
test('invalid storage and invalid backup do not break app',async({page})=>{await page.addInitScript(()=>localStorage.setItem('memol-v1','broken'));await page.goto('/');await expect(page.locator('h1')).toBeVisible();await page.locator('#restore').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.locator('#toast')).toContainText('バックアップファイル');});
test('collection views clear previous search and show the collection immediately',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.locator('.bookmark').first().click();await expect(page.locator('.bookmark').first()).toBeFocused();
 await page.getByRole('searchbox').fill('SMA');await expect(page.locator('#active-filters')).toBeVisible();
 await page.locator('.bottom-nav [data-view=saved]').click();
 await expect(page.locator('h1')).toHaveText('気になることを、大切に。');
 await expect(page.locator('.hero')).toBeHidden();await expect(page.locator('.stats')).toBeHidden();
 await expect(page.getByRole('searchbox')).toHaveValue('');await expect(page.locator('.opportunity')).toHaveCount(1);
 await expect(page.locator('.archive-note')).toBeVisible();
});
test('clear active filters without leaving the current view',async({page})=>{
 await page.goto('/');await page.locator('.side-nav [data-view=upcoming]').click();
 await page.locator('[data-category="AIクリエイター"]').click();
 await expect(page.locator('.opportunity')).toHaveCount(1);
 await page.locator('#clear-filters').click();await expect(page.locator('.opportunity')).toHaveCount(10);
 await expect(page.locator('#current-view')).toHaveText('締切が近い');await expect(page.locator('#search')).toBeFocused();
});
