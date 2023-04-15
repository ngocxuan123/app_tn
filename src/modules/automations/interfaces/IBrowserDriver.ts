import { IBrowserProfile } from './IBrowserProfile';
import { IStartBrowserData } from './IStartBrowserData';
import { Proxy } from "../../../modules/shared/models/Proxy";

export interface IBrowserDriver {
  createNewAndStart(proxy: Proxy): Promise<IStartBrowserData>;
  updateAndStart(proxy: Proxy, profileId: string): Promise<IStartBrowserData>;
  deleteProfile(profileId: string): Promise<boolean>;
  forceStop(profileId: string): Promise<boolean>;
  getCookies(profileId: string): Promise<any>;
}
