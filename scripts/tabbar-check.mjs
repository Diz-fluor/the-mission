import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 for(const width of [320,393,480]){
  await page.setViewportSize({width,height:852});
  for(const id of ['464:2016','563:4968','503:2497','504:2892','678:14745']){
   await page.goto('http://127.0.0.1:5173/?screen='+encodeURIComponent(id));await page.waitForSelector('[data-loaded=true]');
   const item=page.locator('[data-name*="Таббар"]>[data-name="Сделки"]');
   const icon=await item.locator('[data-name*="briefcase"]').boundingBox();
   const badge=item.locator('[data-name="THE MISSION/Indicator/Unread"]');if(!await badge.count())continue;
   const dot=await badge.boundingBox();
   assert.ok(Math.abs(dot.x+dot.width/2-(icon.x+icon.width))<=2,`unread dot should track icon right edge: ${width}, ${id}`);
   assert.ok(Math.abs(dot.y+dot.height/2-icon.y)<=2,'unread dot should track icon top edge');
  }
 }
 console.log('Tabbar unread dot aligned on five screens at 320, 393, 480');
}finally{await browser.close();}
