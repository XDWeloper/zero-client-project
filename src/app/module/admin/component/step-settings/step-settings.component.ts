import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-step-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule],
  templateUrl: './step-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepSettingsComponent {


  constructor(public dialogRef: MatDialogRef<StepSettingsComponent>) {
  }

  SaveAndClose() {

  }
}
