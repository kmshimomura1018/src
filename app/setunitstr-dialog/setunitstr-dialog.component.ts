import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroupDirective, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { OneDataInfo_Dialog } from '../maingraph/maingraph.component';

@Component({
  selector: 'app-setunitstr-dialog',
  templateUrl: './setunitstr-dialog.component.html',
  styleUrls: ['./setunitstr-dialog.component.css']
})
export class SetunitstrDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetunitstrDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  myInputUnitstrForm: FormGroup;
  // selected_dataname = '';
  selected_dinfo: OneDataInfo_Dialog;

  ngOnInit() {

    const wkinitname = this.data.newname;

    this.myInputUnitstrForm = this.fb.group({
      dinfos: this.fb.array([]),
      new_name: new FormControl(
          wkinitname,
          [Validators.required])
    });

    if (this.data.dinfos.length > 0) {
      this.selected_dinfo = this.data.dinfos[0];
    }

    this.data.dinfos.forEach(d => {
      this.dinfos.push(this.fb.group({
        // name: d,
        dinfo: d,
        new_name: new FormControl(d, [Validators.required])}
      ));
    });

  }

  save() {
    for (let i=0; i<this.data.dinfos.length; i++) {
      if (this.selected_dinfo.dataid === this.data.dinfos[i].dataid) {
        this.data.selected_dinfo = this.data.dinfos[i];
      }
    }

    this.data.newunitstrname = this.new_name.value;
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  get dinfos(): FormArray {
    return this.myInputUnitstrForm.get('dinfos') as FormArray;
  }
  get new_name(): FormControl {
    return this.myInputUnitstrForm.get('new_name') as FormControl;
  }

  // TODO
  setunitstr() {

  }
}
