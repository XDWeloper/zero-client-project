import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainScreenComponent} from "./component/main-screen/main-screen.component";
import {BrowserModule} from "@angular/platform-browser";
import {LoginComponent} from "./oauth2/login/login.component";


const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'main', component: MainScreenComponent},
  {path: 'admin', loadChildren: () => import('./module/admin/admin.module').then(m => m.AdminModule)},
  {path: 'operator', loadChildren: () => import('./module/operator/operator.module').then(m => m.OperatorModule)},
  {path: 'client', loadChildren: () => import('./module/client/client.module').then(m => m.ClientModule)},
  {path: 'register', loadChildren: () => import('./module/register/register.module').then(m => m.RegisterModule)},
  {path: 'lossPass', loadChildren: () => import('./module/loss-pass/loss-pass.module').then(m => m.LossPassModule)},
  {path: 'login', redirectTo: '/', pathMatch: 'full'},
  {path: 'index', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
