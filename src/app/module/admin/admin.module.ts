import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import { MainPageComponent } from './component/main-page/main-page.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatIconModule} from "@angular/material/icon";
import {AngularSplitModule} from "angular-split";
import {MatToolbarModule} from "@angular/material/toolbar";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";

import { CellComponent } from './component/cell/cell.component';
import {MatMenuModule} from "@angular/material/menu";
import { RightClickMenuComponent } from './component/right-click-menu/right-click-menu.component';
import { AdminToolBarComponent } from './component/admin-tool-bar/admin-tool-bar.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatTreeModule} from "@angular/material/tree";
import {MatButtonModule} from "@angular/material/button";
import { MaketComponent } from './component/maketComponent/maket.component';
import { DocumentComponent } from './component/document/document.component';
import { EditTextComponent } from './component/edit-text/edit-text.component';
import {MatDialogModule} from "@angular/material/dialog";
import {AngularEditorModule} from "@kolkov/angular-editor";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import { PropertiesComponent } from './component/properties/properties.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import { ChangeTableComponent } from './component/change-table/change-table.component';
import { MasterControlPropComponent } from './component/master-control-prop/master-control-prop.component';
import {MatSelectModule} from "@angular/material/select";
import { OptionListComponent } from './component/option-list/option-list.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";



@NgModule({

    declarations: [
        MainPageComponent,
        RightClickMenuComponent,
        AdminToolBarComponent,
        MaketComponent,
        DocumentComponent,
        EditTextComponent,
        PropertiesComponent,
        ChangeTableComponent,
        CellComponent,
        MasterControlPropComponent,
        OptionListComponent
    ],
    exports: [
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: '', component: MainPageComponent}
        ]),
        MatSidenavModule,
        MatIconModule,
        AngularSplitModule,
        MatToolbarModule,
        CdkDrag,
        MatMenuModule,
        MatTooltipModule,
        MatTreeModule,
        MatButtonModule,
        CdkDragHandle,
        MatDialogModule,
        AngularEditorModule,
        FormsModule,
        MatInputModule,
        MatDividerModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatSlideToggleModule,
    ]

})
export class AdminModule { }
