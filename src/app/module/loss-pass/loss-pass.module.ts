import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LossPassComponent } from './component/loss-pass/loss-pass.component';
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgxMaskDirective} from "ngx-mask";
import {IceInputComponent} from "../share-component/ice-input/ice-input.component";



@NgModule({
  declarations: [
    LossPassComponent,
  ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: '', component: LossPassComponent}
        ]),
        FormsModule,
        NgxMaskDirective,
        IceInputComponent,
    ]
})
export class LossPassModule { }
