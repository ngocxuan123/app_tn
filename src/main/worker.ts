import { GoLoginDriver } from '@src/modules/automations/go-login/GoLoginDriver';
import { updateProxier } from '@src/modules/automations/proxier/Proxier';
import { VmLoginDriver } from '@src/modules/automations/vm-login/VmLoginDriver';
import { TextNowBusiness } from '@src/modules/business/textnow/TextNowBusiness';
import { RunnerProcessDto } from '@src/modules/shared/dtos/OptionRunnerDto';
import { ProcessRunProfileDto } from '@src/modules/shared/dtos/ProcessRunProfileDto';
import { delay } from '@src/modules/shared/utils/utils';
import axios from 'axios';
import { parentPort } from 'worker_threads';
const fs = require('fs');
import path from 'path';
import { Proxy } from '@src/modules/shared/models/Proxy';

const winston = require('winston');
let running = true;

const initFileLog = (filename: string): any => {
  const folderName = 'logs/texts';
  filename = path.join(folderName, filename);
  console.log(filename);
  if (!fs.existsSync(folderName)) {
    fs.mkdir(folderName, (err: any) => {
      if (err) {
        console.log(err);
      }
      console.log(`Folder ${folderName} created.`);
    });
  } else {
    console.log(`Folder ${folderName} already exists.`);
  }

  const logger = winston.createLogger({
    level: 'info',
    eol: '\\t\\n',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    defaultMeta: { service: 'Text-now-app' },
    transports: [
      // new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({
        filename,
        json: false,
        eol: '\\t\\n',
      }),
    ],
  });
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }
  return logger;
};

async function regTextnow(workerProcessData: RunnerProcessDto) {
  const host = workerProcessData.data.host;
  // Bussiness
  const timeout = +workerProcessData.data?.options.timeout * 1000;
  const retryNum = workerProcessData.data?.options.retry;
  // Driver
  const apiUrl = workerProcessData.data?.apiUrl;
  const apiKey = workerProcessData.data?.apiKey;
  const apiLocalUrl = workerProcessData.data?.apiLocalUrl;
  const logger = initFileLog(workerProcessData.logFile);
  const textNow = new TextNowBusiness(timeout, retryNum, logger);
  const vmLogin =
    workerProcessData.data.driver === 'VM_LOGIN'
      ? new VmLoginDriver(apiUrl, apiKey, apiLocalUrl, logger)
      : new GoLoginDriver(apiUrl, apiKey, apiLocalUrl, logger);

  let profileId;
  let isCapcha = false;
  let data: any;
  while (running) {
    let fileProxier = '';
    try {
      logger.info('GET DATA FROM SERVER');
      if(isCapcha) {
        if(data) {
          const response = await axios.get<Proxy>(
            `${host}/proxies/avaliable`,
          );
          await axios.put<Proxy>(
            `${host}/proxies/${data.proxy?.id}/update-status`,
            {
              status: false
            }
          );
          data.proxy = response.data;
          isCapcha = false;
        }
      } else {
        const response = await axios.get<ProcessRunProfileDto>(
          `${host}/process-runs/get-available-profile`,
        );
        data = response.data;
      }
      
      if (!data || !data.email || !data.proxy || !data.processRun) {
        await delay(10000);
        continue;
      }
      logger.info(
        `RUNNING | EMAIL: ${data?.email?.email} | PROXY: ${data?.proxy?.text}`,
      );

      if (workerProcessData.data.proxier === true) {
        fileProxier = await updateProxier(
          data.proxy,
          workerProcessData.data.proxierPath,
        );
      }
      const dataDriver = !workerProcessData.data.profileId
        ? await vmLogin.createNewAndStart()
        : await vmLogin.updateAndStart(
            data.proxy,
            workerProcessData.data.profileId,
          );

      if (!dataDriver) {
        await delay(5000);
        return;
      }
      profileId = dataDriver.profileId;
      const textnowAccount = await textNow.registerAccount(
        data.email,
        data.processRun,
        dataDriver.webSocketDebuggerUrl,
        data.proxy,
      );
      if(textnowAccount === null) {
        isCapcha = true;
        continue;
      }
      textnowAccount.emailPass = data.email.password;
      try {
        textnowAccount.cookies = JSON.stringify(
          await vmLogin.getCookies(profileId),
        );
      } catch (ex) {}
      await axios.post<any>(`${host}/process-runs/save-after-run`, {
        proxy: data.proxy,
        email: textnowAccount.email,
        processRun: textnowAccount.processRun,
        textNowAccount: textnowAccount,
      });
    } catch (err) {
      logger.error(err.message, {
        data: err.data,
        stack: err.stack,
      });
    } finally {
      if (!!fileProxier) {
        fs.unlink(fileProxier, (err: any) => {
          if (err) {
            console.error(err);
            logger.error('Cannot delete file', err);
            return;
          }
          logger.info('Delete log file succesfull', err);
        });
      }
      if(!workerProcessData.data.profileId) {
        await vmLogin.deleteProfile(profileId);
      }
      
      await vmLogin.forceStop(profileId);
    }
  }
}

if (parentPort) {
  parentPort.on('message', async (data: string | RunnerProcessDto) => {
    if (typeof data === 'string' || data instanceof String) {
      if (data === 'stop') {
        running = false;
      }
    } else {
      await regTextnow(data);
    }
  });
}
