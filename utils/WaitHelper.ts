import {Page,Locator} from 'playwright';
import { Logger } from './Logger';

export class WaitHelper {      
    
 static async waitVisible(selector: Locator){
  Logger.info('WaitHelper.waitVisible - waiting for selector to be visible');
  await selector.waitFor({state: 'visible'});
  Logger.info('WaitHelper.waitVisible - selector is visible');
 }


 static async waithidden(page:Page, selector: string) {
  Logger.info(`WaitHelper.waithidden - waiting for ${selector} to be hidden`);
  await page.waitForSelector(selector, {state: 'hidden'});
  Logger.info(`WaitHelper.waithidden - ${selector} is hidden`);
 }  

 static async waitattached(page:Page, selector: string) {
  Logger.info(`WaitHelper.waitattached - waiting for ${selector} to be attached`);
  await page.waitForSelector(selector, {state: 'attached'});
  Logger.info(`WaitHelper.waitattached - ${selector} is attached`);
 }  

 static async waitNavigation(page:Page) {
  Logger.info('WaitHelper.waitNavigation - waiting for navigation (domcontentloaded)');
  await page.waitForLoadState('domcontentloaded');
  Logger.info('WaitHelper.waitNavigation - navigation complete');
 }  

 static async staticwait(ms: number) {
  Logger.info(`WaitHelper.staticwait - sleeping for ${ms}ms`);
  await new Promise(res => setTimeout(res, ms));
 }  

}