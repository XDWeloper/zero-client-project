import {ComponentType} from "@angular/cdk/overlay";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

export const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

export  function openDialog<T>(
  enterAnimationDuration: string,
  exitAnimationDuration: string,
  component: ComponentType<T>,
  dialog: MatDialog)
  : MatDialogRef<any> {
    return dialog.open(component, {
      width: '' + (window.innerWidth * 0.8) + 'px',
      height: '' + (window.innerHeight * 0.8) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
    })
}


