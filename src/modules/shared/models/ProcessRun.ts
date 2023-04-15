import { Email } from "./Email";
import { TextNowAccount } from "./TextNowAccount";

export enum ProcessRunStatus {
    InProgress = 'InPrgress',
    Failed = 'Failed',
    Successful = 'Successful',
  }
  
  export interface ProcessRun{
    id?: number;
  
    startTime?: Date;
  
    email?: Email;
  
    status?: ProcessRunStatus;
  
    maxRetry?: number;
  
    endTime?: Date;
  
    error?: string;
  
    textNowAccount?: TextNowAccount;
  
    errorImageUrl?: string;
  
    createdAt?: Date;
  
    updatedAt?: Date;
  }  