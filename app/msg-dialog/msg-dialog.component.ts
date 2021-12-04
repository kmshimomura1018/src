import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-msg-dialog',
  templateUrl: './msg-dialog.component.html',
  styleUrls: ['./msg-dialog.component.css']
})
export class MsgDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MsgDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {
  }

  save() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close();
  }
}
