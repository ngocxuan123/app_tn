import { Email, EmailStatus } from '@modules/shared/models/Email';
import {
  ProcessRun,
  ProcessRunStatus,
} from '@modules/shared/models/ProcessRun';
import {
  TextNowAccount,
  TextNowAccountStatus,
} from '@modules/shared/models/TextNowAccount';
import {
  delay,
  generatePassword,
  getDateForName,
  getDateTimeForName,
  getRandomArea,
  getTimeoutRandom,
} from '@modules/shared/utils/utils';
import puppeteer, { Browser, Page } from 'puppeteer';
import { GoogleMail } from '../google/gmail';
import fs from 'fs';
import { Proxy } from '@src/modules/shared/models/Proxy';
import path from 'path';

export class TextNowBusiness {
  private readonly defaultTimoutWait: number = 5000;
  private readonly maxRetry: number = 2;
  private readonly logger: any;

  constructor(timeoutWait: number, retry: number, logger: any) {
    this.defaultTimoutWait = timeoutWait;
    this.maxRetry = retry;
    this.logger = logger;
  }

  async registerAccount(
    email: Email,
    processRun: ProcessRun,
    webSocketDebuggerUrl: string,
    proxy: Proxy,
  ): Promise<TextNowAccount> {
    this.logger.info('OPEN BROWSER');
    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
    });
    return await this.run(browser, email, processRun, proxy, this.maxRetry);
  }

  private async run(
    browser: Browser,
    email: Email,
    processRun: ProcessRun,
    proxy: Proxy,
    retry = 3,
  ): Promise<TextNowAccount> {
    const page = await browser.newPage();
    await this.setUpRequest(page, false, proxy);
    let newPass = '';
    let phone = '';
    try {
      await this.signTextNowByGoogle(page);
      const status = await this.signByGmail(page, email, this.maxRetry);
      if (status === 'ERROR') {
        processRun.status = ProcessRunStatus.Failed;
        email.status = EmailStatus.Error;
        processRun.errorImageUrl = await this.takeScreen(page);
        await page.close();
        await browser.close();
        return new TextNowAccount(
          email.email!,
          newPass,
          phone,
          email,
          processRun,
          TextNowAccountStatus.Failed,
        );
      }
      if(await this.checkCaptcha(page)) {
        return null;
      }
      await this.selectPhoneNumber(page);
      newPass = await this.changePassword(page, email);
      phone = await this.getPhoneNumber(page);
      processRun.status = ProcessRunStatus.Successful;
      processRun.errorImageUrl = await this.takeScreen(page);
      email.status = EmailStatus.Successful;
      return new TextNowAccount(
        email.email!,
        newPass,
        phone,
        email,
        processRun,
        TextNowAccountStatus.Successful,
      );
    } catch (err: any) {
      processRun.error = err?.message;
      processRun.status = ProcessRunStatus.Failed;
      email.status = EmailStatus.Error;
      this.logger.error("CAN'T REG TEXTNOW ACCOUNT", {
        ata: err?.inner?.data,
        stack: err?.inner?.stack,
      });
      if (retry > 0) {
        await page.close();
        return await this.run(browser, email, processRun, proxy, retry - 1);
      }
      processRun.errorImageUrl = await this.takeScreen(page);
      await page.close();
      await browser.close();
      return new TextNowAccount(
        email.email!,
        newPass,
        phone,
        email,
        processRun,
        TextNowAccountStatus.Failed,
      );
    }
  }
  private async signTextNowByGoogle(page: Page) {
    try {
      this.logger.info('GO TO TEXTNOW LOGIN');
      await page.goto('https://www.textnow.com/login');
      await page.waitForSelector('#google-auth-btn', {
        timeout: this.defaultTimoutWait,
      });
      this.logger.info('WAIT FOR BUTTON LOGIN GOOGLE');
      // xư lý click bởi tọa độ
      const elementHandle = await page.$('#google-auth-btn');

      // Lấy vị trí tọa độ của phần tử
      const boundingBox = await elementHandle.boundingBox();

      // Tính toán vị trí tọa độ cần click trên phần tử
      const x = boundingBox.x + boundingBox.width / 4;
      const y = boundingBox.y + boundingBox.height / 2;

      // Click vào phần tử bằng tọa độ
      await page.mouse.click(x, y);
      this.logger.info('GO TO GMAIL');
      // await page.click('#google-auth-btn');
    } catch (err) {
      this.logger.error('CANNOT CliCk  GOOGLE LOGIN', {
        ata: err.data,
        stack: err.stack,
      });
      throw err;
      // throw BussinessException(TextNowSteps.LOGIN_BY_GOOGLE, err);
    }
  }

  private async selectPhoneNumber(page: Page) {
    try {
      this.logger.info('GO TO SELECT PHONE');
      try {
        await page.waitForSelector('#areaCodeSearch', { timeout: 10000 });
      } catch (err) {
        this.logger.error('CANNOT REDIRECT TO SELECTION NUMEBR', {
          ata: err.data,
          stack: err.stack,
        });
        await page.goto('https://www.textnow.com/numberselection');
      }

      await page.type('#areaCodeSearch', getRandomArea());
      await delay(getTimeoutRandom());
      await page.keyboard.press('Enter');
      await page.waitForSelector('button[type="submit"]');
      await delay(1000);
      await page.click('button[type="submit"]');
    } catch (err) {
      this.logger.error('CANNOT SELECT PHONE', {
        ata: err.data,
        stack: err.stack,
      });
      throw err;
      // throw BussinessException(TextNowSteps.SELECT_NUMBER, err);
    }
  }

  private async signByGmail(page: Page, email: Email, maxRetry = 3) {
    const waitForWindow = new Promise<Page>((resolve) =>
      page.on('popup', resolve),
    );
    let newPage!: Page;
    try {
      newPage = await waitForWindow;
      this.logger.info('OPEN POPUP LOGIN GMAIL');
      return await GoogleMail.signGmail(
        newPage as unknown as any,
        email,
        this.logger,
      );
    } catch (err) {
      this.logger.error('CANNOT SIGNIN GMAIL', {
        ata: err.data,
        stack: err.stack,
      });
      await page.close();
      throw err;
    }
  }

  private async changePassword(page: Page, email: Email): Promise<string> {
    try {
      this.logger.info('GO TO CHANGE PASSWORD');
      const newPassword = generatePassword();
      await page.goto('https://www.textnow.com/account/password');
      await page.waitForSelector('input[name="old_password"]', {
        visible: true,
        timeout: this.defaultTimoutWait,
      });
      await page.type('input[name="old_password"', email.password!);
      await page.type('input[name="password"', newPassword);
      await page.type('input[name="confirm_password"', newPassword);
      await delay(getTimeoutRandom());
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-tn-ui="Text__p"]');
      return newPassword;
    } catch (err) {
      this.logger.error('ERROR CANT CHANGE PASSWORD', {
        data: err.data,
        stack: err.stack,
      });
      throw err;
      // throw BussinessException(TextNowSteps.CHANGE_PASSWORD, err);
    }
  }

  private async getPhoneNumber(page: Page): Promise<string> {
    this.logger.info('GO TO GET PHONE NUMBER');
    await page.goto('https://www.textnow.com/account/profile');
    const elementXPath = '//*[@id="root"]/div[2]/div/div[2]/div[2]/p';
    await page.waitForXPath(elementXPath, { visible: true });

    const [elementHandle] = await page.$x(elementXPath);
    const elementContent = await page.evaluate(
      (el) => el.textContent,
      elementHandle,
    );
    return elementContent || '';
  }

  private async setUpRequest(page: Page, gg = false, proxy: Proxy = null) {
    await page.setRequestInterception(true);
    const tmps = ['image', 'media', 'font'];
    if (!gg) tmps.push('stylesheet');
    page.on('request', async (request) => {
      if (tmps.indexOf(request.resourceType()) !== -1) {
        request.abort();
      } else {
        // if (request.url().includes('textnow.com') && !!proxy) {
        //   await useProxy(
        //     request,
        //     `https://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`,
        //   );
        // }
        request.continue();
      }
    });
  }

  private async takeScreen(page: Page) {
    // Chụp ảnh màn hình
    const screenshot = await page.screenshot();
    const rootFolder = 'logs';
    // create screens folders
    const screenFolder = path.join(rootFolder, 'screens') ;
    if (!fs.existsSync(screenFolder)) {
      fs.mkdir(screenFolder, (err: any) => {
        if (err) {
          console.log(err);
        }
        console.log(`Folder ${folderData} created.`);
      });
    } else {
      console.log(`Folder ${screenFolder} already exists.`);
    }
    // folder by date
    const folderData =  path.join(screenFolder, getDateForName()) ;
    if (!fs.existsSync(folderData)) {
      fs.mkdir(folderData, (err: any) => {
        if (err) {
          console.log(err);
        }
        console.log(`Folder ${folderData} created.`);
      });
    } else {
      console.log(`Folder ${folderData} already exists.`);
    }
    const fileName = path.join(folderData, getDateTimeForName() + '_screenshot.png') ;
    // Lưu ảnh vào thư mục hiện tại
    fs.writeFileSync(fileName, screenshot);
    return fileName;
    // processRun.errorImageUrl = fileName;
  }

  private async checkCaptcha(page: Page) {
    try {
      const elementXPath = '//*[@id="perimeter_x"]/div';
      await page.waitForXPath(elementXPath, { timeout: 2000 });
      return true;
    } catch (ex) {
      return false
    }
  }
}
