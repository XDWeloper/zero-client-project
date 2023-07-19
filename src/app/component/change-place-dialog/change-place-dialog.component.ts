import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Pageable, PlaceObject} from "../../interfaces/interfaces";
import {debounceTime, filter, ReplaySubject, Subject, switchMap, takeUntil} from "rxjs";
import {tap} from "rxjs/operators";
import {AddressService} from "../../services/address.service";
import {MatDialogRef} from "@angular/material/dialog";

export interface LevelClass {
  "levelNum": number,
  "levelPlaceHolder": string,
  "levelSorting": string,
  "parentObjId": number,
  "levelServiceName": string,
  "placeLevel": FormControl<PlaceObject>
  "levelFiltering": FormControl<string>
  "filteredLevel": ReplaySubject<PlaceObject[]>
  "levelList": Array<PlaceObject>,
  "levelData": Pageable
  "levelValue": PlaceObject
}

interface LevelHardDataCode {
  key: number,
  placeHolder: string,
  sort: string,
  serviceName: string,
}

const levelHardDataCodes: LevelHardDataCode[] = [
  {key: 1, placeHolder: "Выберите регион ...", sort: "name,asc", serviceName: "addrobj"},
  {key: 2, placeHolder: "Выберите район ...", sort: "name,asc", serviceName: "addrobj"},
  {key: 5, placeHolder: "Выберите город ...", sort: "name,asc", serviceName: "addrobj"},
  {key: 6, placeHolder: "Выберите населенный пункт ...", sort: "name,asc", serviceName: "addrobj"},
  {key: 7, placeHolder: "Выберите планировочную инфраструктура ...", sort: "name,asc", serviceName: "addrobj"},
  {key: 8, placeHolder: "Выберите инфраструктуру ...", sort: "name,asc", serviceName: "addrobj"}
]

@Component({
  selector: 'app-change-place-dialog',
  templateUrl: './change-place-dialog.component.html',
  styleUrls: ['./change-place-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChangePlaceDialogComponent {
  @Output() placeList = new EventEmitter<LevelClass[]>()

  placeClassList: LevelClass[] = []
  public searching = false;
  protected _onDestroy = new Subject<void>();


  constructor(public addressService: AddressService,private changeDetection: ChangeDetectorRef,public dialogRef: MatDialogRef<ChangePlaceDialogComponent>) {
    this.createNewLevel([1])
  }

  private loadData(page: number, levelClass: LevelClass,) {
    this.addressService.getAllRegion(page, levelClass.levelNum, levelClass.levelSorting, levelClass.parentObjId, levelClass.levelServiceName).subscribe({
      next: rez => {
        levelClass.levelData = rez
        rez.content.forEach(item => {
          if (!levelClass.levelValue || (levelClass.levelValue && item.id !== levelClass.levelValue.id))
            levelClass.levelList.push(item)
        })
        if (levelClass.levelValue) {
          levelClass.levelList.push(levelClass.levelValue)
        }
        levelClass.filteredLevel.next(levelClass.levelList);
        this.changeDetection.detectChanges()
      }
    })
  }

  private loadFilteringData(levelClass: LevelClass) {
    levelClass.levelFiltering.valueChanges
      .pipe(
        tap(v => {
          if (v.length < 1) {
            levelClass.levelList.splice(0, levelClass.levelList.length)
            this.loadData(0, levelClass);
          }
        }),
        filter(search => !!search),
        filter(search => search.length > 2),
        tap((v) => this.searching = true),
        debounceTime(300),
        switchMap(search => {
          return this.addressService.searchRegionForName(search, levelClass.levelNum, levelClass.levelSorting, levelClass.parentObjId,levelClass.levelServiceName)
        }),
        takeUntil(this._onDestroy),
      ).subscribe({
      next: (rez) => {
        this.searching = false
        levelClass.levelData = rez
        levelClass.filteredLevel.next(rez.content)
      },
      error: error => {
        console.log(error)
      }
    })
  }

  private createNewLevel(levelNum: number[], placeObject?: PlaceObject) {
    let parentObjId = placeObject ? placeObject.objectId : 0
    if(placeObject)
      this.removeOldLevel(placeObject.clevel)
    levelNum.forEach(num => {
      this.placeClassList.push(this.createLevelClassObject(num, parentObjId))
      this.loadData(0, this.placeClassList[this.placeClassList.length - 1]);
      this.loadFilteringData(this.placeClassList[this.placeClassList.length - 1]);
    })
  }

  private removeOldLevel(level: number){
    let lastIndex = this.placeClassList.findIndex(p => p.levelNum == level) + 1
    this.placeClassList.splice(lastIndex, (this.placeClassList.length - lastIndex))
  }

  private createLevelClassObject(levelNum: number, parentObjId: number): LevelClass {
    return {
      "levelNum": levelNum,
      "levelPlaceHolder": levelHardDataCodes.find(i => i.key == levelNum).placeHolder,
      "levelSorting": levelHardDataCodes.find(i => i.key == levelNum).sort,
      "levelServiceName": levelHardDataCodes.find(i => i.key == levelNum).serviceName,
      "parentObjId": parentObjId,
      "placeLevel": new FormControl<PlaceObject>(null),
      "levelFiltering": new FormControl<string>(''),
      "filteredLevel": new ReplaySubject<PlaceObject[]>(1),
      "levelList": new Array<PlaceObject>(),
      "levelData": null,
      "levelValue": null,
    }
  }

  getNextBatch(levelClass: LevelClass) {
    if (!levelClass.levelData.last) {
      this.loadData(levelClass.levelData.number + 1, levelClass);
    }
  }

  changeValue(placeObject: PlaceObject) {
    console.log("placeObject", placeObject)
    this.addressService.getNextLevel(placeObject.objectId).pipe(
      filter(res => !!res),
    ).subscribe({
      next: levelValueList => {
        // console.log("levelValueList : ",levelValueList)
        // console.log("placeObject.objectId : ",placeObject.objectId)
        this.placeList.next(this.placeClassList)
        this.createNewLevel(levelValueList, placeObject)
      }
    })
  }

  clearLevel(arrayIndex: number) {
    if(this.placeClassList[arrayIndex].levelNum == 1){
      this.placeClassList.splice(1, this.placeClassList.length - 1)
      this.placeClassList[arrayIndex].levelValue = undefined
      this.placeList.next(this.placeClassList)
      return
    }
    this.placeClassList[arrayIndex].levelValue = undefined
    let lastPlace = this.placeClassList.slice(0,arrayIndex).filter(p => p.levelValue).reverse()[0]
    this.changeValue(lastPlace.levelValue)
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }


  close() {
    this.dialogRef.close()
  }
}
