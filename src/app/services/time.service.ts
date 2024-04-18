import {Injectable, OnDestroy} from '@angular/core';
import {interval, Subscription} from "rxjs";
import {KeycloakService} from "./keycloak.service";
import {Router} from "@angular/router";
import {fiveMin, freeMin, oneHour} from "../constants";

@Injectable({
  providedIn: 'root'
})
export class TimeService implements OnDestroy{
  lastRequestTime: number
  lastTokenUpdate: number = 0
  inter: Subscription
  isBlocked = false
  isRefreshToken = true
  isLogout = true

  constructor(private keyCloakService: KeycloakService, private router: Router) {
    this.lastRequestTime = new Date().getTime()
    this.lastTokenUpdate = new Date().getTime()
    this.startInterval()
  }

  ngOnDestroy(): void {
    if (this.inter) {
      this.inter.unsubscribe()
      this.inter.remove(null)
    }
    }

  setLastTime() {
    this.lastRequestTime = new Date().getTime()
  }

  private startInterval() {
    this.inter = interval(10_000).subscribe(() => {
      let newTime = new Date().getTime()
      //console.log("logout time: " + (newTime - this.lastRequestTime))
      if (newTime - this.lastRequestTime > oneHour && this.isLogout) {
        this.keyCloakService.logoutAction().subscribe({
          complete: () => this.router.navigate(['/'])
        })
      }
      //console.log("refresh token time: " + (newTime - this.lastTokenUpdate))
      if (newTime - this.lastTokenUpdate > freeMin && this.isRefreshToken) {
        this.isBlocked = true
        this.keyCloakService.exchangeRefreshToken().subscribe({
          next: () => this.lastTokenUpdate = newTime,
          error: () => this.lastRequestTime = 0,
          complete: () =>  this.isBlocked = false
        })
      }
    })
  }


}
