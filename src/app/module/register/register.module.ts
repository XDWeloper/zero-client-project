import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import { RegisterComponent } from './component/register/register.component';
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxMaskDirective} from "ngx-mask";
import {IceInputComponent} from "../share-component/ice-input/ice-input.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";

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
        MatSlideToggleModule,
        MatTooltipModule,
    ]
})
export class RegisterModule { }
