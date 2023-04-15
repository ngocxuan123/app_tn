export interface Proxy {
  id?: number;

  type: string;

  host: string;

  port: string;

  text: string;

  isUsing: boolean;

  username?: string;

  password?: string;
}
