import axios from 'axios';
import { IBrowserDriver } from '../interfaces/IBrowserDriver';
import { IStartBrowserData } from '../interfaces/IStartBrowserData';
import { Proxy } from '../../../modules/shared/models/Proxy';
import { delay, getDateTimeForName } from '../../../modules/shared/utils/utils';
const defaultParamsRamdomProfile =
  'langHdr=en-US&acceptLanguage=en-US,en;q=0.9&timeZone=America/New_York';

export class VmLoginDriver implements IBrowserDriver {
  private readonly urlApi: string = 'https://api.vmlogin.com/v1';
  private readonly apiKey: string = '9809e3c1f2735311dc507c7b0f8e20ec';
  private readonly urlLocalApi: string = 'http://127.0.0.1:35000/api/v1';
  private readonly logger: any;
  private isStarted: boolean;

  constructor(
    urlApi: string,
    apiKey: string,
    urlLocalApi: string,
    logger: any,
  ) {
    this.urlApi = urlApi;
    this.apiKey = apiKey;
    this.urlLocalApi = urlLocalApi;
    this.logger = logger;
  }

  async getCookies(profileId: string): Promise<any> {
    const formData = new URLSearchParams();
    formData.append('profileId', profileId);
    formData.append('all', '0');
    const res = await axios.post(
      `${this.urlApi}/profile/getCookies`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return res;
  }

  async forceStop(profileId: string): Promise<boolean> {
    if (!this.isStarted) return;
    return await axios.get(
      `${
        this.urlLocalApi
      }/profile/stop?force=${true}&block=${true}&profileId=${profileId}`,
    );
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    if (!this.isStarted) return;
    return await axios.get(
      `${this.urlApi}/profile/remove?token=${this.apiKey}&profileId=${profileId}`,
    );
  }

  async createNewAndStart(proxy?: Proxy): Promise<IStartBrowserData> {
    // get ramdom profile
    try {
      this.logger.info(`GET RAMDOM PROFILE`);
      const { data: profile } = await axios.get(
        `${
          this.urlLocalApi
        }/profile/randomProfile?platform=${this.getRamdomPlatform()}&${defaultParamsRamdomProfile}`,
      );
      // save profile with override default setting
      this.logger.info(`CREATE PROFILE`);
      const {
        data: { value },
      } = await axios.post(`${this.urlApi}/profile/create?`, {
        body: this.overrideProfileData(profile, false, proxy),
        token: this.apiKey,
      });
      // start profile
      const { data } = await axios.get(
        `${this.urlLocalApi}/profile/start?skiplock=true&profileId=${value}`,
      );
      this.logger.info(`START PROFILE`);
      await delay(5000);
      const response = await axios({
        url: `${data.value}/json/version`,
        method: 'GET',
      });
      this.isStarted = true;
      return {
        webSocketDebuggerUrl: response.data.webSocketDebuggerUrl,
        profileId: value,
      };
    } catch (ex) {
      this.logger.error(`CANNOT OPEN VMLOGIN WITH`, {
        data: ex.data,
        stack: ex.stack,
      });
      this.isStarted = false;
      throw ex;
    }
  }

  async updateAndStart(
    proxy: Proxy,
    profileId: string,
  ): Promise<IStartBrowserData> {
    try {
      this.logger.info(`GET RANDOM PROFILE: ${profileId}`);
      const { data: profile } = await axios.get(
        `${
          this.urlLocalApi
        }/profile/randomProfile?platform=${this.getRamdomPlatform()}&${defaultParamsRamdomProfile}`,
      );
      // save profile with override default setting
      this.logger.info(`UPDATE PROFILE ${profileId}`);
      const {
        data: { value },
      } = await axios.post(`${this.urlApi}/profile/update?`, {
        body: this.overrideProfileData(profile, true),
        profileId,
        token: this.apiKey,
      });
      this.logger.info(`START PROFILE ${profileId}`);
      // start profile
      const { data } = await axios.get(
        `${this.urlLocalApi}/profile/start?skiplock=true&profileId=${profileId}`,
      );
      await delay(5000);
      this.logger.info(`GET WEBBROWSER_URL PROFILE ${profileId}`);
      const response = await axios({
        url: `${data.value}/json/version`,
        method: 'GET',
      });
      this.isStarted = true;
      return {
        webSocketDebuggerUrl: response.data.webSocketDebuggerUrl,
        profileId: value,
      };
    } catch (err) {
      this.logger.error(`CANNOT OPEN VMLOGIN WITH ${profileId}`, {
        data: err.data,
        stack: err.stack,
      });
      this.isStarted = false;
      throw err;
    }
  }

  private getRamdomPlatform() {
    const platforms = [
      'Windows ',
      // 'Linux',
      // 'Macintosh',
      // 'Chrome',
      // 'Firefox',
      // 'Edge',
    ];
    return platforms[Math.floor(Math.random() * platforms.length)];
  }

  private overrideProfileData(profile: any,isUpadte?: boolean, proxy?: Proxy, ) {
    const tmpProfile = {
      ...profile,
      name: !isUpadte ? `${getDateTimeForName()}_${Math.random() * 1000}` : profile.name,
      mobileEmulation: true,
      deviceType: 0,
      langBasedOnIp: true,
      webRtc: {
        type: 'BLOCKB',
        fillOnStart: true,
        wanSet: false,
        lanSet: false,
      },
      localCache: {
        deleteCache: true, // Other configurations -> Local cache -> Delete cache file before starting browser every time
        deleteCookie: true, // Other configurations -> Local cache -> Delete cookies before each browser launch
        clearCache: true, // Other configurations -> Local cache -> Clean up file cache when browser is closed
        clearHistory: true, // Other configurations -> Local cache -> Delete the history when the browser is closed
      },
      defaultContentSettingValues: {
        images: 2,
        javascript: 1,
        cookies: 1,
        plugins: 1,
        styleSheets: 2,
      },
      proxyServer: {
        setProxyServer: false,
      },
      kernelVer: '111',
      screenWidth: 1920,
      screenHeight: 1080,
      userAgent:
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.65 Safari/537.36',
      hideWebdriver: true,
      doNotTrack: true,
    };
    if (!!proxy) {
      tmpProfile['proxyServer'] = {
        setProxyServer: true,
        type: 'socks5',
        host: proxy?.host,
        port: proxy?.port,
        username: proxy?.username,
        password: proxy?.password,
      };
    }
    return tmpProfile;
  }
}
