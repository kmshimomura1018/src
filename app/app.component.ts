import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaingraphComponent, OneDataInfo_Dialog, GraphBarSpan_str, DefData } from './maingraph/maingraph.component';
import { DispspanDialogComponent } from './dispspan-dialog/dispspan-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SetdatanameDialogComponent } from './setdataname-dialog/setdataname-dialog.component';
import { SetunitstrDialogComponent } from './setunitstr-dialog/setunitstr-dialog.component';
import { SetadjustdataDialogComponent } from './setadjustdata-dialog/setadjustdata-dialog.component';
import { SetdeldataDialogComponent } from './setdeldata-dialog/setdeldata-dialog.component';
import { SetcolorDialogComponent } from './setcolor-dialog/setcolor-dialog.component';
import { SetdecimaldigitsDialogComponent } from './setdecimaldigits-dialog/setdecimaldigits-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GraphKind } from './maingraph/maingraph.component';
import { SetmonitorsettingsDialogComponent } from './setmonitorsettings-dialog/setmonitorsettings-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent /*implements AfterViewInit*/{
  constructor(
      private router: Router,
      private dialog: MatDialog) {
  }

  @ViewChild(MaingraphComponent, {static: false})
  private maingraphcomponent: MaingraphComponent;

  @ViewChild('fileInput', {static: false})
  private fileInput;
  private lastopentm = 0;

  // @ViewChild(GoogleAdsenseComponent, {static: false}) Component;

  file: File | null = null;

  title = 'kmgraph';
  initflag = false;
  mntflag = 0;  //0: 初期状態 1: モニタリング中 2: モニタリング停止

  onmsgnotify(msg: boolean) {
    if (this.mntflag === 1 || this.mntflag === 2) {
      this.initflag = false;
    } else {
      this.initflag = msg;
    }
  }

  /*
  private isinited() {
    if (this.maingraphcomponent !== undefined
        && this.maingraphcomponent !== null) {
      // console.log(this.maingraphcomponent);
      if (this.maingraphcomponent.allcmn.isvalid(this.maingraphcomponent.allgraphinfo)
          && this.maingraphcomponent.allgraphinfo.oneinfo.length > 0) {
        return true;
      }
    }
    return false;
  }
  */

  islinegraph() {
    if (this.maingraphcomponent !== undefined
        && this.maingraphcomponent !== null) {
      // console.log(this.maingraphcomponent);
      if (this.maingraphcomponent.allcmn.isvalid(this.maingraphcomponent.allgraphinfo)) {
        if (this.maingraphcomponent.allgraphinfo.grakind === GraphKind.line) {
          return true;
        }
      }
    }
    return false;
  }

  onClickSaveKmyFileButton(): void {
    // this.maingraphcomponent.main_app.myinit();
    this.maingraphcomponent.main_app.savekmy();
  }

  onClickFileInputButton(): void {
    if (Date.now() - this.lastopentm > 5 * 1000) {
      this.fileInput.nativeElement.click();
      // this.initflag = this.isinited();
      this.lastopentm = Date.now();
    } else {
      this.maingraphcomponent.main_app.dispmsg_fopensan()
    }

  }

  onChangeFileInput(): void {
    // test bbb+++
    if (this.mntflag !== 0) {
      console.log('del mnt');
      let wkdataid: string[] = [];
      this.maingraphcomponent.allgraphinfo.oneinfo.forEach(d_crt_ginfo => {
        wkdataid.push(d_crt_ginfo.dataid);
      });
      this.maingraphcomponent.deldata(wkdataid);
      this.mntflag = 0;
    }
    //

    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    // this.router.navigate(['/maingraph'], {state: files});
    this.maingraphcomponent.initgraph(files);
  }

  // ++++ settings menu ++++
  onClickDispSpanButton(): void {
    let in_myfrom: any;
    let in_myto: any;
    const dialogRef = this.dialog.open(DispspanDialogComponent, {
      width: '350px',
      data: {
        myfrom: in_myfrom,
        myto: in_myto
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // this.myfrom = result.myfrom;
        // this.myto = result.myto;
        /*
        console.log('result_from:' + result.myfrom);
        console.log('result_to:' + result.myto);
        */
        this.maingraphcomponent.setdispspan(result.myfrom.getTime(), result.myto.getTime());
      }
    });
  }

  onClickSetDataNameButton(): void {
    let in_dinfos = new Array<OneDataInfo_Dialog>();

    this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
      in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_old));
    });
    const dialogRef = this.dialog.open(SetdatanameDialogComponent, {
      width: '350px',
      data: {
        dinfos: in_dinfos,
        selected_dataid: '',
        newname: '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.maingraphcomponent.setdataname(result.selected_dinfo.dataid, result.newdataname);
      }
    });
  }

  onClickSetUnitStrButton(): void {
    /*
    let in_dataids = [];
    let in_datanames = [];
    */
    let in_dinfos = new Array<OneDataInfo_Dialog>();
    let in_unitstr = [];
    this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
      /*
      in_dataids.push(graphinfo.dataid);
      in_datanames.push(graphinfo.dataname_buf_new);
      */
      in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_old));
      in_unitstr.push(graphinfo.unitstr_buf);
    });

    const dialogRef = this.dialog.open(SetunitstrDialogComponent, {
      width: '350px',
      data: {
        /*
        dataids: in_dataids,
        datanames: in_datanames,
        */
        dinfos: in_dinfos,
        selected_dataid: '',
        newname: in_unitstr.length > 0 ? in_unitstr[0] : '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // console.log('new,old:' + result.newunitstrname + ',' + result.selected_dinfo.dataid);
        this.maingraphcomponent.setunitstr(
              result.selected_dinfo.dataid,
              result.newunitstrname);
      }
    });
  }

  onClickSetAdjustButton(): void {
    let in_dinfos = new Array<OneDataInfo_Dialog>();
    let in_slope = [];
    let in_intercept = [];

    this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
      in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_new));
      in_slope.push(graphinfo.adjust_info.getslopestr());
      in_intercept.push(graphinfo.adjust_info.getinterceptstr());
    });

    const dialogRef = this.dialog.open(SetadjustdataDialogComponent, {
      width: '350px',
      data: {
        dinfos: in_dinfos,
        selected_dataid: '',
        newslope: in_slope.length > 0 ? in_slope[0] : '',
        newintercept: in_intercept.length > 0 ? in_intercept[0] : '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // console.log('new,old:' + result.newinterceptrname + ',' + result.selected_dataid);
        // TODO ここを関数に
        this.maingraphcomponent.allgraphinfo.oneinfo.forEach(d_crt_ginfo => {
          if (d_crt_ginfo.dataid === result.selected_dinfo.dataid) {
            this.maingraphcomponent.setadjustdata(
              result.selected_dinfo.dataid,
              result.newslopename,
              result.newinterceptname,
              d_crt_ginfo.dataname_buf_new);
          }
        })
      }
    });
  }

  onClickDelDataButton(): void {
    let in_dinfos = new Array<OneDataInfo_Dialog>();
    this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
      in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_new));
    });

    const dialogRef = this.dialog.open(SetdeldataDialogComponent, {
      width: '350px',
      data: {
        dinfos: in_dinfos,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.maingraphcomponent.deldata(result.selected_dataid_list);
      }
    });
  }

  onClickSetColorButton(): void {
    /*
    let in_dataids = [];
    let in_datanames = [];
    */
   let in_dinfos = new Array<OneDataInfo_Dialog>();
   let in_colors = [];
    this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
      /*
      in_datanames.push(graphinfo.dataname_buf_new);
      in_dataids.push(graphinfo.dataid);
      */
      in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_old));
      in_colors.push(graphinfo.colstr_buf);
    });

    const dialogRef = this.dialog.open(SetcolorDialogComponent, {
      width: '350px',
      data: {
        /*
        dataids: in_dataids,
        datanames: in_datanames,
        */
        dinfos: in_dinfos,
        colors: in_colors,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // console.log('deldata:' + result.selected_dataname);
        // console.log(result);
        this.maingraphcomponent.setcolor(
            result.selected_dinfo.dataid,
            result.selected_colorstr);
      }
    });
  }

  // 20200630 test bbb+++
  onClickAverageSpanButton(): void {
    this.maingraphcomponent.setaveragespan();
  }
  //

  onClickAccumulationButton(): void {
    this.maingraphcomponent.setaccumulation();
  }

  onClickSetDecimalDigitsButton(): void {
    let in_dinfos = new Array<OneDataInfo_Dialog>();
    let in_digitsstr = [];
    this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
      in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_old));
      in_digitsstr.push(graphinfo.fixed_digit_buf);
    });

    const dialogRef = this.dialog.open(SetdecimaldigitsDialogComponent, {
      width: '350px',
      data: {
        dinfos: in_dinfos,
        selected_dataid: '',
        newname: in_digitsstr.length > 0 ? in_digitsstr[0] : '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // console.log('digits:' + result.newdigitsstrname);
        this.maingraphcomponent.setdecimaldigits(
              result.selected_dinfo.dataid,
              result.newdigitsstrname);
      }
    });
 }

  // ++++ display menu ++++
  onClickLineGraphButton(): void {
    if (!this.maingraphcomponent.allgraphinfo.ismonitorflag) {
      this.maingraphcomponent.setgraphkind_line();
    }
  }
  
  onClickBarGraphButton(): void {
    if (!this.maingraphcomponent.allgraphinfo.ismonitorflag) {
      this.maingraphcomponent.setgraphkind_bar();
    }
  }

  onClickMonitorGraphButton(): void {
    if (this.mntflag === 0 || this.mntflag === 2) {
      let in_dinfos = new Array<OneDataInfo_Dialog>();
      let in_digitsstr = [];
      this.maingraphcomponent.allgraphinfo.oneinfo.forEach(graphinfo => {
        in_dinfos.push(new OneDataInfo_Dialog(graphinfo.dataid, graphinfo.dataname_buf_old));
        in_digitsstr.push(graphinfo.fixed_digit_buf);
      });

      const dialogRef = this.dialog.open(SetmonitorsettingsDialogComponent, {
        width: '350px',
        data: {
          dinfos: in_dinfos,
          // selected_ssl: localStorage.getItem(DefData.def_mqtt_ssl)
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        // console.log(result);
        if (result !== null && result !== undefined) {    
          // console.log('digits:' + result.newdigitsstrname);
          this.initflag = true;
          this.mntflag = 1;
          this.maingraphcomponent.makedmydata();
        }
      });
    } else if (this.mntflag === 1) {
      this.maingraphcomponent.stopmonitoring();
      this.mntflag = 2;
      // ※ init_alldatabuf is called after this function,
      // ※   then initflag is changed 'true'.
      // this.initflag = false;
      // console.log('stopmmm')
    }
  }

  onClickHelpButton(): void {
    window.open('https://kmiothelp.kmshimomura.com/onlinehelp/kmgraph-main/', '_blank');
  }

  // ++++ no used ++++
  onClickCombineButton(): void {
    this.maingraphcomponent.main_app.combinegrainfo_witheqname();
  }
}
