import {Component} from '@angular/core';
import {AddressService} from "../../services/address.service";


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent {
  region: string = ""
  regionError = false

  constructor(public addressService: AddressService) {
  }

  inputRegion($event: Event) {
    this.inputRegion1($event)
    if (this.region.length == 0)
      this.regionError = false
    else
      this.regionError = this.addressService.getAllRegion().map(r => `${r.regionCode} - ${r.name}`).find(s => s == this.region) === undefined

  }

  inputRegion1($event: Event) {
    let e = $event.target as HTMLInputElement
  }
}
