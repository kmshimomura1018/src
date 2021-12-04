import { Component, OnInit, QueryList, Inject, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DispspanComponent } from '../dispspan/dispspan.component';

@Component({
  selector: 'app-dispspan-dialog',
  templateUrl: './dispspan-dialog.component.html',
  styleUrls: ['./dispspan-dialog.component.css']
})
export class DispspanDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DispspanDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
  }

  @ViewChildren(DispspanComponent) dispspan_child: QueryList<DispspanComponent>;

  ngOnInit() {
  }

  save() {
    this.dispspan_child.forEach((item) => {
      const wkmyfrom = new Date(item.datefromValue);
      wkmyfrom.setHours(item.time_st.hour);
      wkmyfrom.setMinutes(item.time_st.minute);

      const wkmyto = new Date(item.datetoValue);
      wkmyto.setHours(item.time_ed.hour);
      wkmyto.setMinutes(item.time_ed.minute);

      this.data.myfrom = new Date(wkmyfrom);
      this.data.myto = new Date(wkmyto);
    });
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }
}
