
// глобальные константы для боевого режима работы приложения
export const environment = {
  production: true,
  resourceServerURL: 'https://zeroclient.cmrbank.ru:8765', // ссылка на корневой URL бэкенда
  kcClientID: 'ice-cus-client', // из настроек KeyCloak
  kcBaseURL: 'https://zero.cmrbank.ru/realms/ice-cus/protocol/openid-connect',
  //kcBaseURL: 'https://zeroclient.cmrbank.ru:8443/realms/ice-cus/protocol/openid-connect',
  bffURI: 'https://zeroclient.cmrbank.ru:8902',
  redirectURI: 'https://zeroclient.cmrbank.ru'
};

// export const environment = {
//   production: true,
//   resourceServerURL: 'https://icebitsy.online:8765', // ссылка на корневой URL бэкенда
//   kcClientID: 'ice-cus-client', // из настроек KeyCloak
//   kcBaseURL: 'https://kk.icebitsy.online/realms/ice-cus/protocol/openid-connect',
//   bffURI: 'https://icebitsy.online:8902',
//   redirectURI: 'https://icebitsy.online'
// };

// export const environment = {
//   production: true,
//   resourceServerURL: 'https://127.0.0.1:8765', // ссылка на корневой URL бэкенда
//   //frontendURL: 'https://localhost:4200', // ссылка на корневой URL фронтэнда
//   kcClientID: 'ice-cus-client', // из настроек KeyCloak
//   kcBaseURL: 'https://127.0.0.1:8443/realms/ice-cus/protocol/openid-connect',
//   bffURI: 'https://localhost:8902',
//   redirectURI: 'https://localhost:4200'
// };
