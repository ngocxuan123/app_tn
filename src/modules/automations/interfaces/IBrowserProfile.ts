export interface IBrowserProfile {
  screenHeight?: number;
  clientRects?: boolean;
  appName?: string;
  timeZone?: string;
  product?: string;
  timeZoneFillOnStart?: boolean;
  dynamicFonts?: boolean;
  browserSettings?: { [key: string]: boolean };
  canvasDefType?: string;
  mediaDevices?: MediaDevices;
  doNotTrack?: boolean;
  acceptLanguage?: string;
  maskFonts?: boolean;
  webgl?: Webgl;
  langHdr?: string;
  pluginFingerprint?: PluginFingerprint;
  screenWidth?: number;
  userAgent?: string;
  audio?: Audio;
  platform?: string;
  webRtc?: WebRTC;
  hardwareConcurrency?: number;
}

export interface Audio {
  noise?: boolean;
}

export interface MediaDevices {
  videoInputs?: number;
  audioInputs?: number;
  audioOutputs?: number;
}

export interface PluginFingerprint {
  pluginEnable?: boolean;
}

export interface WebRTC {
  localIps?: string[];
  publicIp?: string;
  type?: string;
  fillOnStart?: boolean;
}

export interface Webgl {
  imgProtect?: boolean;
  noise?: boolean;
  vendor?: string;
  renderer?: string;
}
