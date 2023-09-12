import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StepTreeTempl} from "../../../../interfaces/interfaces";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-admin-tool-bar',
  templateUrl: './admin-tool-bar.component.html',
})
export class AdminToolBarComponent {



  @Output()
  clickButton = new EventEmitter<string>()

  @Input()
  currentStep: StepTreeTempl

  buttonClick(button: string){
    this.clickButton.emit(button)
  }

  change($event: MatSlideToggleChange) {
    this.clickButton.emit("changed")
  }
}
