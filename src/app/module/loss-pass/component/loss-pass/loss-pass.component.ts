import {Component, OnDestroy} from '@angular/core';
import {TimeService} from "../../../../services/time.service";
import {DialogButtonType, LoginPasswordProperties, OtpResult} from "../../../../interfaces/interfaces";
import {
  ERROR,
  INFO,
  PASSWORD_PROP, PIN_CONFIRM_TIMEOUT,
  REGISTRATION_CONFIRM, REGISTRATION_CONFIRM_ERROR,
  RESET_PASS_ERROR, RESET_PASS_SUCCESS
} from "../../../../constants";
import {BackendService} from "../../../../services/backend.service";
import {MessageService} from "../../../../services/message.service";
import {interval, Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-loss-pass',
  templateUrl: './loss-pass.component.html',
  styleUrls: ['./loss-pass.component.css']
})
export class LossPassComponent implements OnDestroy{
  private _phone: string;
  private _password: any;
  private _dPassword: any;

  private _phone_error: string  = undefined
  private _password_error: string  = undefined
  private _dPassword_error: string  = undefined

  private isPasswordTouched = false
  private isDPasswordTouched = false
  private isPhoneTouched = false

  loginPasswordProperties: LoginPasswordProperties
  isFieldsInvalid: boolean = true
  private loginPattern: RegExp
  private passwordPattern: RegExp
  private readonly passwordRequirements$: Subscription
  private userRegistration$: Subscription
  private userConfirmResetPassword$: Subscription
  private interval$: Subscription

  private _pinResult: OtpResult | undefined
  pinCode: any;
  confirmButtonText: string = "Подтвердить";
  private otpTimer = 0

  constructor(private timeService: TimeService,
              private backService: BackendService,
              private messageService: MessageService,
              private router: Router) {
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
    if(this.userConfirmResetPassword$)
      this.userConfirmResetPassword$.unsubscribe()
    if(this.interval$)
      this.interval$.unsubscribe()
  }

  get phone(): any {
    return this._phone;
  }

  set phone(value: any) {
    this._phone = "7" + value;
    this.isPhoneTouched = true
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

  get pinResult(): OtpResult | undefined {
    return this._pinResult;
  }

  set pinResult(value: OtpResult | undefined) {
    this._pinResult = value;
    if(value) {
      this.otpTimer = value.otpTime
      this.startTimer()
    }
  }

  get dPassword_error(): string {
    return this._dPassword_error;
  }

  set dPassword_error(value: string) {
    this._dPassword_error = value;
  }

  get password_error(): string {
    return this._password_error;
  }

  set password_error(value: string) {
    this._password_error = value;
  }

  get phone_error(): string {
    return this._phone_error;
  }

  set phone_error(value: string) {
    this._phone_error = value;
  }

  validateFields() {
    if (this.phone != undefined  && !this.loginPattern.test(this.phone))
      this._phone_error = "Не верный логин"
    else
      this._phone_error = undefined
    if(this.password != undefined && !this.passwordPattern.test(this.password))
      this._password_error = "Пароль не соответствует требованиям"
    else
      this._password_error = undefined
    if(this.isDPasswordTouched && this.dPassword != undefined && this.dPassword !== this.password)
      this._dPassword_error = "Пароли не совпадают"
    else
      this._dPassword_error = undefined


    this.isFieldsInvalid = !((this.isPhoneTouched && this._phone_error === undefined)
                            && (this.isPasswordTouched && this._password_error === undefined))
  }

  register() {
    this.userRegistration$ = this.backService.userRegistration(this._phone, "RESET_PASSWORD").subscribe({
      next: ((res: OtpResult) => {
        this.pinResult = res
      }),
      error: (err => {
        this.messageService.show(RESET_PASS_ERROR, err.error.message, ERROR)
      })
    })
  }

  confirm() {
    let resetRequest = {
      otpCode: this.pinCode,
      phone: this._phone,
      newPassword: this._password
    }

    this.userConfirmResetPassword$ = this.backService.resetPassword(resetRequest).subscribe({
      next: (res => {
        if(res.status === 200)
        this.messageService.show(RESET_PASS_SUCCESS, "Вы можете осуществить вход в приложение используя новый пароль", INFO).subscribe({
          next: ((res:DialogButtonType) => {
            this.pinResult = undefined
            this.router.navigate([''])
          })
        })
        else
          this.messageService.show(RESET_PASS_ERROR, "Сервер вернул статус: " + res.status, ERROR).subscribe({
            next: ((res:DialogButtonType) => {
              this.pinResult = undefined
              this.router.navigate([''])
            })
          })
      }),
      error: (err => {
        this.messageService.show(RESET_PASS_ERROR, err.error.message, ERROR).subscribe({
          next: ((res:DialogButtonType) => {
            this.pinResult = undefined
            this.router.navigate([''])
          })
        })
      })
    })
  }

  startTimer() {
    this.interval$ = interval(1000).subscribe( () => {
        this.otpTimer = this.otpTimer - 1000
        let sec = "" + Math.round((this.otpTimer/1000))%60
        if(sec.length < 2) sec = "0" + sec
        this.confirmButtonText = "" + Math.trunc(Math.round((this.otpTimer/1000))/60) + ":" + sec
      if(this.otpTimer < 0){
        this.interval$.unsubscribe()
        this.messageService.show(PIN_CONFIRM_TIMEOUT, "Запросите пин-код повторно", INFO).subscribe({
          next: ((res:DialogButtonType) => {
            this.pinResult = undefined
          })
        })
      }
      }
    )

  }

}
