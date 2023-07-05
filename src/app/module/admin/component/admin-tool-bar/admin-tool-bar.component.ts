import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-admin-tool-bar',
  templateUrl: './admin-tool-bar.component.html',
})
export class AdminToolBarComponent {

  @Output()
  clickButton = new EventEmitter<string>()

  buttonClick(button: string){
    this.clickButton.emit(button)
  }

}
