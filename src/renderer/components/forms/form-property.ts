export interface FormProperty {
  driver: 'VM_LOGIN' | 'GO_LOGIN';
  proxier: boolean;
  host: string;
  apiUrl: string;
  apiKey: string;
  apiLocalUrl: string;
  profileId: string;
  proxierPath: string;
  options: FormOptions;
  numberProcess: number;
}

export interface FormOptions {
  retry: number;
  timeout: number;
}

export const initValues: FormProperty = {
  driver: 'VM_LOGIN',
  proxier: false,
  host: 'http://api-textnowvn.com',
  apiUrl: 'https://api.vmlogin.com/v1',
  apiKey: '9809e3c1f2735311dc507c7b0f8e20ec',
  apiLocalUrl: 'http://127.0.0.1:35000/api/v1',
  profileId: '',
  proxierPath: '',
  options: {
    retry: 1,
    timeout: 10,
  },
  numberProcess: 1,
};

export const DEFAULT_DRIVER = {
  VM_LOGIN: {
    apiUrl: 'https://api.vmlogin.com/v1',
    apiKey: '9809e3c1f2735311dc507c7b0f8e20ec',
    apiLocalUrl: 'http://127.0.0.1:35000/api/v1',
  },
  GO_LOGIN: {
    apiUrl: 'https://api.gologin.com/browser',
    apiKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDMwNDEzZDFmZDBhNWY4NWE0MmRmZWIiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NDMwNDI5NDY1OGU5YzNhOTY3Y2FiZGMifQ.9i1dcaQqvvXgvgLPYP0YLiVzsT9_gwdmUiEaYEfkjKw',
    apiLocalUrl: 'http://localhost:36912/browser',
  },
};
