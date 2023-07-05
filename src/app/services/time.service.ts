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

  constructor(private keyCloakService: KeycloakService, private router: Router) {
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

    this.inter = interval(10_000).subscribe((r) => {
      let newTime = new Date().getTime()
        console.log(fiveMin - (newTime - this.lastRequestTime))
      if (newTime - this.lastRequestTime > fiveMin) {
        this.keyCloakService.logoutAction().subscribe({
          next: value => {},
          error: err => {},
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
