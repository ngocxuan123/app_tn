import { FormProperty } from '@components/forms/form-property';

export enum RunnerProcessStatus {
  Running = 'Running',
  Pending = 'Pending',
  Stop = 'Stop',
}

export interface RunnerProcessResultDto {
  count: number;
  success: number;
  fail: number;
}

export interface RunnerProcessDto {
  enableAutoGetLog?: boolean;
  timeoutGetLog?: number;
  logFile: string;
  id: string;
  status?: RunnerProcessStatus;
  result?: RunnerProcessResultDto;
  data: FormProperty;
}
