import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {HttpMethod, Operation} from "../model/RequestBFF";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {PlaceObject} from "../interfaces/interfaces";

@Injectable({
  providedIn: 'root'
})
export class AddressService implements OnInit{

  public regionList$:Observable<any>

  constructor(private httpClient: HttpClient) {

  }

  ngOnInit(): void {
    }

  getAllRegion(): Observable<PlaceObject[]>{
    if(this.regionList$) return this.regionList$.pipe(
      map(data => data === null ? [] : data.content)
    )

    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/fias/addrobj?sort=regionCode,asc&page=0&size=100"
    operation.httpMethod = HttpMethod.GET;
    this.regionList$ = this.httpClient.post(environment.bffURI + '/operation', operation)
    return this.regionList$.pipe(
      map(data => data === null ? [] : data.content)
    )
  }
}
