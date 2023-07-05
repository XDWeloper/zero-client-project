export class Operation {
  httpMethod: HttpMethod; // тип метода для вызова
  url: string; // какой адрес BFF будет вызывать у Resource Server
  body: any; // вложения запроса (конвертируется автоматически в JSON)
}

export enum HttpMethod {
  GET,
  HEAD,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS,
  TRACE
}
