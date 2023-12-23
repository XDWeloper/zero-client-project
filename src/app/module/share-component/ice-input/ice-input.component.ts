import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {NgxMaskDirective} from "ngx-mask";
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-ice-input',
  templateUrl: './ice-input.component.html',
  imports: [
    NgxMaskDirective,
    FormsModule,
    NgIf
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IceInputComponent),
    multi: true
  }]
})
export class IceInputComponent implements ControlValueAccessor{
  @Input()
  label: string
  @Input()
  inputType: string
  @Output()
  value = new EventEmitter
  @Input()
  errorText: any;

  private _localValue: any
  show: boolean = true;
  @Input()
  toolTip: any;


  get localValue() {
    return this._localValue;
  }

  set localValue(value) {
    if (this.inputType === "email")
      this._localValue = value;
    this.value.emit(value)
    this.onChange(value)
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
