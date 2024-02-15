import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {NgxMaskDirective} from "ngx-mask";
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";
import {AsyncPipe, NgClass, NgIf} from "@angular/common";

const regexURL = new RegExp("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\{0}'\\(\\)\\*\\+,;=.]+$")
const ERL_ERROR_TEXT = "Не верный URL запроса"

@Component({
  standalone: true,
  selector: 'app-ice-input',
  templateUrl: './ice-input.component.html',
  imports: [
    NgxMaskDirective,
    FormsModule,
    NgIf,
    NgClass,
    AsyncPipe
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IceInputComponent),
    multi: true
  }]
})
export class IceInputComponent implements ControlValueAccessor, OnInit{

  localLabel = ""
  private _localValue: any
  private _label: string
  show: boolean = true;


  @Input()
  set label(value: string){
    this._label = value
    this.localLabel = value
  }


  @Input()
  inputType: string
  @Output()
  value = new EventEmitter

  @Input()
  toolTip: any;
  @Input()
  disabled: boolean;
  @Input()
  readonly : boolean;
  @Output()
  isValid = new EventEmitter<boolean>(false)
  @Input()
  errorText: string

  ngOnInit() {
    setTimeout(() => {this.checkValue(this.localValue)}, 500)
  }


  get localValue() {
    return this._localValue;
  }

  set localValue(value) {
    if (this.inputType === "email")
      this._localValue = value;

    this.value.emit(value)
    this.onChange(value)

    this.checkValue(value)
  }

  checkValue(value: any){
    if(this.inputType === 'url'){
      let isValidUrl = regexURL.test(value)
      this.localLabel = isValidUrl ? this._label : ERL_ERROR_TEXT
      this.isValid.next(isValidUrl)
    } else {
      this.isValid.next(true)
    }

  }

  onChange(_: any) {
  }

  showEye() {
    this.show = !this.show
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    this._localValue = obj
  }

}
