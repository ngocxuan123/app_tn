import { Proxy } from '@src/modules/shared/models/Proxy';
import { delay, getDateTimeForName } from '@src/modules/shared/utils/utils';
import path from 'path';
import fs from 'fs';
const xml2js = require('xml2js');
const { exec } = require('child_process');

export async function updateProxier(proxy: Proxy, proxierFolder: string) {
    const pathFile = path.join(__dirname, 'proxier/index.ppx');
  const xml = fs.readFileSync(pathFile, 'utf-8');
  await new Promise((resolve, reject) => {
    xml2js.parseString(xml, function (err: any, result: any) {
      if (err) {
        return;
      }
      if(!!proxy.username && !!proxy.password) {
        result.ProxifierProfile.ProxyList[0].Proxy[0].Authentication[0].Password = 'AAAC5F8MuF8aMcNtrQBjx4vkhNgPGQUWCks6JHVrA1XLEZg=';
        result.ProxifierProfile.ProxyList[0].Proxy[0].Authentication[0].Username = proxy.username;
      }
      result.ProxifierProfile.ProxyList[0].Proxy[0].Address = proxy.host;
      result.ProxifierProfile.ProxyList[0].Proxy[0].Port = proxy.port;
      // Chuyển đổi đối tượng JavaScript thành chuỗi XML
      const builder = new xml2js.Builder();
      const xmlUpdated = builder.buildObject(result);
      
      // const fd = fs.openSync(pathFile, 'w');
      // Ghi nội dung XML đã được cập nhật vào tệp tin
      const fileName =  `${getDateTimeForName()}.ppx`;
      const pathNewFile = path.join(__dirname, `proxier/${fileName}`);
      const fd = fs.openSync(pathNewFile, 'w');
      fs.writeFileSync(fd, xmlUpdated, 'utf8');
      fs.closeSync(fd);
      exec(`cd "${proxierFolder}" && Proxifier.exe "${pathNewFile}" silent-load`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            reject('ERROR CMND');
            return;
          }
        
          if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
          }
          resolve(pathNewFile);
      });
      
    });
  });
  return '';
}
