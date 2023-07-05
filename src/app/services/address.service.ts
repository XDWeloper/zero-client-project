import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Region} from "../interfaces/interfaces";

@Injectable({
  providedIn: 'root'
})
export class AddressService implements OnInit{
  private region: Array<Region> = [
    {id:1,name: "Адыгея",regionCode: "01"},
    {id:1,name: "Республика Башкортостан",regionCode: "02"},
    {id:1,name: "Республика Бурятия",regionCode: "03"},
    {id:1,name: "Республика Алтай",regionCode: "04"}
  ]

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    }





  getAllRegion(){
    return this.region
  }
}
