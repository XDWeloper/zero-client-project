import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {AddressService} from "../../../services/address.service";
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl,
  Pageable,
  PlaceObject,
  TextPosition
} from "../../../interfaces/interfaces";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {IceComponentType} from "../../../constants";
import {debounceTime, filter, ReplaySubject, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {tap} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {ChangeDetection} from "@angular/cli/lib/config/workspace-schema";

interface LevelClass {
  "levelNum": number,
  "levelPlaceHolder": string,
  "levelSorting": string,
  "parentObjId": number
  "placeLevel": FormControl<PlaceObject>
  "levelFiltering": FormControl<string>
  "filteredLevel": ReplaySubject<PlaceObject[]>
  "levelList": Array<PlaceObject>,
  "levelData": Pageable
  "levelValue": PlaceObject
}

interface Map {
  key: number,
  value: string
}

const levelPlaceHolder: Map[] = [
  {key: 1, value: "Выберите регион ..."},
  {key: 2, value: "Выберите район ..."},
  {key: 5, value: "Выберите город ..."},
  {key: 6, value: "Выберите населенный пункт ..."},
  {key: 7, value: "Выберите планировочную инфраструктура ..."},
  {key: 8, value: "Выберите инфраструктуру ..."}
]
const levelSortString: Map[] = [
  {key: 1, value: "name,asc"},
  {key: 2, value: "name,asc"},
  {key: 5, value: "name,asc"},
  {key: 6, value: "name,asc"},
  {key: 7, value: "name,asc"},
  {key: 8, value: "name,asc"}]

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressComponent implements IceComponent, OnDestroy {

  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  correctX: number;
  correctY: number;
  inputType: string;
  masterControlList: MasterControl[];
  maxLength: number | undefined;
  maxVal: number | undefined;
  minLength: number | undefined;
  minVal: number | undefined;
  notification: string | undefined;
  placeHolder: string;
  regExp: string | undefined;
  required: boolean;
  stepNum: number;
  textPosition: TextPosition;
  value: any;
  private _frameColor: string;

  height: any;
  width: any;
  top: any;
  left: any;
  localBorderColor: string

  enabled = true
  visible = true

  private changeValue$: Subscription

  placeClassList: LevelClass[] = []

  protected _onDestroy = new Subject<void>();
  public searching = false;


  constructor(public addressService: AddressService, private cellService: CellService, private componentService: ComponentService,
              private changeDetection: ChangeDetectorRef) {
    this.createNewLevel([1])
  }

  private loadData(page: number, levelClass: LevelClass,) {
    this.addressService.getAllRegion(page, levelClass.levelNum, levelClass.levelSorting, levelClass.parentObjId).subscribe({
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
          return this.addressService.searchRegionForName(search, levelClass.levelNum, levelClass.levelSorting, levelClass.parentObjId)
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

  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width = this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left = this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top = this.cellService.getClientCellBound(this.cellNumber).y - this.correctY
    this.propControl()
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
      "levelPlaceHolder": levelPlaceHolder.find(i => i.key == levelNum).value,
      "levelSorting": levelSortString.find(i => i.key == levelNum).value,
      "parentObjId": parentObjId,
      "placeLevel": new FormControl<PlaceObject>(null),
      "levelFiltering": new FormControl<string>(''),
      "filteredLevel": new ReplaySubject<PlaceObject[]>(1),
      "levelList": new Array<PlaceObject>(),
      "levelData": null,
      "levelValue": null,
    }
  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      console.log("area:", item)
      let componentId = item.componentId
      let value = item.value
      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList) {
        let control: ControlPropType = this.masterControlList.filter(c => c.componentID === componentId).find(c => c.componentValue === value).controlProp
        console.log(control.toString())


        switch (control.toString()) {
          case "DISABLED":
            this.enabled = false;
            break;
          case "ENABLED":
            this.enabled = true;
            break;
          case "INVISIBLE":
            this.visible = false;
            break;
          case "VISIBLE":
            this.visible = true;
            break;
        }
      }
    })
  }

  ngOnDestroy(): void {
    if (this.changeValue$)
      this.changeValue$.unsubscribe()

    this._onDestroy.next();
    this._onDestroy.complete();

  }

  get frameColor(): string {
    return this._frameColor;
  }

  set frameColor(value: string) {
    this._frameColor = value;
    this.localBorderColor = this._frameColor
  }

  getNextBatch(levelClass: LevelClass) {
    if (!levelClass.levelData.last) {
      this.loadData(levelClass.levelData.number + 1, levelClass);
    }
  }

  changeValue(placeObject: PlaceObject) {
    this.addressService.getNextLevel(placeObject.objectId).pipe(
      filter(res => !!res),
    ).subscribe({
      next: levelValueList => {
        this.createNewLevel(levelValueList, placeObject)
      }
    })
  }

  clearLevel(level: number) {
    if(this.placeClassList[level].levelNum == 1){
      this.placeClassList.splice(1, this.placeClassList.length - 1)
      this.placeClassList[level].levelValue = undefined
      return
    }
    this.changeValue(this.placeClassList[level - 1].levelValue)
  }
}
