import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MasterControlPropComponent} from "../master-control-prop/master-control-prop.component";

@Component({
  selector: 'app-table-prop',
  templateUrl: './table-prop.component.html',
  styleUrls: ['./table-prop.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TablePropComponent {


  constructor(public dialogRef: MatDialogRef<MasterControlPropComponent>) {
  }
}
