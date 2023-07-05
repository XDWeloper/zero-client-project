import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IceComponentType} from "../../../../constants";

@Component({
  selector: 'app-right-click-menu',
  templateUrl: './right-click-menu.component.html',
})
export class RightClickMenuComponent implements OnInit{
  @Input() x = 0;
  @Input() y = 0;
  @Input() CompType: IceComponentType

  @Output() type = new EventEmitter


  click(type: string) {
    this.type.emit(type)
  }

  ngOnInit(): void {
    this.x -=10
    this.y -=10

  }
}
