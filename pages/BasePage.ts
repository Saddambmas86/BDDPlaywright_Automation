import {Page} from 'playwright'
import { Logger } from '../utils/Logger';

export class BasePage {
constructor(protected page: Page) {}

async navigateTo(url: string){
    Logger.info(`BasePage.navigateTo - navigating to ${url}`);
    await this.page.goto(url)
    Logger.info(`BasePage.navigateTo - navigation complete: ${url}`);
}
}