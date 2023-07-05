import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-ice-input',
  templateUrl: './ice-input.component.html',
})
export class IceInputComponent {
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
  }

  showEye() {
    this.show = !this.show
  }

}
