import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {AddressService} from "../../../services/address.service";
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl, Pageable,
  PlaceObject,
  TextPosition
} from "../../../interfaces/interfaces";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {IceComponentType} from "../../../constants";
import {debounceTime, filter, ReplaySubject, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {tap} from "rxjs/operators";
import {FormControl, FormGroup} from "@angular/forms";


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressComponent implements IceComponent, OnDestroy{

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
  private _value: any;
  private _frameColor: string;

  height: any;
  width: any;
  top: any;
  left: any;
  localBorderColor: string

  enabled = true
  visible = true

  private changeValue$: Subscription

  level1List:PlaceObject[] = []

  placeFormGroup: FormGroup
  //public placeServerSideCtrl: FormControl<PlaceObject> = new FormControl<PlaceObject>(null);
  //public level1Filtering: FormControl<string> = new FormControl<string>('');
  public searching = false;
  public  filteredLevel1: ReplaySubject<PlaceObject[]> = new ReplaySubject<PlaceObject[]>(1);
  public  filteredLevel2: ReplaySubject<PlaceObject[]> = new ReplaySubject<PlaceObject[]>(1);
  protected _onDestroy = new Subject<void>();
  loadComplete = true;
  level1Data: Pageable
  level1LoadPage = 0
  level1SearchText = ""

  constructor(public addressService: AddressService,private cellService: CellService, private componentService: ComponentService) {
    this.loadData();

    this.placeFormGroup = new FormGroup({
      placeLevel1 : new FormControl<PlaceObject>(null),
      level1Filtering: new FormControl<string>(''),
      placeLevel2 : new FormControl<PlaceObject>(null),
      level2Filtering: new FormControl<string>(''),

    })
  }

  private loadData() {
    this.addressService.getAllRegion(this.level1LoadPage).subscribe({
      next: rez => {
        this.level1Data = rez
          rez.content.forEach(item => {
            this.level1List.push(item)
          })
        this.filteredLevel1.next(this.level1List);
        this.loadComplete= true
      }
    })
  }

  get value(): any {
    //console.log("get avlue: ", this._value)
    return this._value;
  }

  set value(value: any) {
    //console.log("set value: ", value)
    this._value = value;
  }

  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width = this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left = this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top = this.cellService.getClientCellBound(this.cellNumber).y - this.correctY

    this.propControl()

    this.placeFormGroup.valueChanges.pipe(
    ).subscribe({
      next: val => {
      }
    })
    this.placeFormGroup.get("level1Filtering").valueChanges
      .pipe(
        tap(v => {
          if(v.length < 1)
            this.loadData();
        }),
        filter(search => search.length > 2),
        filter(search => !!search),
        tap((v) => {
          this.searching = true
          this.level1SearchText = v
        }),
        takeUntil(this._onDestroy),
        debounceTime(800),
        switchMap(search => {
          console.log("Load data...")
          return this.addressService.searchRegionForName(search)
        }),
        takeUntil(this._onDestroy)
      ).subscribe({
        next: (filteredPlaces) => {
          this.searching = false;
          this.filteredLevel1.next(filteredPlaces);
        },
        error: error =>{console.log(error)}
  });
   }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      console.log("area:",item)
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
    if(this.changeValue$)
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

  getNextBatch() {
    if(this.level1SearchText.length > 1) return;
    console.log("getNextBatch")
    this.loadComplete= false
    if(this.level1Data.last)
      return
    this.level1LoadPage = this.level1Data.number + 1
    this.loadData();
  }

}
