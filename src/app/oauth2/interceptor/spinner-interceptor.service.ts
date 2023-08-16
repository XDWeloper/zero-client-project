import {debounce, interval, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {SpinnerService} from "../../services/spinner.service";
import {TimeService} from "../../services/time.service";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private spinnerService: SpinnerService, private timeService: TimeService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(!this.timeService.isBlocked)
      this.spinnerService.show();

    return next.handle(req)
      .pipe(
        tap({
          next:
            (event: HttpEvent<any>) => {
              // if (event instanceof HttpResponse) {
              //   this.spinnerService.hide();
              // }
            },
          error: (error) => {
            //this.spinnerService.hide();
          },
          complete: () => this.spinnerService.hide()
        })
      );
  }
}



