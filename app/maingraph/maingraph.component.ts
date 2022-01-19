import { ChangeDetectionStrategy, Component, OnInit, Output, NgZone, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Common } from '../mycommon/common';
import { /*TransitionCheckState,*/ MatChipsModule } from '@angular/material/chips';
import { MaxLengthValidator } from '@angular/forms';
import { toASCII } from 'punycode';
import { MatDialog } from '@angular/material/dialog';
//import { SetbargraphsettingsDialogComponent } from '../setbargraphsettings-dialog/setbargraphsettings-dialog.component';
import { MymqttComponent } from '../mymqtt/mymqtt.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MyDef } from '../mycommon/define';
import { DefData, GraphKind, GraphBarSpan_str, DrawingApp, OneGraphInfo, AllGraphInfo } from './mygraphclass';

/*
import { runInThisContext } from 'vm';
import { timingSafeEqual } from 'crypto';
*/

@Component({
  selector: 'app-maingraph',
  templateUrl: './maingraph.component.html',
  styleUrls: ['../app.component.css', './maingraph.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MaingraphComponent implements OnInit {
  @Output() msgnotify = new EventEmitter<boolean>();
  @ViewChild(CdkVirtualScrollViewport, {static: false}) viewport: CdkVirtualScrollViewport;

  def = new MyDef();
  // 20200602++
  // This is flag of app discrimination.
  // If app is local then to false.
  isglobal_flag = false;
  //

  constructor(
      private route: ActivatedRoute,
      private dialog: MatDialog,
      private ngZone: NgZone,
      public changeDetectorRef: ChangeDetectorRef) {
        
    this.main_app = null;
    //not use this.devMode = isDevMode();
    console.log(this.def.ispro);  

  }

  /*
  @ViewChild(MymqttComponent, {static: false})
  */
  private mymqttcomponent: MymqttComponent;

  public main_app: DrawingApp;
  public allgraphinfo: AllGraphInfo;
  public allcmn = new Common();

  alldispstart: string;  //ooo

  // not use ads_wrapper: number;
  // not use devMode = true;
  devMode = false;  // 20210819 test bbb+++
  
  ngOnInit() {
    this.allgraphinfo = new AllGraphInfo();
    this.allgraphinfo.dialog = this.dialog;

    if (this.main_app == null) {
      this.main_app 
        = new DrawingApp(
            this.allgraphinfo,
            this.ngZone,
            this.msgnotify,
            false);
      // 子からの変更監視
      this.main_app.addObserver(
        (propertyName: string, oldValue: any, newValue: any) => {
          // console.log('change observer');
          this.changeDetectorRef.detectChanges();    
        }
      )
      this.main_app.mycreateelement();
      // important call order
      this.allgraphinfo.oneinfo.forEach(in_crt_ginfo => {
        this.main_app.myinit(in_crt_ginfo);
      });
    }

    // not use this.ads_wrapper = window.innerHeight - DefData.data_info_h - DefData.menu_h - DefData.line_mrg;
    // console.log(this.ads_wrapper);
  }

  ngAfterViewInit() {
    this.main_app.scroll_viewport = this.viewport;    
  }
  initgraph(files: any) {
    this.main_app.handleFileSelect(files);    
  }

  reset_zoom() {
    this.initgradispmanual();
    this.main_app.reset_zoom();
  }

  zoom_in() {
    this.initgradispmanual();
    this.main_app.zoom_in();
  }

  zoom_out() {
    this.initgradispmanual();
    this.main_app.zoom_out();
  }

  private initgradispmanual() {
    this.allgraphinfo.initgradispmanual();
  }

  public setdataname(dataid: string, newname: string) {
    let wkoutgrainfo = new OneGraphInfo(dataid, newname);
    this.allgraphinfo.getgraphinfo(dataid, wkoutgrainfo);

    this.allgraphinfo.setgraphinfo_dataname_buf_old(
      dataid,
      newname);
    this.allgraphinfo.setgraphinfo_dataname_buf_new(
      dataid,
      newname);
    this.changeDetectorRef.detectChanges();      
  }

  public setunitstr(dataid: string, newname: string) {
    let wkoutgrainfo = new OneGraphInfo(dataid, newname);
    this.allgraphinfo.getgraphinfo(dataid, wkoutgrainfo);
    this.allgraphinfo.setgraphinfo_unitstr_buf(
      dataid,
      newname);
    this.main_app.setdatalisttitle();
    this.changeDetectorRef.detectChanges();      
  }

  public setadjustdata(
      dataid: string,
      newslope: string,
      newintercept: string,
      dataname: string) {
    let wkoutgrainfo = new OneGraphInfo(dataid, dataname);
    this.allgraphinfo.getgraphinfo(dataid, wkoutgrainfo);
    // console.log(newslope);
    this.allgraphinfo.setgraphinfo_adjustinfo(
      dataid,
      newslope,
      newintercept);
    this.main_app.adjustgraph(dataid);
    this.changeDetectorRef.detectChanges();
  }

  public setdispspan(from: number, to: number) {
    this.main_app.setdispspan_x(from, to);
    this.changeDetectorRef.detectChanges();      
  }
  
  public setdispspan_manual(from: number, to: number) {
    this.main_app.setdispspan_x_manual(from, to);
    this.changeDetectorRef.detectChanges();
  }

  public deldata(dataids: string[]) {
    this.main_app.deldata(dataids);
    this.change_graph();
    if (this.allgraphinfo.oneinfo.length == 0) {
      this.main_app.alldelete();
    }
    this.changeDetectorRef.detectChanges();      
  }

  public setcolor(dataid: string, colorstr: string) {
    this.allgraphinfo.oneinfo.forEach(d_crt_ginfo => {
      if (d_crt_ginfo.dataid === dataid) {
        d_crt_ginfo.colstr_buf = colorstr;
      }
    });
    this.reset_zoom();
    this.changeDetectorRef.detectChanges();      
  }

  public setdecimaldigits(dataid: string, decimaldigits: string) {
    this.main_app.setdecimaldigits(dataid, decimaldigits);
    // this.reset_zoom();
    this.changeDetectorRef.detectChanges();
  }

  public change_datalist(dataid: string) {
    this.main_app.change_datalist(dataid);
    this.changeDetectorRef.detectChanges();      
  }

  public change_graph() {
    this.main_app.change_graph();
    this.changeDetectorRef.detectChanges();      
  }

  public setgraphkind_line() {
    this.main_app.setlinegraph();
    this.changeDetectorRef.detectChanges();      
  }

  public setgraphkind_bar() {
    this.main_app.setbargraph(GraphKind.bar);
    this.changeDetectorRef.detectChanges();      
  }

  public setaveragespan() {
    this.main_app.setavrggraph();
    this.changeDetectorRef.detectChanges();      
  }

  public setaccumulation() {
    this.main_app.setbargraph();
    this.changeDetectorRef.detectChanges();      
  }

  public makedmydata() {
    let wkdataid: string[] = [];
    this.allgraphinfo.oneinfo.forEach(d_crt_ginfo => {
      wkdataid.push(d_crt_ginfo.dataid);
    });
    this.deldata(wkdataid);
    // send change_message to mymqttcomponent
    this.main_app.reqdata = Date.now().toString();
    this.allgraphinfo.ismonitorflag = true;
    // 20200602 test bbb+++
    // console.log('makedmy: ' + localStorage.getItem(DefData.def_decimaldigits))
    if (!this.isglobal_flag && !this.allcmn.isvalid(localStorage.getItem(DefData.def_decimaldigits))) {
      localStorage.setItem(DefData.def_decimaldigits, '3');
    }
    //
    this.main_app.makedmydata();
    this.changeDetectorRef.detectChanges();      
  }

  public stopmonitoring() {
    this.main_app.reqdata = 'stop_mnt';
    this.allgraphinfo.ismonitorflag = false;
    this.changeDetectorRef.detectChanges();      
  }
}
