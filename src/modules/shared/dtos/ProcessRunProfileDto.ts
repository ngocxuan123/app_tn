import { Email } from "../models/Email";
import { ProcessRun } from "../models/ProcessRun";
import { Proxy } from "../models/Proxy";

export interface ProcessRunProfileDto {
    email: Email;
    proxy: Proxy; 
    processRun: ProcessRun;
}