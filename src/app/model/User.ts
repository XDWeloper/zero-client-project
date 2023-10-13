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
