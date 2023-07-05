import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainScreenComponent} from './component/main-screen/main-screen.component';
import {AddressComponent} from './component/adress/address.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from '@angular/material/input';
import {AngularSplitModule} from "angular-split";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MAT_DIALOG_DEFAULT_OPTIONS} from "@angular/material/dialog";
import {WatchTemplateComponent} from './module/admin/component/watch-template/watch-template.component';
import {MatStepperModule} from "@angular/material/stepper";
import {TextComponent} from "./component/dinamicComponent/text/text.component";
import {AreaComponent} from "./component/dinamicComponent/area/area.component";
import {InputComponent} from "./component/dinamicComponent/input/input.component";
import {
  InformationCompanyParticipantsTableComponent
} from "./component/dinamicComponent/tables/information-company-participants-table/information-company-participants-table.component";
import {
  InformationMainCounterpartiesTableComponent
} from "./component/dinamicComponent/tables/information-main-counterparties-table/information-main-counterparties-table.component";
import {ClientModule} from "./module/client/client.module";
import {LoginComponent} from "./oauth2/login/login.component";
import {SpinnerInterceptor} from "./oauth2/interceptor/spinner-interceptor.service";
import {CookiesInterceptor} from "./oauth2/interceptor/cookies-interceptor.service";
import { MessageDialogComponent } from './component/message-dialog/message-dialog.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {NgxMaskDirective, provideEnvironmentNgxMask} from "ngx-mask";
import { UploadComponent } from './component/dinamicComponent/upload/upload.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainScreenComponent,
    AddressComponent,
    WatchTemplateComponent,
    TextComponent,
    AreaComponent,
    InputComponent,
    InformationCompanyParticipantsTableComponent,
    InformationMainCounterpartiesTableComponent,
    MessageDialogComponent,
    UploadComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AngularSplitModule,
    DragDropModule,
    MatStepperModule,
    ClientModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    NgxMaskDirective
  ],
  providers: [
    provideEnvironmentNgxMask(),
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},

    /* нужно указывать для корректной работы диалоговых окон */
    {
      provide: HTTP_INTERCEPTORS, // все HTTP запросы будут отправлять защищенные куки
      useClass: CookiesInterceptor,
      multi: true
    },

    {
      provide: HTTP_INTERCEPTORS, // все HTTP запросы будут выполняться с отображением индикатора загрузки
      useClass: SpinnerInterceptor,
      multi: true
    },
  ],
    exports: [
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
