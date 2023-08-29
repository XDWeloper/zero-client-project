import {Component, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BackendService} from "../../../../services/backend.service";
import {DialogButtonType, LoginPasswordProperties, OtpResult} from "../../../../interfaces/interfaces";
import {Subscription} from "rxjs";
import {
  ERROR,
  INFO,
  PASSWORD_PROP,
  REGISTRATION_CONFIRM,
  REGISTRATION_CONFIRM_ERROR,
  REGISTRATION_DATA
} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";
import {Router} from "@angular/router";
import {TimeService} from "../../../../services/time.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnDestroy {
  private _phone: any;
  private _name: any;
  private _lastName: any;
  private _eMail: string;
  private _password: any;
  private _dPassword: any;
  pinResult: OtpResult | undefined
  pinCode: any;
  isFieldsInvalid: boolean = true
  loginPasswordProperties: LoginPasswordProperties

  private passwordRequirements$: Subscription
  private userRegistration$: Subscription
  private userConfirmRegistration$: Subscription
  private eMailPattern = new RegExp("^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$");
  private loginPattern: RegExp
  private passwordPattern: RegExp

  phone_error: string  = undefined
  name_error: string  = undefined
  lastName_error: string  = undefined
  eMail_error: string  = undefined
  password_error: string  = undefined
  dPassword_error: string  = undefined

  isPhoneTouched = false
  isNameTouched = false
  isLastNameTouched = false
  isEMailTouched = false
  isPasswordTouched = false
  isDPasswordTouched = false




  constructor(private httpClient: HttpClient,
              private backService: BackendService,
              private messageService: MessageService,
              private router: Router,
              private timeService: TimeService) {
    /**Запретить обновление токенов*/
    timeService.isRefreshToken = false
    /**Получить требования к паролю*/
    this.passwordRequirements$ = backService.passwordRequirements().subscribe({
      next: (res => {
        this.loginPasswordProperties = res
        if(res.loginRegExpString)
          this.loginPattern = new RegExp(res.loginRegExpString.replaceAll("\Q","").replaceAll("\\E",""))
         if(res.passwordRegExpMaskedString)
           this.passwordPattern = new RegExp(res.passwordRegExpMaskedString.replaceAll("\Q","").replaceAll("\\E",""))
      }),
      error: (err => {
        this.messageService.show(PASSWORD_PROP, err.error.message, ERROR)
      })
    })
  }

  ngOnDestroy(): void {
    if(this.passwordRequirements$)
      this.passwordRequirements$.unsubscribe()
    if(this.userRegistration$)
      this.userRegistration$.unsubscribe()
    if(this.userConfirmRegistration$)
      this.userConfirmRegistration$.unsubscribe()
  }


  register() {
    this.userRegistration$ = this.backService.userRegistration(this._phone, "REGISTRATION").subscribe({
      next: ((res: OtpResult) => {
          this.pinResult = res
      }),
      error: (err => {
        this.messageService.show(REGISTRATION_DATA, err.error.message, ERROR)
      })
    })
  }

  confirm() {
    let userRequest = {
      otpCode: this.pinCode,
      name: this._phone,
      given_name: this._name,
      family_name: this._lastName,
      email: this._eMail,
      password: this._password
    }

    this.userConfirmRegistration$ = this.backService.userConfirmRegistration(userRequest).subscribe({
      next: (res => {
        this.messageService.show(REGISTRATION_CONFIRM, "", INFO).subscribe({
          next: ((res:DialogButtonType) => {
            this.pinResult = undefined
            this.router.navigate([''])
          })
        })      }),
      error: (err => {
        this.messageService.show(REGISTRATION_CONFIRM_ERROR, err.error.message, ERROR).subscribe({
          next: ((res:DialogButtonType) => {
            if(err.error.status != 406){
              this.pinResult = undefined
              this.router.navigate([''])
            }
          })
        })
      })
    })
  }

  get phone(): any {
    return this._phone;
  }

  set phone(value: any) {
    this._phone = "7" + value;
    this.isPhoneTouched = true
    this.validateFields()
  }

  get name(): any {
    return this._name;
  }

  set name(value: any) {
    this._name = value;
    this.isNameTouched = true
    this.validateFields()
  }

  get lastName(): any {
    return this._lastName;
  }

  set lastName(value: any) {
    this._lastName = value;
    this.isLastNameTouched = true
    this.validateFields()
  }

  get eMail(): string {
    return this._eMail;
  }

  set eMail(value: string) {
    this._eMail = value;
    this.isEMailTouched = true
    this.validateFields()
  }

  get password(): any {
    return this._password;
  }

  set password(value: any) {
    this._password = value;
    this.isPasswordTouched = true
    this.validateFields()
  }

  get dPassword(): any {
    return this._dPassword;
  }

  set dPassword(value: any) {
    this.isDPasswordTouched = true
    this._dPassword = value;
    this.validateFields()
  }

  validateFields() {

    if (this.phone != undefined  && !this.loginPattern.test(this.phone))
      this.phone_error = "Не верный логин"
    else
      this.phone_error = undefined

    if (this.name != undefined && this.name.length < 1)  this.name_error = "Обязательное поле"
    else this.name_error = undefined

    if (this.lastName != undefined && this.lastName.length < 1)  this.lastName_error = "Обязательное поле"
    else this.lastName_error = undefined

    if(this.eMail != undefined && !this.isValidEmail(this.eMail))
      this.eMail_error = "Неверный электронный адрес"
    else
      this.eMail_error = undefined

    if(this.password != undefined && !this.passwordPattern.test(this.password))
      this.password_error = "Пароль не соответствует требованиям"
    else
      this.password_error = undefined

    if(this.isDPasswordTouched && this.dPassword != undefined && this.dPassword !== this.password)
      this.dPassword_error = "Пароли не совпадают"
    else
      this.dPassword_error = undefined

    this.isFieldsInvalid = !((this.isPhoneTouched && this.phone_error === undefined)
                            && (this.isNameTouched && this.name_error === undefined)
                            && (this.isLastNameTouched && this.lastName_error === undefined)
                            && (this.isEMailTouched && this.eMail_error === undefined)
                            && (this.isPasswordTouched && this.password_error === undefined)
                            && (this.isDPasswordTouched && this.dPassword_error === undefined))

  }

  isValidEmail(emailString: string): boolean {
    try {
      let valid = this.eMailPattern.test(emailString);
      return valid;
    } catch (TypeError) {
      return false;
    }
  }
}
