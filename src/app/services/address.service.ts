import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {HttpMethod, Operation} from "../model/RequestBFF";
import {environment} from "../../environments/environment";
import {Pageable} from "../interfaces/interfaces";

@Injectable({
  providedIn: 'root'
})
export class AddressService implements OnInit{

  constructor(private httpClient: HttpClient) {

  }

  ngOnInit(): void {
    }

    searchRegionForName(name: string){
      const operation = new Operation();
      operation.url = environment.resourceServerURL + "/fias/addrobj?sort=regionCode,asc&page=0&size=20&name=" + name
      operation.httpMethod = HttpMethod.GET;
      return  this.httpClient.post<any>(environment.bffURI + '/operation', operation)
    }

  getAllRegion(page: number,level: number, sort: string): Observable<Pageable>{
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/fias/addrobj?sort=${sort}&size=20&page=${page}&level=${level}`
    operation.httpMethod = HttpMethod.GET;
    return  this.httpClient.post<any>(environment.bffURI + '/operation', operation)
  }
}
