export enum EmailStatus {
    New = 'New',
    InProgress = 'InProgress',
    Successful = 'Successful',
    Error = 'Error',
  }

export interface Email {
    id?: string;
    email?: string;
    password?: string;
    country?: string;
    source?: string;
    status?: EmailStatus;
    pricing?: number;
}