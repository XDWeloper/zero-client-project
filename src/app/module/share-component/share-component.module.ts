import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IceInputComponent} from "./component/ice-input/ice-input.component";
import {NgxMaskDirective} from "ngx-mask";
import {FormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    IceInputComponent
  ],
  imports: [
    CommonModule,
    NgxMaskDirective,
    FormsModule,
  ],
  exports: [
    IceInputComponent
  ]
})
export class ShareComponentModule { }
