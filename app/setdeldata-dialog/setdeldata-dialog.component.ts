import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroupDirective, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list'

@Component({
  selector: 'app-setdeldata-dialog',
  templateUrl: './setdeldata-dialog.component.html',
  styleUrls: ['./setdeldata-dialog.component.css']
})
export class SetdeldataDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetdeldataDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  myInputDeldataForm: FormGroup;
  selected_dataid_list = [];

  ngOnInit() {
    this.myInputDeldataForm = this.fb.group({
      dinfos: this.fb.array([])
    });

    this.data.dinfos.forEach(d => {
      this.dinfos.push(this.fb.group({
        dinfo: d
        }
      ));
    });
  }
  
  handleSelection(options) {
    this.selected_dataid_list = [];

    options.map(o => o.value).forEach (d => {
      this.selected_dataid_list.push(d);
    })
    /*
    console.log($event);    
    if ($event.selected) {
      $event.source.selectionList.options.toArray().forEach(element => {
        console.log(element);
      //if (element.value.name!= categorySelected.name) {
      //element.selected = false;
      });
    }
    */
  }
  save() {
    this.data.selected_dataid_list = this.selected_dataid_list;
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  get dinfos(): FormArray {
    return this.myInputDeldataForm.get('dinfos') as FormArray;
  }
  get del_name(): FormControl {
    return this.myInputDeldataForm.get('del_name') as FormControl;
  }

  // TODO
  deldata() {

  }
}
