import {Component, HostListener, OnInit} from '@angular/core';
import {KeycloakService} from "./services/keycloak.service";
import {Router} from "@angular/router";
import {SpinnerService} from "./services/spinner.service";
import {Subscription} from "rxjs";
import {TimeService} from "./services/time.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'zero-client-project';
  isDark: any;
  cookieEnabled: boolean;
  isSpiner = false
  spinnerService$: Subscription

  constructor(private keycloakService: KeycloakService,
              private router: Router,
              private spinnerService: SpinnerService,
              private timeService: TimeService) {
    window.onbeforeunload
    this.spinnerService$ = this.spinnerService.visibility.subscribe({
      next: (res => this.isSpiner = res)
    })
  }

  ngOnInit(): void {
    this.isDark = localStorage.getItem("theme") == "dark"

    this.cookieEnabled = navigator.cookieEnabled;

    if (!this.cookieEnabled) {
      document.cookie = 'testcookie';
      this.cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
    }
  }

  ThemeToggle() {
    this.isDark = !this.isDark
    localStorage.setItem("theme", this.isDark ? "dark" : "light")
  }
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnloadHander(event: any) {
    this.exit()
  }

  exit() {
    this.keycloakService.logoutAction().subscribe({
      next: value => this.router.navigate(["/"]),
      error: err => this.router.navigate(["/"]),
      complete:(() => this.router.navigate(["/"]))
    })
  }

  @HostListener('window:mousemove',['$event'])
  drag($event: MouseEvent) {
    this.timeService.setLastTime()
  }

  }
