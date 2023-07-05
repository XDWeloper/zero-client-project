import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import { RegisterComponent } from './component/register/register.component';
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxMaskDirective} from "ngx-mask";
import {IceInputComponent} from "../share-component/ice-input/ice-input.component";

@NgModule({
    declarations: [
        RegisterComponent,
    ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: RegisterComponent}
    ]),
    MatInputModule,
    FormsModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    IceInputComponent,
  ]
})
export class RegisterModule { }
