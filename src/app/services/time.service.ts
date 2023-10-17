import {Injectable} from '@angular/core';
import {interval, Subscription} from "rxjs";
import {KeycloakService} from "./keycloak.service";
import {Router} from "@angular/router";
import {fiveMin, freeMin} from "../constants";

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  lastRequestTime: number
  lastTokenUpdate: number = 0
  inter: Subscription
  isBlocked = false
  isRefreshToken = true
  isLogout = true

  constructor(private keyCloakService: KeycloakService, private router: Router) {
    this.lastRequestTime = new Date().getTime()
    this.lastTokenUpdate = new Date().getTime()
  }

  setLastTime() {
    this.lastRequestTime = new Date().getTime()

    if (this.isBlocked) {
      this.isBlocked = false
      return
    }
    if (this.inter) {
      this.inter.unsubscribe()
      this.inter.remove(null)
    }

    this.inter = interval(10_000).subscribe(() => {
      let newTime = new Date().getTime()
      if (newTime - this.lastRequestTime > fiveMin && this.isLogout) {
        this.keyCloakService.logoutAction().subscribe({
          complete: () => this.router.navigate(['/'])
        })
      }
      if (newTime - this.lastTokenUpdate > freeMin && this.isRefreshToken) {
        this.isBlocked = true
        this.keyCloakService.exchangeRefreshToken().subscribe({
          next: () => {
            this.lastTokenUpdate = newTime
          },
          error: () => {this.lastRequestTime = 0}
        })
      }
    })
  }
}
