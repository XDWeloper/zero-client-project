import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainPageComponentClient} from "../operator/component/main-page/main-page-component-client.component";
import {DocumentTableComponent} from "../operator/component/document-table/document-table.component";
import {DocumentEditorComponent} from "../operator/component/document-editor/document-editor.component";
import {CellComponent} from "../operator/component/cell/cell.component";
import {MaketListComponent} from "../operator/component/maket-list/maket-list.component";
import {BankDocumentListComponent} from "../operator/component/bank-document-list/bank-document-list.component";
import {RouterModule} from "@angular/router";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDialogModule} from "@angular/material/dialog";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FormsModule} from "@angular/forms";
import {DocStatusPipe} from "../../pipe/doc-status.pipe";
import {StatusReasonComponent} from "../../component/status-reason/status-reason.component";



@NgModule({
  declarations: [
    MainPageComponentClient,
    DocumentTableComponent,
    DocumentEditorComponent,
    CellComponent,
    MaketListComponent,
    BankDocumentListComponent,
  ],
  exports: [
    CellComponent,
  ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: '', component: MainPageComponentClient}
        ]),
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        MatTabsModule,
        MatDialogModule,
        MatExpansionModule,
        MatDatepickerModule,
        FormsModule,
        DocStatusPipe,
        StatusReasonComponent
    ]
})
export class OperatorModule { }
