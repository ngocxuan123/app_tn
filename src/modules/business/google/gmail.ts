import { Email } from '../../../modules/shared/models/Email';
import { Page  } from 'puppeteer';
import { DEFAULT_WAIT_ELEMENT_TIMEOUT, delay, getTimeoutRandom } from '@src/modules/shared/utils/utils';

export class GoogleMail {
  static async signGmail(page: Page, email: Email, logger: any): Promise<any> {   
    try {
      const hasedEnter = await this.enterEmail(page, email, logger);
      if(!hasedEnter) {
        await this.selectMailLogined(page, email, logger)
      }
      const confirmed = await this.confirm(page, email, logger); 
      if(confirmed) return 'SUCCESS';
      const mailDisabled = await this.disabledEmail(page, email, logger);
      if(mailDisabled) return 'ERROR';
    } catch (ex) {
      throw ex;
    }
  
    // await page.click('xpath//*[@id="identifierNext"]/div/button');
  }

  private static async selectMailLogined(page: Page, email: Email, logger: any) {
    try {
      //*[@id="container"]/div/div[2]/div[1]/div[1]
      const xpath = '//*[@id="credentials-picker"]/div[1]/div[1]';
      logger.info('WAIT FOR EMAIL SIGNED');
      await page.waitForXPath(xpath, {timeout: 2000}); // Chờ đợi phần tử xuất hiện trên trang
      logger.info('CLICK EMAIL SIGNED');
      const button = (await page.$x(xpath))[0]; // Lấy ra phần tử
      await (button as any).click(); // Click vào phần tử
      return true;
    } catch (ex) {
      logger.error("Cann't select email");
      return false;
    }
  }

  private static async enterEmail(page: Page, email: Email, logger: any) {
    try {
      //*[@id="credentials-picker"]/div[1]
      logger.info('ENTER EMAIL');
      await page.waitForSelector('#identifierId', {timeout: DEFAULT_WAIT_ELEMENT_TIMEOUT});
      await page.type('#identifierId', email.email!);
      await delay(getTimeoutRandom());
      await page.click('#identifierNext');
      await page.waitForSelector('input[type="password"]', { visible: true, timeout: DEFAULT_WAIT_ELEMENT_TIMEOUT });
      await page.type('input[type="password"', email.password!);
      logger.info('ENTER PASSWORD');
      await delay(getTimeoutRandom());
      await page.keyboard.press('Enter');
      return true;
    } catch (ex) {
      logger.error('ERROR ENTER EMAIL/PASSWORD GMAIL');
      return false;
    }
  }

  private static async disabledEmail(page: Page, email: Email, logger: any) {
    try {
      const elementXPath = '//*[@id="headingText"]/span';
      await page.waitForXPath(elementXPath, { timeout: 10000 });
  
      const [elementHandle] = await page.$x(elementXPath);
      const elementContent = await page.evaluate(
        (el) => el.textContent,
        elementHandle,
      );
      return elementContent.includes('disabled');
    } catch (ex) {
      return false
    }
  }

  private static async confirm(page: Page, email: Email, logger: any) {
    try {
      logger.info('CONFIRM EMAIL');
      await page.waitForSelector('#confirm_yes', {timeout: 5000});
      await page.click('#confirm_yes');
      return true;
    } catch (ex) {
      logger.error('ERROR CONFIRM ACCOUNT GMAIL');
      return false;
      // throw BussinessException(TextNowSteps.CONFIRM_GOOGLE_ACCOUNT, ex);
    }
  }
}
