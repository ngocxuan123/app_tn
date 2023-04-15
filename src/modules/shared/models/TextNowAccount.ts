import { Email } from "./Email";
import { ProcessRun } from "./ProcessRun";

export enum TextNowAccountStatus {
  Failed = 'Failed',
  Successful = 'Successful'
}
export class TextNowAccount {
  id?: number;

  emailText?: string;

  emailPass?: string;

  cookies?: string;

  password?: string;

  phoneNumber?: string;

  email?: Email;

  processRun?: ProcessRun;

  status?: string;
  

  createdAt?: Date;

  updatedAt?: Date;

  constructor(
    emailText: string,
    password: string,
    phoneNumber: string,
    email: Email,
    processRun: ProcessRun,
    status: string,
    id?: number,
    emailPass?: string,
    cookies?: string,
  ) {
    this.emailText = emailText;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.processRun = processRun;
    this.status = status;
    this.id = id;
    this.emailPass = emailPass;
    this.cookies = cookies;
  }

  equals(entity: any): boolean {
    if (!(entity instanceof TextNowAccount)) return false;

    return this.id === entity.id;
  }
}
