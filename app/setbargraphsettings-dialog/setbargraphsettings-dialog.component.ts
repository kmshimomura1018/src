import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GraphBarSpan_str } from '../maingraph/mygraphclass';
import { Common } from '../mycommon/common';

@Component({
  selector: 'app-setbargraphsettings-dialog',
  templateUrl: './setbargraphsettings-dialog.component.html',
  styleUrls: ['./setbargraphsettings-dialog.component.css']
})
export class SetbargraphsettingsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SetbargraphsettingsDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // 20200630 test bbb+++
    if (this.cmn.isvalid(data.title)) {
      this.title = data.title;
    }
    //
  }

  cmn = new Common();
  title = ''; // 20200630 test bbb+++
  //myInputGraphkindForm: FormGroup;

  ngOnInit() {
  }

  save() {
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }
}
