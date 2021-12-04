import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { OneDataInfo_Dialog } from '../maingraph/maingraph.component';

@Component({
  selector: 'app-setdecimaldigits-dialog',
  templateUrl: './setdecimaldigits-dialog.component.html',
  styleUrls: ['./setdecimaldigits-dialog.component.css']
})
export class SetdecimaldigitsDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetdecimaldigitsDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  myInputstrForm: FormGroup;
  selected_dinfo: OneDataInfo_Dialog;

  ngOnInit() {
    const wkinitname = this.data.newname;

    this.myInputstrForm = this.fb.group({
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

    this.data.newdigitsstrname = this.new_name.value;
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  get dinfos(): FormArray {
    return this.myInputstrForm.get('dinfos') as FormArray;
  }
  get new_name(): FormControl {
    return this.myInputstrForm.get('new_name') as FormControl;
  }


}
