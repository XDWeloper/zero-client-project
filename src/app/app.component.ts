import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {KeycloakService} from "./services/keycloak.service";
import {Router} from "@angular/router";
import {SpinnerService} from "./services/spinner.service";
import {Subscription} from "rxjs";
import {TimeService} from "./services/time.service";
import {APP_VERSION} from "./constants";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'zero-client-project';
  isDark: any;
  cookieEnabled: boolean;
  isSpiner = false
  spinnerService$: Subscription
  app_version = APP_VERSION
  isBlock: boolean = false;

  constructor(private keycloakService: KeycloakService,
              private router: Router,
              private spinnerService: SpinnerService,
              private changeDetection: ChangeDetectorRef,
              private timeService: TimeService) {
    //window.onbeforeunload
  }

  ngOnInit(): void {
    this.isDark = localStorage.getItem("theme") == "dark"

    this.cookieEnabled = navigator.cookieEnabled;

    if (!this.cookieEnabled) {
      document.cookie = 'testcookie';
      this.cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
    }
    this.spinnerService$ = this.spinnerService.visibility.subscribe({
      next: (res => {
        this.isSpiner = res
        this.changeDetection.detectChanges()
      })
    })

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
