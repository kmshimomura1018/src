import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { TimepickerComponent } from '../component/timepicker/timepicker.component';

@Component({
  selector: 'app-dispspan',
  templateUrl: './dispspan.component.html',
  styleUrls: ['../app.component.css',
          './dispspan.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class DispspanComponent implements OnInit {

  constructor() { }

  datefromValue: any;
  datetoValue: any;

  time_st: {hour: number, minute: number};
  time_ed: {hour: number, minute: number};
  meridian: boolean;

  ngOnInit() {
    this.time_st = {hour: 13, minute: 30};
    this.time_ed = {hour: 13, minute: 30};
    this.meridian = true;
  }

}
