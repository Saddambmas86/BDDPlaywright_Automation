import {Page} from 'playwright';
import {BasePage} from '../pages/BasePage';
import {WaitHelper} from '../utils/WaitHelper';
import { Logger } from '../utils/Logger';

export class LoginPage extends BasePage {

    constructor(page: Page) {  
    super(page);
    }

async Login(username:string, password:string){
  await WaitHelper.waitVisible(this.page.locator('#loginusername')); 
  //await this.page.getByRole('link', { name: 'Log in' }).click();
  Logger.info(`LoginPage.Login - start for user=${username}`);
  await this.page.locator('#loginusername').fill(username);
  await this.page.locator('#loginpassword').fill(password);
  await this.page.getByRole('button', { name: 'Log in' }).click();
  await WaitHelper.waitNavigation(this.page);
  Logger.info(`LoginPage.Login - completed for user=${username}`);
}

}
