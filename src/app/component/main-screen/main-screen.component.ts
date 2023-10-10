import {Component, OnInit} from '@angular/core';
import {BackendService} from "../../services/backend.service";
import {Router} from "@angular/router";
import {User} from "../../model/User";
import {SpinnerService} from "../../services/spinner.service";
import {ERROR} from "../../constants";
import {MessageService} from "../../services/message.service";

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
})
export class MainScreenComponent implements OnInit {

  constructor(
    public spinnerService: SpinnerService,
    private backendService: BackendService,
    private router: Router,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {

    this.backendService.requestUserProfile().subscribe(
      {
        next: ((res:User) => {

          localStorage.setItem("user", JSON.stringify(res))
          let adminRole = res.roles.findIndex(r => r === "ROLE_admin")
          let operRole = res.roles.findIndex(r => r === "ROLE_operator")
          let userRole = res.roles.findIndex(r => r === "ROLE_user")

          if (adminRole !== -1) this.router.navigate(["/admin"])
          else if (userRole !== -1) this.router.navigate(["/client"])
          else if (operRole !== -1) this.router.navigate(["/operator"])

        }),
        error: (err => {//Нужно сделать сообщение, что что-то не так и скинуть на логин
          this.messageService.show("Ошибка получения роли пользователя", err.error.message, ERROR).subscribe(value => {
            this.redirectLoginPage()
          })
        }),
      }
    );
  }

  private redirectLoginPage(): void {
      this.router.navigate([''])
  }

}
