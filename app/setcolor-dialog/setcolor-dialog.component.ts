import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroupDirective, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { OneDataInfo_Dialog } from '../maingraph/mygraphclass';

@Component({
  selector: 'app-setcolor-dialog',
  templateUrl: './setcolor-dialog.component.html',
  styleUrls: ['./setcolor-dialog.component.css']
})
export class SetcolorDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetcolorDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  myInputColorForm: FormGroup;
  selected_dinfo: OneDataInfo_Dialog;
  selected_data = { value: -1, text: ''};

  ngOnInit() {

    const wkinitname = this.data.newname;
    if (this.data.colors.length > 0 && this.data.dinfos.length > 0) { //FP
      this.data.selected_colorstr = this.data.colors[0];
    }
    this.myInputColorForm = this.fb.group({
      dinfos: this.fb.array([]),
      new_name: new FormControl(
          wkinitname/*,
          [Validators.required]*/)
    });

    if (this.data.dinfos.length > 0) {
      this.selected_dinfo = this.data.dinfos[0];
    }

    this.data.dinfos.forEach(d => {
      this.dinfos.push(this.fb.group({
        dinfo: d,
        new_name: new FormControl(d/*, [Validators.required]*/)}
      ));
    });
  }
  
  change_selectname(event) {
    let target = event.source.selected._element.nativeElement;
    this.selected_data = {
      value: event.value,
      text: target.innerText.trim()
    };
    if (this.selected_data.value != -1
        && this.data.colors.length > this.selected_data.value) {
      this.data.selected_colorstr = this.data.colors[this.selected_data.value];
    }
  }

  save() {
    for (let i=0; i<this.data.dinfos.length; i++) {
      if (this.selected_dinfo.dataid === this.data.dinfos[i].dataid) {
        this.data.selected_dinfo = this.data.dinfos[i];
      }
    }
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  get dinfos(): FormArray {
    return this.myInputColorForm.get('dinfos') as FormArray;
  }
  get new_name(): FormControl {
    return this.myInputColorForm.get('new_name') as FormControl;
  }
}
