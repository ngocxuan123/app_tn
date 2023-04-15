export interface GoLoginProfiles {
  profiles?: GoLoginProfile[];
  allProfilesCount?: number;
  currentOrbitaMajorV?: string;
  currentBrowserV?: string;
  currentTestBrowserV?: string;
  currentTestOrbitaMajorV?: string;
}

export interface GoLoginProfile {
  name?: string;
  role?: string;
  id?: string;
  notes?: string;
  browserType?: string;
  lockEnabled?: boolean;
  timezone?: GoLoginTimezone;
  navigator?: GoLoginNavigator;
  geolocation?: GoLoginGeolocation;
  canBeRunning?: boolean;
  os?: string;
  proxy?: GoLoginProxy;
  proxyType?: string;
  proxyRegion?: string;
  sharedEmails?: any[];
  shareId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastActivity?: Date;
  chromeExtensions?: any[];
  userChromeExtensions?: any[];
  tags?: any[];
  proxyEnabled?: boolean;
}

export interface GoLoginGeolocation {
  mode?: string;
  enabled?: boolean;
  customize?: boolean;
  fillBasedOnIp?: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface GoLoginNavigator {
  userAgent?: string;
  resolution?: string;
  language?: string;
}

export interface GoLoginProxy {
  mode?: string;
  port?: number;
  autoProxyRegion?: string;
  torProxyRegion?: string;
  host?: string;
  username?: string;
  password?: string;
}

export interface GoLoginTimezone {
  fillBasedOnIp?: boolean;
  timezone?: string;
}
