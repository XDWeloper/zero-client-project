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

    searchRegionForName(name: string,level: number, sort: string,parentObjId: number, serviceName: string, searchFieldName: string){
      const operation = new Operation();
      operation.url = environment.resourceServerURL + `/fias/${serviceName}?${sort ? 'sort=' + sort: ''}&size=20&page=0` +
        `${level ? '&level='+ level : ''}` +
        `&parentObjId=${parentObjId}&${searchFieldName}=${name}`
      operation.httpMethod = HttpMethod.GET;
      return  this.httpClient.post<any>(environment.bffURI + '/operation', operation)
    }

  getAllRegion(page: number,level: number, sort: string,parentObjId: number, serviceName: string): Observable<Pageable>{
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/fias/${serviceName}?${sort ? 'sort=' + sort: ''}&size=20&page=${page}` +
      `${level ? '&level='+ level : ''}` +
      `&parentObjId=${parentObjId}`
    operation.httpMethod = HttpMethod.GET;
    return  this.httpClient.post<any>(environment.bffURI + '/operation', operation)
  }

  getNextLevel(objectId: number): Observable<number[]>{
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/fias/addrobj/levels/${objectId}`
    operation.httpMethod = HttpMethod.GET;
    return  this.httpClient.post<number[]>(environment.bffURI + '/operation', operation)
  }



}
