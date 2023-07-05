import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {editorConfig} from "../../../../constants";

@Component({
  selector: 'app-edit-text',
  templateUrl: './edit-text.component.html',
})
export class EditTextComponent {

  editorConfig: any;
  private _htmlContent: string
  private _startValue: string


  set startValue(value: string) {
    this._startValue = value;
    this.htmlContent = value
  }

  get startValue(): string {
    return this._startValue;
  }

  @Output()
  text = new EventEmitter()

  set htmlContent(value: string) {
    this._htmlContent = value;
    this.text.emit(value)
  }

  get htmlContent(): string {
    return this._htmlContent;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {
    this.editorConfig = editorConfig
  }

}
