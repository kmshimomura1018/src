import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroupDirective, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { OneDataInfo_Dialog } from '../maingraph/mygraphclass';

@Component({
  selector: 'app-setdataname-dialog',
  templateUrl: './setdataname-dialog.component.html',
  styleUrls: ['./setdataname-dialog.component.css']
})
export class SetdatanameDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetdatanameDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  myInputDatanameForm: FormGroup;
  // selected_olddataname = '';
  selected_dinfo: OneDataInfo_Dialog;

  ngOnInit() {

    const wkinitname = this.data.dinfos.length > 0
      ? this.data.dinfos[0].dataname : '';

    this.myInputDatanameForm = this.fb.group({
        dinfos: this.fb.array([]),
        new_name: new FormControl(wkinitname, [Validators.required])
    });

    // console.log(this.dinfos.controls);
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

    this.data.newdataname = this.new_name.value;
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  get dinfos(): FormArray {
    return this.myInputDatanameForm.get('dinfos') as FormArray;
  }
  get new_name(): FormControl {
    return this.myInputDatanameForm.get('new_name') as FormControl;
  }

  // TODO
  setdataname() {

  }
}
