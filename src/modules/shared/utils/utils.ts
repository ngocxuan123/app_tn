export const DEFAULT_WAIT_ELEMENT_TIMEOUT = 5000;

export function generatePassword(length = 8) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#*$!';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// export const generatePassword = (): string => {
//   const passwordLength = 8;
//   const randomBytes = crypto.randomBytes(passwordLength);

//   const password = randomBytes
//     .toString('base64')
//     .replace(/[\+\/]/g, '')
//     .slice(0, passwordLength);

//   return password;
// };

export const areas = [
  '205',
  '251',
  '256',
  '334',
  '938',
  '907',
  '480',
  '520',
  '602',
  '623',
  '928',
  '479',
  '501',
  '870',
  '209',
  '213',
  '310',
  '323',
  '408',
  '415',
  '424',
  '442',
  '510',
  '530',
  '559',
  '562',
  '619',
  '626',
  '628',
  '650',
  '657',
  '661',
  '669',
  '707',
  '714',
  '747',
  '760',
  '805',
  '818',
  '820',
  '831',
  '858',
  '909',
  '916',
  '925',
  '949',
  '951',
  '303',
  '719',
  '720',
  '970',
  '203',
  '475',
  '860',
  '959',
  '302',
  '239',
  '305',
  '321',
  '352',
  '386',
  '407',
  '561',
  '727',
  '754',
  '786',
  '813',
  '850',
  '863',
  '904',
  '941',
  '954',
  '229',
  '404',
  '470',
  '478',
  '678',
  '706',
  '770',
  '912',
  '808',
  '208',
  '217',
  '224',
  '309',
  '312',
  '331',
  '618',
  '630',
  '708',
  '773',
  '815',
  '847',
  '872',
  '219',
  '260',
  '317',
  '765',
  '812',
  '319',
  '515',
  '563',
  '641',
  '712',
  '316',
  '620',
  '785',
  '913',
  '270',
  '364',
  '502',
  '606',
  '859',
  '225',
  '318',
  '337',
  '504',
  '985',
  '207',
  '240',
  '301',
  '410',
  '443',
  '667',
  '339',
  '351',
  '413',
  '508',
  '617',
  '774',
  '781',
  '857',
  '978',
  '231',
  '248',
  '269',
  '313',
  '517',
  '586',
  '616',
  '734',
  '810',
  '906',
  '947',
  '989',
  '218',
  '320',
  '507',
  '612',
  '651',
  '763',
  '952',
  '228',
  '601',
  '314',
  '417',
  '573',
  '636',
  '660',
  '816',
  '406',
  '308',
  '402',
  '702',
  '725',
  '775',
  '603',
  '201',
  '551',
  '609',
  '732',
  '848',
  '856',
  '862',
  '908',
  '973',
  '505',
  '575',
  '212',
  '315',
  '332',
  '347',
  '516',
  '518',
  '607',
  '631',
  '646',
  '680',
  '716',
  '718',
  '845',
  '914',
  '917',
  '929',
  '934',
  '252',
  '336',
  '704',
  '743',
  '828',
  '910',
  '919',
  '980',
  '984',
  '701',
  '216',
  '220',
  '234',
  '330',
  '380',
  '419',
  '440',
  '513',
  '567',
  '614',
  '740',
  '937',
  '405',
  '580',
  '918',
  '458',
  '503',
  '541',
  '971',
  '215',
  '267',
  '412',
  '445',
  '484',
  '570',
  '610',
  '717',
  '724',
  '814',
  '878',
  '401',
  '803',
  '843',
  '864',
  '605',
  '423',
  '615',
  '731',
  '865',
  '901',
  '931',
  '210',
  '214',
  '254',
  '281',
  '325',
  '361',
  '409',
  '430',
  '432',
  '469',
  '512',
  '682',
  '713',
  '726',
  '737',
  '806',
  '817',
  '830',
  '832',
  '903',
  '915',
  '936',
  '940',
  '956',
  '972',
  '979',
  '385',
  '435',
  '801',
  '802',
  '276',
  '434',
  '540',
  '571',
  '703',
  '757',
  '804',
  '206',
  '253',
  '360',
  '425',
  '509',
  '564',
  '202',
  '304',
  '681',
  '262',
  '414',
  '608',
  '715',
  '920',
  '307',
  '684',
  '671',
  '787',
  '939',
  '340',
  '989',
];

export const getRandomArea = () =>
  areas[Math.floor(Math.random() * areas.length)];

export const getDateTimeForName = () => {
  const date = new Date(); // Lấy ngày hiện tại
  const year = date.getFullYear().toString(); // Lấy năm dưới dạng chuỗi
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng dưới dạng chuỗi và đồng thời thêm số 0 vào trước nếu tháng chỉ có 1 chữ số
  const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày dưới dạng chuỗi và đồng thời thêm số 0 vào trước nếu ngày chỉ có 1 chữ số
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${year}${month}${day}_${hour}${minute}${seconds}_${milliseconds}`;
};

export const getDateForName = () => {
  const date = new Date(); // Lấy ngày hiện tại
  const year = date.getFullYear().toString(); // Lấy năm dưới dạng chuỗi
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng dưới dạng chuỗi và đồng thời thêm số 0 vào trước nếu tháng chỉ có 1 chữ số
  const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày dưới dạng chuỗi và đồng thời thêm số 0 vào trước nếu ngày chỉ có 1 chữ số
  return `${year}${month}${day}`;
};

export const getTimeoutRandom = () => {
  const randomTimeouts = [
    500, 750, 200, 100, 1000, 500, 570, 300, 400, 550, 900, 999, 888, 920,
  ];
  return randomTimeouts[Math.floor(Math.random() * randomTimeouts.length)];
};


export const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));