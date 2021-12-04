import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroupDirective, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { Common } from '../mycommon/common';
import { OneDataInfo_Dialog } from '../maingraph/maingraph.component';

@Component({
  selector: 'app-setadjustdata-dialog',
  templateUrl: './setadjustdata-dialog.component.html',
  styleUrls: ['../app.component.css', './setadjustdata-dialog.component.css']
})
export class SetadjustdataDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetadjustdataDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  cmn = new Common();
  myInputAdjustdataForm: FormGroup;
  // selected_dataname = '';
  selected_dinfo: OneDataInfo_Dialog;
  result_formula = 'y = x';
  /*
  selected_slopedata = '';
  selected_interceptdata = '';
  */

  ngOnInit() {

    const wkinitslope = this.data.newslope;
    const wkinitintercept = this.data.newintercept;

    this.myInputAdjustdataForm = this.fb.group({
      //datanames: this.fb.array([]),
      dinfos: this.fb.array([]),
      new_slope: new FormControl(
          wkinitslope,
          [Validators.required]),
      new_intercept: new FormControl(
          wkinitintercept,
          [Validators.required])
    });

    /*
    if (this.data.datanames.length > 0) {
      this.selected_dataname = this.data.datanames[0];
    }
    */
    // console.log(this.dinfos.controls);
    if (this.data.dinfos.length > 0) {
      this.selected_dinfo = this.data.dinfos[0];
    }
    // console.log(this.selected_dinfo);
    // console.log(this.selected_dataname);

    /*
    this.data.datanames.forEach(d => {
      // console.log(d);
      this.datanames.push(this.fb.group({
    */
    this.data.dinfos.forEach(d => {
      // console.log(d);
      this.dinfos.push(this.fb.group({            
        // name: d,
        dinfo: d,
        new_slope: new FormControl(d, [Validators.required]),
        new_intercept: new FormControl(d, [Validators.required])}
      ));
    });
  }

  save() {
    /*
    for (let i = 0; i < this.data.dataids.length; i++) {
      if (this.selected_dataname === this.data.datanames[i]) {
        this.data.selected_dataid = this.data.dataids[i];
      }
    }
    */
    for (let i=0; i<this.data.dinfos.length; i++) {
      if (this.selected_dinfo.dataid === this.data.dinfos[i].dataid) {
        this.data.selected_dinfo = this.data.dinfos[i];
      }
    }
    this.data.newslopename = this.new_slope.value;
    this.data.newinterceptname = this.new_intercept.value;
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  /*
  get datanames(): FormArray {
    return this.myInputAdjustdataForm.get('datanames') as FormArray;
  }
  */
  get dinfos(): FormArray {
    return this.myInputAdjustdataForm.get('dinfos') as FormArray;
  }
  get new_slope(): FormControl {
    return this.myInputAdjustdataForm.get('new_slope') as FormControl;
  }
  get new_intercept(): FormControl {
    return this.myInputAdjustdataForm.get('new_intercept') as FormControl;
  }
}
