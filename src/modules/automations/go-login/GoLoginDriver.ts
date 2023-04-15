import axios from 'axios';
import { IBrowserDriver } from '../interfaces/IBrowserDriver';
import { IStartBrowserData } from '../interfaces/IStartBrowserData';
import { Proxy } from '../../shared/models/Proxy';
import { delay, getDateTimeForName } from '../../shared/utils/utils';
const defaultParamsRamdomProfile =
  'langHdr=en-US&acceptLanguage=en-US,en;q=0.9&timeZone=America/New_York';

export class GoLoginDriver implements IBrowserDriver {
  private readonly urlApi: string = 'https://api.gologin.com/browser';
  private readonly apiKey: string =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDMwNDEzZDFmZDBhNWY4NWE0MmRmZWIiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NDMwNDI5NDY1OGU5YzNhOTY3Y2FiZGMifQ.9i1dcaQqvvXgvgLPYP0YLiVzsT9_gwdmUiEaYEfkjKw';
  private readonly urlLocalApi: string = 'http://localhost:36912/browser';
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
    const res = await axios.get(`${this.urlApi}/${profileId}/cookies`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.apiKey,
      },
    });
    return res;
  }

  async forceStop(profileId: string): Promise<boolean> {
    if (!this.isStarted) return;
    return await axios.post(
      `${this.urlLocalApi}/stop-profile`,
      {
        profileId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    if (!this.isStarted) return;
    return await axios.delete(`${this.urlApi}/${profileId}`, {
      headers: {
        Authorization: 'Bearer ' + this.apiKey,
      },
    });
  }

  async createNewAndStart(proxy?: Proxy): Promise<IStartBrowserData> {
    // get ramdom profile
    try {
      this.logger.info(`GET RAMDOM PROFILE`);
      const { data: profile } = await axios.get(
        `${this.urlApi}/fingerprint?os=win&resolution=1680x1050&isM1=true`,
        {
          headers: {
            Authorization: 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      // save profile with override default setting
      this.logger.info(`CREATE PROFILE`);
      const values = this.overrideProfileData(profile, proxy);
      const { data } = await axios.post(`${this.urlApi}`, values, {
        headers: {
          Authorization: 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json',
        },
      });
      await delay(2000);
      // start profile
      const response = await axios.post(`${this.urlLocalApi}/start-profile`, {
        profileId: data.id,
        sync: true,
      });
      this.logger.info(`START PROFILE`);
      this.isStarted = true;
      return {
        webSocketDebuggerUrl: response.data.wsUrl,
        profileId: data.id,
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
      // this.logger.info(`GET RANDOM PROFILE: ${profileId}`);
      // const { data: profile } = await axios.get(
      //   `${this.urlApi}/fingerprint?os=win&resolution=1680x1050&isM1=true`,
      //   {
      //     headers: {
      //       Authorization: 'Bearer ' + this.apiKey,
      //       'Content-Type': 'application/json',
      //     },
      //   },
      // );
      // // save profile with override default setting
      // this.logger.info(`UPDATE PROFILE ${profileId}`);
      // const {
      //   data: { value },
      // } = await axios.post(`${this.urlApi}/profile/${profileId}?`, this.overrideProfileData(profile), {

      // });
      await axios.post(
        `${this.urlApi}/${profileId}/cookies?cleanCookies=true`,
        [],
        {
          headers: {
            Authorization: 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.info(`START PROFILE ${profileId}`);
      const { data: profile } = await axios.patch(
        `${this.urlApi}/fingerprints`,
        {
          resolution: '1280x720',
          language: 'en-US',
          browsersIds: [profileId],
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      // start profile
      await delay(2000);
      // start profile
      const response = await axios.post(`${this.urlLocalApi}/start-profile`, {
        profileId: profileId,
        sync: true,
      });
      this.logger.info(`START PROFILE`);
      this.isStarted = true;
      return {
        webSocketDebuggerUrl: response.data.wsUrl,
        profileId,
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

  private overrideProfileData(profile: any, proxy?: Proxy) {
    delete profile['webglParams'];
    const tmpProfile = {
      ...profile,
      name: `${getDateTimeForName()}_${Math.random() * 1000}_${proxy?.id}`,
      geolocation: {
        mode: 'allow',
        enabled: true,
        customize: true,
        fillBasedOnIp: true,
        latitude: 0,
        longitude: 0,
        accuracy: 10,
      },
      webRTC: {
        mode: 'disabled',
        enabled: true,
        customize: true,
        localIpMasking: false,
        fillBasedOnIp: true,
        publicIp: '',
        localIps: [],
      },
      proxyEnabled: false,

      browserType: 'chrome',
      fonts: {
        enableMasking: true,
        enableDomRect: true,
        families: [
          'AIGDT',
          'AMGDT',
          'Arial',
          'Arial Baltic',
          'Arial CE',
          'Arial Cyr',
          'Arial Greek',
          'Arial Hebrew',
          'Arial Narrow',
          'Arial TUR',
          'Arial Unicode MS',
          'Calibri',
          'Calibri Light',
          'Cambria Math',
          'Candara',
          'Comic Sans MS',
          'Constantia',
          'Corbel',
          'Courier New',
          'Courier New Baltic',
          'Courier New Cyr',
          'Courier New Greek',
          'Courier New TUR',
          'David',
          'David Libre',
          'DejaVu Sans',
          'DejaVu Sans Condensed',
          'DejaVu Sans Light',
          'DejaVu Sans Mono',
          'DejaVu Serif',
          'DejaVu Serif Condensed',
          'Ebrima',
          'Frank Ruehl',
          'Frank Ruehl Libre',
          'Frank Ruehl Libre Black',
          'Frank Ruehl Libre Light',
          'Franklin Gothic Book',
          'Franklin Gothic Demi',
          'Franklin Gothic Demi Cond',
          'Franklin Gothic Heavy',
          'Franklin Gothic Medium',
          'Franklin Gothic Medium Cond',
          'Gabriola',
          'Gadugi',
          'Georgia',
          'Gill Sans',
          'Gill Sans MT',
          'Gill Sans MT Ext Condensed Bold',
          'Gill Sans Ultra Bold',
          'Gill Sans Ultra Bold Condensed',
          'Impact',
          'KacstBook',
          'KacstLetter',
          'KacstNaskh',
          'KacstTitlel',
          'Leelawadee',
          'Liberation Mono',
          'Liberation Sans',
          'Liberation Sans Narrow',
          'Liberation Serif',
          'Lucida Bright',
          'Lucida Calligraphy',
          'MS Gothic',
          'MS LineDraw',
          'MS Mincho',
          'MS Outlook',
          'MS PGothic',
          'MS PMincho',
          'MS Reference Sans Serif',
          'MS Reference Specialty',
          'MS Sans Serif',
          'MS UI Gothic',
          'MV Boli',
          'Malgun Gothic',
          'Marlett',
          'Microsoft Himalaya',
          'Microsoft JhengHei',
          'Microsoft JhengHei UI',
          'Microsoft New Tai Lue',
          'Microsoft PhagsPa',
          'Microsoft Sans Serif',
          'Microsoft Tai Le',
          'Microsoft Uighur',
          'Microsoft YaHei',
          'Microsoft YaHei UI',
          'Microsoft Yi Baiti',
          'MingLiU',
          'MingLiU-ExtB',
          'MingLiU_HKSCS',
          'MingLiU_HKSCS-ExtB',
          'Miriam',
          'Miriam Fixed',
          'Miriam Libre',
          'Mongolian Baiti',
          'NSimSun',
          'Nirmala UI',
          'Noto Mono',
          'Noto Sans',
          'Noto Sans Arabic UI',
          'Noto Sans CJK JP',
          'Noto Sans CJK KR',
          'Noto Sans CJK SC',
          'Noto Sans CJK TC',
          'Noto Sans Mono CJK HK',
          'Noto Sans Mono CJK JP',
          'Noto Sans Mono CJK KR',
          'Noto Sans Mono CJK SC',
          'Noto Sans Mono CJK TC',
          'Noto Serif',
          'Noto Serif CJK JP',
          'Noto Serif CJK KR',
          'Noto Serif CJK SC',
          'Noto Serif Georgian',
          'Noto Serif Hebrew',
          'Noto Serif Italic',
          'Noto Serif Lao',
          'OpenSymbol',
          'Oswald',
          'PMingLiU',
          'PMingLiU-ExtB',
          'Palatino',
          'Palatino Linotype',
          'Roboto',
          'Roboto Black',
          'Roboto Light',
          'Roboto Medium',
          'Roboto Thin',
          'Segoe Print',
          'Segoe Script',
          'Segoe UI',
          'Segoe UI Light',
          'Segoe UI Semibold',
          'Segoe UI Semilight',
          'Segoe UI Symbol',
          'SimSun',
          'Sylfaen',
          'Symbol',
          'Tahoma',
          'Times New Roman',
          'Times New Roman Baltic',
          'Times New Roman CE',
          'Times New Roman Cyr',
          'Times New Roman TUR',
          'Verdana',
          'Webdings',
          'Wingdings',
          'Wingdings 2',
          'Yu Gothic',
          'Yu Gothic UI',
          'Zapf Dingbats',
        ],
      },
    };
    if (
      !tmpProfile['webGLMetadata'] ||
      tmpProfile['webGLMetadata'].mode === 'noise'
    ) {
      tmpProfile['webGLMetadata'] = {
        mode: 'off',
        vendor: 'Google Inc. (Intel)',
        renderer:
          'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      };
    }
    if (!!proxy) {
      tmpProfile['proxyEnabled'] = true;
      tmpProfile['proxy'] = {
        id: '643424ac837e6b4bb3958841',
        mode: 'socks5',
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
      };
    }
    return tmpProfile;
  }
}
