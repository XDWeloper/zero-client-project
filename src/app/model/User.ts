/*

 Для хранения данных пользователя
 Можно получать любые поля с сервера авторизации и добавлять их сюда для отображения на клиенте

*/


import {Role} from "../interfaces/interfaces";

export class User {
  sub: string
  email_verified: boolean
  preferred_username: string
  given_name: string
  name: string
  family_name: string
  email: string
  roles: Role[]
}
