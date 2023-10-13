import {Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {Observable, Subject, Subscription} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {
  MasterControlPropComponent
} from "../../module/admin/component/master-control-prop/master-control-prop.component";

@Component({
  selector: 'app-status-reason',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './status-reason.component.html',
  styleUrls: ['./status-reason.component.css']
})
export class StatusReasonComponent {

  localReason: string;
  constructor(public dialogRef: MatDialogRef<MasterControlPropComponent>) {}

  save() {
    this.dialogRef.close(this.localReason)
  }
}
