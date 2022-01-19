import { ChangeDetectionStrategy, Component, OnInit, Output, NgZone, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MsgDialogComponent } from '../msg-dialog/msg-dialog.component';
import { Common } from '../mycommon/common';
import { MatDialog } from '@angular/material/dialog';
import { SetbargraphsettingsDialogComponent } from '../setbargraphsettings-dialog/setbargraphsettings-dialog.component';
import { MyDef } from '../mycommon/define';
// import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

const def_err_data = Number.MAX_SAFE_INTEGER - 1;
const def_valid_max_data = 99999;
const def_valid_min_data = -99999;

export class DefData {
  static data_info_h = 110;
  static axis_mrg = 50;
  static canvas_mrg = 5;
  static line_mrg = 5;
  static y_axis_topmrg = 20;
  static x_axis_rightmrg = 20;
  static axis_frame_x_base = 0;
  static axis_frame_y_base = 0;
  static min_span_frame_y = 100;
  static min_spand_y_split = 5;
  static min_span_frame_x = 80;
  static min_spand_x_split = 80;
  static second_frame_w = 259;
  static left_ad_frame_w = 0;
  static right_ad_frame_w = 0;
  static menu_h = 75;
  static sns_block_h = 43;

  static axis_line_w = 0.6;
  static axis_text_col = 'rgb(0, 0, 0)';
  static axis_line_col = 'rgb(105, 105, 105)';
  static drag_rect_col = 'rgba(0,128,0,0.5)';
  static y_data_u_limit = def_valid_max_data;
  static y_data_l_limit = def_valid_min_data;

  static def_title_datetime_str = '日付時刻';
  static def_title_data_str = 'データ';
  
  static err_mes_drawrect = 'マウス選択領域が小さすぎます。';
  static err_mes_expansion_rate = '表示時間に対する倍率が大きすぎます。';
  static err_mes_nodata = '有効なデータがありません。CSV/KMYファイルの時刻・データのフォーマットを確認してください。';
  static confirm_mes_equaldata = '同じデータ名があります。今回のデータと自動的に結合しますか？';
  static err_mes_fileopenspan = '他の処理を実行中です。再度実行してください。'
  static err_mes_network = 'ネットワークが切断されました。';
  static err_mes_hugedatalist = '表示データが多すぎます。';

  // 20200630 test bbb+++
  static select_sumspan = '積算期間選択';
  static select_avrgspan = '平均期間選択';
  //

  static def_invalid_data_str = '----';
  static def_decimaldigits = 'decimaldigits';

  static def_mqtt_server = 'mqtt_server';
  static def_mqtt_port = 'mqtt_port';
  static def_mqtt_username = 'mqtt_username';
  static def_mqtt_password = 'mqtt_password';
  static def_mqtt_ssl = 'mqtt_ssl';
  static def_mqtt_topic = 'mqtt_topic';
  static def_mqtt_chcount = 'mqtt_chcount';
  
  static def_mqtt_server_str = 'サーバ名';
  static def_mqtt_port_str = 'ポート';
  static def_mqtt_username_str = 'ユーザ名';
  static def_mqtt_password_str = 'パスワード';
  static def_mqtt_ssl_str = 'SSL';
  static def_mqtt_topic_str = 'topic';
  static def_mqtt_chcount_str = 'データCH数';

  static def_mqtt_ssl_on = 'ssl_on';
  static def_mqtt_ssl_off = 'ssl_off';

  static def_mnt_datacount = 'mnt_datacount';

}

export enum GraphKind {
  line = 'line',
  bar = 'bar',
  default = 'default'
}

export enum GraphBarSpan_str {
  tm_1min = '1min',
  tm_10min = '10min',
  tm_1hour = '1hour',
  tm_1day = '1day',
  tm_auto = 'auto'
}

export class DrawingApp {

  public svg_wrapper: HTMLElement;
  public prt_allginfo: AllGraphInfo;
  public all_crt_ginfo: OneGraphInfo;
  // public datastr_list: string[];
  public datalistinfos: OneDatalistInfo[];
  public datalist_title: string;
  public allcmn = new Common();
  public scroll_viewport;
  public reqdata; // due to init of mqtt

  private mycmn = new MyCmn();
  private msdownflag = false;
  private ctrlkeydownflag = false;
  private reader: FileReader;
  private datalist_nav_frame: HTMLElement;
  private graphkind_enum: GraphKind;
  private toapp_msgnotify: EventEmitter<boolean>
  
  isdebug = true;
  def = new MyDef();

  //Observer
  get chgflag(): boolean {
    return this._chgflag;
  }

  set chgflag(chgflag: boolean) {
    if (!chgflag) return;
    this.notifyObserver('chgflag', this._chgflag, chgflag);
    this._chgflag = chgflag;
  }

  private observers: Function[] = [];

  public addObserver(observer: Function) {
    this.observers.push(observer);
  }

  private notifyObserver(propertyName: string, oldValue: any, newValue: any) {
    for (let i = 0; i < this.observers.length; i++) {
        let o = this.observers[i];
        o.apply(this, [propertyName, oldValue, newValue]);
    }
  }
  //

  constructor(
      in_allgraphinfo: AllGraphInfo,
      in_ngZone: any,
      in_appmsgnotify: EventEmitter<boolean>,
      private _chgflag: boolean
      ) {

    this.prt_allginfo = in_allgraphinfo;
    // this.datastr_list = [];
    this.datalistinfos = [];
    this.datalist_title = '';
    this.toapp_msgnotify = in_appmsgnotify;

    in_ngZone.run(()=>{
    // this.ngZone.runUnpatched(()=>{
      this.reader = new FileReader();
    });
  }

  public myinit(in_crt_ginfo: OneGraphInfo) {
    in_crt_ginfo.myinit();
    this.createUserEvents();
  }

  public alldelete() {
    while (this.prt_allginfo.svg_wrapper.firstChild) {
      this.prt_allginfo.svg_wrapper.removeChild(this.prt_allginfo.svg_wrapper.firstChild);
    }
    while (this.svg_wrapper.firstChild) {
      this.svg_wrapper.removeChild(this.svg_wrapper.firstChild);
    }

    this.prt_allginfo.init_allgradata();

    this.svg_wrapper.style.width = '0px';
    this.svg_wrapper.style.height = '0px';
    this.datalist_nav_frame.style.height = '0px';
  }

  public deldata(in_dataids) {
    for (let i=this.prt_allginfo.oneinfo.length-1; i>=0; i--) {
      for (let j=in_dataids.length-1; j>=0; j--) {
        if (this.prt_allginfo.oneinfo[i].dataid === in_dataids[j]) {
          const wk_crt_ginfo = this.prt_allginfo.oneinfo[i];
          wk_crt_ginfo.reset_element();

          // valid only in the case of deldata function.
          if (wk_crt_ginfo.svg_wrapper != null) {
            while (wk_crt_ginfo.svg_wrapper.firstChild) {
              wk_crt_ginfo.svg_wrapper.removeChild(wk_crt_ginfo.svg_wrapper.firstChild);
            }
          }
          //

          wk_crt_ginfo.reset_element_drawrect();
          this.prt_allginfo.oneinfo.splice(i, 1);
          break;
        }
      }
    }
  }

  public changedatalist(dname: string) {
    this.prt_allginfo.oneinfo.forEach(d => {
      if (d.dataname_buf_new === dname 
          || d.dataid === '') {
        return;
      }
      d.reset_zoom();
    });
  }

  public reset_zoom() {
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      in_crt_ginfo.reset_zoom();
    });
  }

  public zoom_in() {
    const wkrate = 1.0;
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      in_crt_ginfo.imp_zoom(wkrate, wkrate, 1);
    });
  }

  public zoom_out() {
    const wkrate = 1.0;
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      in_crt_ginfo.imp_zoom(wkrate, wkrate, 2);
    });
  }

  public setdispspan_x(from: number, to: number) {
    if (from < to) {
      this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
        d_crt_ginfo.setdispspan_x(from, to);
      });
    }
  }

  public setdispspan_x_manual(from: number, to: number) {
    if (from < to) {
      let wkminx = Number.MAX_SAFE_INTEGER - 1;
      let wkmaxx = Number.MIN_SAFE_INTEGER - 1;
      // calc max and min in all graph. 
      this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
        if (wkmaxx < d_crt_ginfo.x_data_buf_max) {
          wkmaxx = d_crt_ginfo.x_data_buf_max;
        }
        if (d_crt_ginfo.x_data_buf_min < wkminx) {
          wkminx = d_crt_ginfo.x_data_buf_min;
        }
      });
      if (from < wkminx) from = wkminx;
      if (wkmaxx < to) to = wkmaxx;
      this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {        
        d_crt_ginfo.setdispspan_x_manual(from, to);
      });
    }
  }

  // public function
  public setdatalisttitle() {
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      d_crt_ginfo.setdatalisttitle();
    });
  }

  public savekmy() {
    let ret = '';
    // TODO 一つのファイルにする
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      let datalist = [];
      let wkpos = 0;
      d_crt_ginfo.y_data_base_buf.forEach(d => {
        const tm = this.mycmn.retkmydatefmt(
            d_crt_ginfo.x_data_base_buf[wkpos],
            d,
            d_crt_ginfo.ismilliflag);
        datalist.push(tm);
        wkpos++;
      });

      ret += this.impretkmydata(
          d_crt_ginfo.dataid,
          '', //sensorkind,
          d_crt_ginfo.dataname_buf_new,
          d_crt_ginfo.unitstr_buf,
          datalist,
          d_crt_ginfo.colstr_buf,
          d_crt_ginfo.prt_allginfo.grakind,
          d_crt_ginfo.xaxis_title + ' ' + d_crt_ginfo.yaxis_title,
          d_crt_ginfo.adjust_info.getslopestr(),
          d_crt_ginfo.adjust_info.getinterceptstr()
      );
    });

    ret = this.retkmydefheader(ret);

    const title = this.mycmn.getDatalistDateStr(new Date(Date.now()), false) + '.kmy';
    const blobType = 'text/plain';

    const linkTagId = 'getLocal';
    const linkTag = document.getElementById(linkTagId);
    const linkTagAttr =  ['href', 'download'];

    const msSave = window.navigator;

    const stringObject = new Blob([ret], { type: blobType });
    const objectURL = window.URL.createObjectURL(stringObject);

    const UA = window.navigator.userAgent.toLowerCase();

    // UAで判定しなくても、window.navigator.msSaveBlobでの判定も可能
    // ただ、Edgeまで対象になるので、こうしてます。
    // msSave使いたいのは、IEだけです。

    if (UA.indexOf('msie') !== -1 || UA.indexOf('trident') !== -1) {
                  // IEの時はmsSaveOrOpenBlobかmsSaveBlobを利用します。
      console.log('save');
      window.navigator.msSaveOrOpenBlob(stringObject, title);
    } else {
      linkTag.setAttribute(linkTagAttr[0], objectURL);
      linkTag.setAttribute(linkTagAttr[1], title);
    }
    
    /*    
    fs.writeFile(
      'c:\\develop\\temp\\kmytest.kmy',
      ret,
      (err) => {
        if (err) { throw err; }
        console.log('save kmyfile.');
      }
    );
    */
  }

  public readkmy(in_this: any, e: any, in_fname: string) {
    // Render thumbnail.
    // console.log(e.target.result);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');
    let crt_ginfo;
    let isreaderr = false;
    let isthdata = false;
    let wkx_data_buf_min_intvl = Number.MAX_VALUE - 1;
    let wkvalid_pos = 0;
    let wkismillflag = false;

    // check kmyfile is valid.
    const onefiledata_tag = xmlDoc.getElementsByTagName('OneFileData');
    if (onefiledata_tag == null) {
      isreaderr = true;
    } else if (onefiledata_tag === undefined) {
      isreaderr = true;
    } else if (onefiledata_tag.length === 0) {
      isreaderr = true;
    }

    in_this.prt_allginfo.equal_datanames_buf = [];

    // document.getElementById("demo").innerHTML =
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < xmlDoc.getElementsByTagName('OneFileData').length; i++) {
      xmlDoc.getElementsByTagName('OneFileData')[i].childNodes.forEach(element => {
        if (element.nodeName === 'sensorname') {
          // in_this.dataname_buf = element.textContent;
          let wkdataid = in_this.mycmn.getDatalistDateStr(new Date(Date.now()), false) + '_' + i;
          let wkdataname = element.textContent !== undefined && element.textContent !== null && element.textContent.length > 0
              ? element.textContent : in_fname.replace('.kmy', '');
          crt_ginfo = in_this.prt_allginfo.initgraphinfo(wkdataid, wkdataname);
          in_this.myinitframe();
          // Because of change of d_info_h, initialize all wrapper
          crt_ginfo.reset_element();
          in_this.myinit(crt_ginfo);
          // Because turn of element is out of order.
          crt_ginfo.ismilliflag = wkismillflag;
        }
        if (element.nodeName === 'sensorkind') {
          // TODO another sensor
          if (element.textContent === '3') {
            isthdata = true;
          } else if (element.textContent === '10') {
            if (in_this.allcmn.isvalid(crt_ginfo)) {
              crt_ginfo.ismilliflag = true;
              // 20200602 test bbb+++
              // if sensorkind is accleration then Forcibly a decimalpoint sets to '3'.
              localStorage.setItem(DefData.def_decimaldigits, '3');
              crt_ginfo.decimaldigits = '3';
              //
            }
            wkismillflag = true;
          }
        }
        if (element.nodeName === 'graphkind') {
          if (in_this.allcmn.isvalid(element.textContent) && element.textContent.length > 0) {
            switch (element.textContent) {
              case 'bar':
                in_this.prt_allginfo.grakind = GraphKind.bar;
                break;
              case 'line':
                in_this.prt_allginfo.grakind = GraphKind.line;
                break;
              default:
                in_this.prt_allginfo.grakind = GraphKind.default;
                break;
            }
            in_this.prt_allginfo.grabarspan = GraphBarSpan.auto;
          }
        }
        if (element.nodeName === 'fixeddigit') {
          if (in_this.allcmn.isvalid(element.textContent) && element.textContent.length > 0) {
            crt_ginfo.fixed_digit_buf = element.textContent;
          }
        }
        if (element.nodeName === 'colorstr') {
          crt_ginfo.colstr_buf =
              (in_this.allcmn.isvalid(element.textContent)
                  && element.textContent.length > 0) ?
            in_this.prt_allginfo.col_info.convcol(element.textContent) 
              : in_this.prt_allginfo.col_info.convcol(in_this.prt_allginfo.col_info.colstr_list[i]);
        }
        if (element.nodeName === 'headerstr') {
          let hd = in_this.allcmn.isvalid(element.textContent) ?
                      element.textContent.split(' ') : [DefData.def_title_datetime_str, DefData.def_title_data_str];
          // console.log(hd);
          if (hd.length >= 2) {
            crt_ginfo.xaxis_title = hd[0];
            crt_ginfo.yaxis_title = hd[1];
          }
        }
        if (element.nodeName === 'unitstr') {
          crt_ginfo.unitstr_buf = element.textContent;
        }
        if (element.nodeName === 'slope') {
          crt_ginfo.adjust_info.setslopestr(element.textContent);
        }
        if (element.nodeName === 'intercept') {
          crt_ginfo.adjust_info.setinterceptstr(element.textContent);
        }
        if (element.nodeName === 'datalist') {
          if (element.childNodes.length === 0) { isreaderr = true; }
          let wkvalid_len = 0;
          
          in_this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
            d_crt_ginfo.isdisplay_datalist = false;
          });
          in_this.prt_allginfo.oneinfo[0].isdisplay_datalist = true;

          element.childNodes.forEach(data => {
            if (data.textContent != null && data.textContent.length > 0) {
              const wkdata = data.textContent.split(' ');
              if (wkdata !== null && wkdata.length === 2) {
                wkvalid_len++;
                // if xaxis is timedata
                // one data
                const out_tm = in_this.mycmn.convDateStr2Number(wkdata[0]);
                //
                if (out_tm !== 0) { // FP
                  // console.log('xdata_base:' + out_tm);
                  let wkydata = in_this.mycmn.convRawDataStr2Number(wkdata[1]);
                  if (!isNaN(wkydata)) {
                    crt_ginfo.x_data_base_buf.push(out_tm);
                    crt_ginfo.x_data_buf.push(out_tm);

                    wkydata = crt_ginfo.adjust_info.getcalc_y(wkydata);
                    if (!crt_ginfo.isoverlimit_ydata(wkydata) && wkydata !== def_err_data) {
                      crt_ginfo.y_data_base_buf.push(wkydata);
                      crt_ginfo.y_data_buf.push(wkydata);
                    } else {
                      crt_ginfo.y_data_base_buf.push(def_err_data);
                      crt_ginfo.y_data_buf.push(def_err_data);
                    }

                    if (crt_ginfo.x_data_buf.length > 1) {
                      if (crt_ginfo.x_data_buf[wkvalid_pos] - crt_ginfo.x_data_buf[wkvalid_pos-1] < wkx_data_buf_min_intvl) {
                        wkx_data_buf_min_intvl = crt_ginfo.x_data_buf[wkvalid_pos] - crt_ginfo.x_data_buf[wkvalid_pos-1];
                      }
                    }
                    wkvalid_pos++;

                    //crt_ginfo.datastr_list.push(
                    crt_ginfo.datalistinfos.push(
                      new OneDatalistInfo(
                        in_this.mycmn.getDatalistDateStr(new Date(out_tm), true, crt_ginfo.ismilliflag)
                            + '　'
                            + in_this.mycmn.convNumber2FixedStr(
                                  wkydata,
                                  parseInt(crt_ginfo.fixed_digit_buf, 10))                        
                      )
                    );

                  }
                }
                // console.log(wkdata);
              }
            }
          });
          if (wkvalid_len === 0) { isreaderr = true; }
        }
      });
      in_this.prt_allginfo.setgraphinfo_adjustinfo(
          crt_ginfo.dataid,
          crt_ginfo.adjust_info.slope_str,
          crt_ginfo.adjust_info.intercept_str);

      in_this.prt_allginfo.grabarspan = GraphBarSpan_str.tm_auto;
      crt_ginfo.x_data_buf_min_intvl = wkx_data_buf_min_intvl / 1000;
      crt_ginfo.x_data_base_buf_min_intvl = crt_ginfo.x_data_buf_min_intvl;

      in_this.setdatalisttitle();
    }

    // if (!isthdata) { isreaderr = true; }
    return (!isreaderr);
  }

  public makedmydata() {

    let crt_ginfo = null;
    this.prt_allginfo.ismonitorflag = true;
    let wkdataid_list = [];
    let wkdiff = 0;
    let wkchcount = parseInt(localStorage.getItem(DefData.def_mqtt_chcount), 10);

    for (let i=0; i<wkchcount; i++) {
      wkdataid_list.push(new Date(Date.now() + wkdiff).getTime().toString())
      crt_ginfo = 
        this.prt_allginfo.initgraphinfo(wkdataid_list[i],
            'Realtime_Monitor' + (i + 1).toString());

      crt_ginfo.ismonitor = true;
      
      const wkdecimaldigits = localStorage.getItem(DefData.def_decimaldigits);
      if (this.allcmn.isvalid(wkdecimaldigits)) {
        crt_ginfo.fixed_digit_buf = wkdecimaldigits;
      }
      this.myinitframe();
      //Because of change of d_info_h, initialize all wrapper
      crt_ginfo.reset_element();
      this.myinit(crt_ginfo);

      let wkdatatm;
      let out_tm;

      wkdatatm = wkdataid_list[i];
      out_tm = this.mycmn.convDateStr2Number(
          this.mycmn.retkmydatefmt(
              wkdatatm,
              '',
              crt_ginfo.ismilliflag), 
          false);

      crt_ginfo.x_data_base_buf.push(out_tm);
      crt_ginfo.y_data_base_buf.push(0);
      crt_ginfo.x_data_buf.push(out_tm);
      crt_ginfo.y_data_buf.push(0);

      if (i === 0) {
        crt_ginfo.isdisplay = true; 
        crt_ginfo.isdisplay_datalist = true;
      }
      
      // crt_ginfo.datastr_list.push(
      crt_ginfo.datalistinfos.push(
        new OneDatalistInfo(
          this.mycmn.getDatalistDateStr(new Date(out_tm), false, crt_ginfo.ismilliflag)
              + '　'
              + this.mycmn.convNumber2FixedStr(
                  0,
                  parseInt(crt_ginfo.fixed_digit_buf, 10))
        )
      );
    }
    this.init_alldatabuf();
    this.reset_zoom();

    // console.log(this.prt_allginfo.grakind);
  }

  public readcsv(
      in_this: any,
      e: any,
      // 20200708 test bbb---in_fname: string) {
      // 20200708 test bbb+++
      in_fname: string,
      chnum: any) {
      //
    let stat = false;
    const tempArray = e.target.result.split('\n');
    let crt_ginfo = null;
    let wkx_data_buf_min_intvl = Number.MAX_VALUE - 1;
    let wkvalid_pos = 0;

    in_this.prt_allginfo.equal_datanames_buf = [];
      
    if (tempArray.length > 2) {
      // 20200708 test bbb+++ let wkdataid = in_fname.replace('.csv', '');
      let wkdataid = (in_fname + chnum.toString()).replace('.csv', ''); // 20200708 test bbb+++
      wkdataid = in_this.prt_allginfo.retnewdataid(wkdataid);
      crt_ginfo = in_this.prt_allginfo.initgraphinfo(wkdataid, wkdataid);
      in_this.myinitframe();
      //Because of change of d_info_h, initialize all wrapper
      crt_ginfo.reset_element();
      in_this.myinit(crt_ginfo);

      for (let i = 0; i < tempArray.length; i++) {
        const csvArray = tempArray[i].split(',');

        // 20200708 test bbb--- if (csvArray.length === 2 || csvArray.length === 3) {  // とりあえず2
        if (csvArray.length >= chnum) {  // 20200708 test bbb+++ データch数
          // if xaxis is timedata
          // one data
          if (i === 0) {
            // 0 -> first line is header.
            crt_ginfo.xaxis_title = csvArray[0];
            // 20200708 test bbb--- crt_ginfo.yaxis_title = csvArray[1];
            crt_ginfo.yaxis_title = csvArray[chnum + 1];  // test bbb+++
          }

          const out_tm = csvArray[0].length === 19 ? 
              in_this.mycmn.convDateStr2Number(csvArray[0], true) : 0;
          //
          if (out_tm !== 0) { // FP
            // 20200708 test bbb--- const wkydata = in_this.mycmn.convRawDataStr2Number(csvArray[1].toString());
            const wkydata = in_this.mycmn.convRawDataStr2Number(csvArray[chnum + 1].toString());  // 20200708 test bbb+++
            if (!crt_ginfo.isoverlimit_ydata(wkydata)) {
              crt_ginfo.x_data_base_buf.push(out_tm);
              crt_ginfo.y_data_base_buf.push(wkydata);
              crt_ginfo.x_data_buf.push(out_tm);
              crt_ginfo.y_data_buf.push(wkydata);

              if (crt_ginfo.x_data_buf.length > 1) {
                if (crt_ginfo.x_data_buf[wkvalid_pos] - crt_ginfo.x_data_buf[wkvalid_pos-1] < wkx_data_buf_min_intvl) {
                  wkx_data_buf_min_intvl = crt_ginfo.x_data_buf[wkvalid_pos] - crt_ginfo.x_data_buf[wkvalid_pos-1];
                }
              }
              wkvalid_pos++;
            }

            //crt_ginfo.datastr_list.push(
            crt_ginfo.datalistinfos.push(
              new OneDatalistInfo(
                in_this.mycmn.getDatalistDateStr(new Date(out_tm))
                    + '　'
                    + in_this.mycmn.convNumber2FixedStr(
                        wkydata,
                        parseInt(crt_ginfo.fixed_digit_buf, 10))
              )          
            );
          }
        }
      }
    }

    if (this.allcmn.isvalid(crt_ginfo)) {
      //if (crt_ginfo.datastr_list.length > 0) {
      if (crt_ginfo.datalistinfos.length > 0) {
        in_this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
          d_crt_ginfo.isdisplay_datalist = false;
        });
        in_this.prt_allginfo.oneinfo[0].isdisplay_datalist = true;

        in_this.setdatalisttitle();
        stat = true;
      } else {
        for (let i=0; i<in_this.prt_allginfo.oneinfo.length; i++) {
          if (crt_ginfo.dataid === in_this.prt_allginfo.oneinfo[i].dataid) {
            in_this.prt_allginfo.oneinfo.splice(i, 1);
            break;
          }
        }
      }
    }

    in_this.prt_allginfo.grabarspan = GraphBarSpan_str.tm_auto;
    crt_ginfo.x_data_buf_min_intvl = wkx_data_buf_min_intvl / 1000;
    crt_ginfo.x_data_base_buf_min_intvl = crt_ginfo.x_data_buf_min_intvl;

    this.setmaxmindata(crt_ginfo);
    in_this.change_graph();
    return stat;
  }

  private setmaxmindata(crt_ginfo) {
    let datalist = [];
    crt_ginfo.datalistinfos.forEach(d => {
      datalist.push(parseFloat(d.data.slice(20, d.data.length - 1)));
    });
    let max_index = this.indexOfMax(datalist);
    let min_index = this.indexOfMin(datalist);

    // console.log(max_index);
    // console.log(min_index);

    crt_ginfo.datalistinfos[max_index].ismax = true;
    crt_ginfo.datalistinfos[min_index].ismin = true;
  }

  private indexOfMax(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }

    return maxIndex;
  }

  private indexOfMin(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] < min) {
        minIndex = i;
        min = arr[i];
      }
    }

    return minIndex;
  }

  public setrawdata_combine() {
    //console.log('oneinfo.leng' + this.prt_allginfo.oneinfo.length);
    this.prt_allginfo.oneinfo.forEach(d => {
      if (d.dataid === '') {
        this.prt_allginfo.oneinfo.forEach(d2 => {
          if (d2.dataid !== '') {
            d2.x_data_base_buf.forEach(rawdata => {
              d.x_data_base_buf.push(rawdata);
            });
            d2.y_data_base_buf.forEach(rawdata => {
              d.y_data_base_buf.push(rawdata);
            });
            d2.x_data_buf.forEach(rawdata => {
              d.x_data_buf.push(rawdata);
            });
            d2.y_data_buf.forEach(rawdata => {
              d.y_data_buf.push(rawdata);
            });
          }
        });
      }
    });
  }

  public adjustgraph(in_dataid: string) {
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      let wkpos = 0;
      if (in_dataid === d_crt_ginfo.dataid && d_crt_ginfo.y_data_base_buf.length > 0) {
        d_crt_ginfo.y_axisinfo.reset();
        d_crt_ginfo.x_axisinfo.reset();
        d_crt_ginfo.y_data_buf = [];
        // d_crt_ginfo.datastr_list = [];
        d_crt_ginfo.datalistinfos = [];

        d_crt_ginfo.y_data_base_buf.forEach(d => {
          const wkd = d_crt_ginfo.adjust_info.getcalc_y(d);
          if (!d_crt_ginfo.isoverlimit_ydata(wkd) && wkd !== def_err_data) {
            d_crt_ginfo.y_data_buf.push(wkd);

            // d_crt_ginfo.datastr_list.push(this.mycmn.getDatalistDateStr(new Date(d_crt_ginfo.x_data_base_buf[wkpos]))
            d_crt_ginfo.datalistinfos.push(
              new OneDatalistInfo(
                this.mycmn.getDatalistDateStr(new Date(d_crt_ginfo.x_data_base_buf[wkpos]))
                  + '　'
                  + this.mycmn.convNumber2FixedStr(
                      d_crt_ginfo.y_data_buf[wkpos],
                      parseInt(d_crt_ginfo.fixed_digit_buf, 10))
              )
            );
          } else {
            d_crt_ginfo.y_data_buf.push(def_err_data);
            // d_crt_ginfo.datastr_list.push(this.mycmn.getDatalistDateStr(new Date(d_crt_ginfo.x_data_base_buf[wkpos]))
            d_crt_ginfo.datalistinfos.push(
              new OneDatalistInfo(
                this.mycmn.getDatalistDateStr(new Date(d_crt_ginfo.x_data_base_buf[wkpos]))
                  + '　'
                  + DefData.def_invalid_data_str
              )
            );
          }
          wkpos++;
        });
        d_crt_ginfo.mydrawfile();
      }
    });
    this.change_graph();
  }

  public changebargraph(in_dataid: string, in_gspan: GraphBarSpan_str) {
    //20200630 test bbb+++
    return this.impchangegraphspan(in_dataid, in_gspan);
  }
  
  // 20200630 test bbb+++
  public changeavrggraph(in_dataid: string, in_gspan: GraphBarSpan_str) {
    return this.impchangegraphspan(in_dataid, in_gspan, 1);
  }
  //

  // 20200630 test bbb--- public changebargraph(in_dataid: string, in_gspan: GraphBarSpan_str) {
  // 20200630 test bbb+++
  // spankindflag / 0: sumdata  1: averagedata
  private impchangegraphspan(
      in_dataid: string,
      in_gspan: GraphBarSpan_str,
      spankindflag = 0) {
  //
    let wkspan = this.mycmn.retGraphBarSpan(in_gspan) * 1000;    
    let errflag = false;  // 20200630 test bbb+++
    
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {      
      // 20200630 test bbb+++
      if (d_crt_ginfo.ismilliflag || errflag) {
        // if a kind of data is 'acceleration' then don't change.
        return;
      }
      //
      if (wkspan > 0) {
        d_crt_ginfo.x_data_buf_min_intvl = wkspan;
      }
      let wksttm;
      if (in_dataid === d_crt_ginfo.dataid && d_crt_ginfo.y_data_base_buf.length > 0) {
        wksttm = parseInt((d_crt_ginfo.x_data_base_buf[0] / (wkspan)).toString(), 10);
        wksttm *= wkspan;
        if (wkspan >= GraphBarSpan.day_1 * 1000) {
          // time diff
          wksttm -= 3600 * 9 * 1000;
        }
        // 20200630 test bbb--- const sttm_base = wksttm;        
        const sttm_base = wksttm + wkspan; // 20200630 test bbb+++
        // console.log('sttime:' + new Date(wksttm));
        
        d_crt_ginfo.y_data_buf = [];
        d_crt_ginfo.x_data_buf = [];
        // d_crt_ginfo.datastr_list = [];
        d_crt_ginfo.datalistinfos = [];

        if (wkspan > 0) {
          let wkysum = 0;
          let wkypos = 0;
          let wkavrgcount = 0;  // 20200630 test bbb++
          d_crt_ginfo.x_data_base_buf.forEach(d => {
            const wkd_y = d_crt_ginfo.y_data_base_buf[wkypos++];
            while (wksttm <= d_crt_ginfo.x_data_base_buf[d_crt_ginfo.x_data_base_buf.length - 1] + wkspan) {
              if (!d_crt_ginfo.isoverlimit_ydata(wkd_y) && wkd_y !== def_err_data) {
                if (wksttm <= d && d < wksttm + wkspan) {
                  wkysum += wkd_y;
                  wkavrgcount++;  // 20200630 test bbb+++
                  break;
                } else {
                  if (sttm_base <= wksttm) {
                    d_crt_ginfo.x_data_buf.push(wksttm);
                    // 20200630 test bbb+++
                    if (spankindflag === 1) {
                      // console.log('sum:' + wkysum + ',' + 'avrg:' + wkavrgcount);
                      if (wkavrgcount == 0) wkavrgcount = 1;
                      wkysum /= wkavrgcount;
                    }
                    //
                    d_crt_ginfo.y_data_buf.push(wkysum);
                    const wktmstr = wkspan < GraphBarSpan.day_1 * 1000?
                        this.mycmn.getDatalistDateStr(new Date(wksttm)) : this.mycmn.getDatalistDayStr(new Date(wksttm));
                    // 20200630 test bbb+++
                    // if (d_crt_ginfo.datastr_list.length > 100000) {
                    if (d_crt_ginfo.datalistinfos.length > 100000) {
                      errflag = true;
                      return;
                    }
                    //
                    // d_crt_ginfo.datastr_list.push(wktmstr
                    d_crt_ginfo.datalistinfos.push(
                      new OneDatalistInfo(
                        wktmstr
                          + '　'
                          + this.mycmn.convNumber2FixedStr(
                              wkysum,
                              parseInt(d_crt_ginfo.fixed_digit_buf, 10))
                      )
                    );

                    wkysum = 0;
                    wkavrgcount = 0;  // 20200630 test bbb+++
                  }
                }
              }
              wksttm += wkspan;
            }
          });

          // 20200630 test bbb+++
          if (!errflag) {
          //
            d_crt_ginfo.x_data_buf.push(wksttm);
            // 20200630 test bbb+++
            if (spankindflag === 1) {
              // console.log('sum:' + wkysum + ',' + 'avrg:' + wkavrgcount);
              if (wkavrgcount == 0) wkavrgcount = 1;
              wkysum /= wkavrgcount;
            }
            //

            d_crt_ginfo.y_data_buf.push(wkysum);
            const wktmstr = wkspan < GraphBarSpan.day_1 * 1000 ? 
                this.mycmn.getDatalistDateStr(new Date(wksttm)) : this.mycmn.getDatalistDayStr(new Date(wksttm));
            // d_crt_ginfo.datastr_list.push(wktmstr
            d_crt_ginfo.datalistinfos.push(
              new OneDatalistInfo(
                wktmstr
                + '　'
                + this.mycmn.convNumber2FixedStr(
                    wkysum,
                    parseInt(d_crt_ginfo.fixed_digit_buf, 10))
              )
            );
          }
        } else {
          d_crt_ginfo.x_data_buf_min_intvl = d_crt_ginfo.x_data_base_buf_min_intvl;
          // console.log(d_crt_ginfo.y_data_base_buf);
          for (let i=0; i<d_crt_ginfo.y_data_base_buf.length; i++) {
            d_crt_ginfo.y_data_buf.push(d_crt_ginfo.y_data_base_buf[i]);
            if (i < d_crt_ginfo.x_data_base_buf.length) { // FP
              d_crt_ginfo.x_data_buf.push(d_crt_ginfo.x_data_base_buf[i]);
              // 20200630 test bbb+++
              // if (d_crt_ginfo.datastr_list.length > 100000) {
              if (d_crt_ginfo.datalistinfos.length > 100000) {
                errflag = true;
                break;
              }
              //
              // d_crt_ginfo.datastr_list.push(
              d_crt_ginfo.datalistinfos.push(
                new OneDatalistInfo(
                  this.mycmn.getDatalistDateStr(new Date(d_crt_ginfo.x_data_base_buf[i]))
                    + '　'
                    + this.mycmn.convNumber2FixedStr(
                        d_crt_ginfo.y_data_base_buf[i],
                        parseInt(d_crt_ginfo.fixed_digit_buf, 10))
                )
              );
            }
          }
        }
      }
    });

    // 20200630 test bbb+++    
    if (errflag) {
      const dialogRef = this.prt_allginfo.dialog.open(MsgDialogComponent, {
        width: '350px',
        data: {
          button: 'ok',
          mes: DefData.err_mes_hugedatalist
        }
      });
    }

    return errflag;
    //
  }

  public handleFileSelect(files: any) {
    this.prt_allginfo.grakind = GraphKind.line;

    // const files = evt.target.files; // FileList object
    // Loop through the FileList.
    for (let i = 0, f; f = files[i]; i++) {
      // const reader = new FileReader();
      // Closure to capture the file information.
      // reader.onload = this.myreadload(this);
      // tslint:disable-next-line: only-arrow-functions
        this.reader.onload = (function(theFile, in_this: any) {
        // let isvalid_ext = true;
        let stat = false;
        // tslint:disable-next-line: only-arrow-functions
        return function(e: any) {
          // 20200708 test bbb+++
          let chnum = 1;  // if kmy file then chnum is fixed on 1.
          if (f.name.slice(-4) === '.csv') {
            // if channel number is bigger than one then get channel count.
            const tempArray = e.target.result.split('\n');
            if (tempArray.length > 1) {
              chnum = (tempArray[1].split(',')).length - 1;
            }
          }
          //

          // 20200708 test bbb+++
          for (let ch=0; ch<chnum; ch++) {
          //
            if (f.name.slice(-4) === '.kmy') {
              stat = in_this.readkmy(in_this, e, f.name);
            } else if (f.name.slice(-4) === '.csv') {
              stat = in_this.readcsv(in_this, e, f.name, ch);
            } else {
              stat = false;
            }
    
            if (stat) {
              if (in_this.prt_allginfo.isexist_eqname()) {
                const dialogRef = in_this.prt_allginfo.dialog.open(MsgDialogComponent, {
                  width: '350px',
                  data: {
                    button: 'yes',
                    mes: DefData.confirm_mes_equaldata
                  }
                });
                dialogRef.afterClosed().subscribe(result => {
                  if (result !== null && result !== undefined) {
                    in_this.combinegrainfo_witheqname();
                  } else {
                    in_this.init_alldatabuf();
                    in_this.reset_zoom();
                  }
                });
              } else {
                in_this.delmonitorgraph();
                if (in_this.prt_allginfo.graphkind === GraphKind.bar) {
                  let errflag = false; // 20200630 test bbb+++
                  in_this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
                    // in_this.changebargraph(d_crt_ginfo.dataid, in_this.prt_allginfo.grabarspan);
                    // 20200630 test bbb+++                  
                    errflag = in_this.changebargraph(d_crt_ginfo.dataid, in_this.prt_allginfo.grabarspan);
                    if (errflag) {
                      return;
                    }
                    //
                  });
                  //20200630 test bbb+++
                  // back to 'auto'
                  if (errflag)
                    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
                      this.prt_allginfo.grabarspan = GraphBarSpan_str.tm_auto;
                      this.changebargraph(d_crt_ginfo.dataid, this.prt_allginfo.grabarspan);
                  });
                  //

                } else {
                  in_this.init_alldatabuf();
                }
                in_this.reset_zoom();
              }
            } else {
              const dialogRef = in_this.prt_allginfo.dialog.open(MsgDialogComponent, {
                width: '350px',
                data: {
                  button: 'ok',
                  mes: DefData.err_mes_nodata
                }
              });
              dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== undefined) {
                } else {
                }
              });
            }

          // 20200708 test bbb+++
          }
          //
        };
      })(f, this);

      this.reader.readAsText(f);
    }
  }

  public mycreateelement() {
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      in_crt_ginfo.reset_element();
      in_crt_ginfo.delete_element();
    });

    this.svg_wrapper = document.getElementById('svg_wrapper')!;
    this.prt_allginfo.svg_wrapper = this.svg_wrapper;
  }

  public combinegrainfo_witheqname() {
    for (let i=this.prt_allginfo.oneinfo.length - 1; i>=0; i--) {
      if (this.prt_allginfo.combinegrainfo_witheqname()) {
        this.init_alldatabuf();
        this.change_graph();
      }
    }
  }

  public change_graph(change_display_flag = true) {
    this.myinitframe();
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      in_crt_ginfo.reset_element();
      in_crt_ginfo.high_index = false;
    });

    let wkhindxflag = false;
    this.init_alldatabuf();
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      if (change_display_flag) {
        if (in_crt_ginfo.isdisplay) {
          if (!wkhindxflag) {
            in_crt_ginfo.high_index = true;
            // console.log(in_crt_ginfo.dataname_buf_new);
            this.change_datalist(in_crt_ginfo.dataid);
          }
          wkhindxflag = true;
        }
      } else {
        if (in_crt_ginfo.isdisplay_datalist) {
          in_crt_ginfo.high_index = true;
        } else {
          in_crt_ginfo.high_index = false;
        }
      }
      in_crt_ginfo.myinitcanvas();
      in_crt_ginfo.reset_zoom();
    });
  }

  public change_datalist(in_dataid: string) {
    this.prt_allginfo.oneinfo.forEach(in_crt_ginfo => {
      if (in_dataid === in_crt_ginfo.dataid) {
        in_crt_ginfo.isdisplay_datalist = true;
      } else {
        in_crt_ginfo.isdisplay_datalist = false;
      }
    })
  }

  public setlinegraph() {
    this.prt_allginfo.grakind = GraphKind.line;
    this.change_graph();
  }

  public setbargraph(in_grakind: GraphKind = GraphKind.default) {
    // 20200630 test bbb+++
    this.impsetgraphspan(in_grakind);
  }

  // 20200630 test bbb+++
  public setavrggraph(in_grakind: GraphKind = GraphKind.default) {
    this.impsetgraphspan(in_grakind, 1);
  }
  //
  // 20200630 test bbb--- public setbargraph(in_grakind: GraphKind = GraphKind.default) {
  // 20200630 test bbb+++
  // spankindflag / 0: sumspan  1: avrgspan
  private impsetgraphspan(in_grakind: GraphKind = GraphKind.default, spankindflag = 0) {
  //
    // 20200630 test bbb+++
    let wktitle = '';
    if (spankindflag == 0) {
      wktitle = DefData.select_sumspan;
    } else if (spankindflag == 1) {
      wktitle = DefData.select_avrgspan;
    }
    //
    const dialogRef = this.prt_allginfo.dialog.open(SetbargraphsettingsDialogComponent, {
      width: '350px',
      data: {
        button: 'yes',
        selected_grabarspan: this.prt_allginfo.grabarspan,
        title: wktitle // 20200630 test bbb+++
        /*mes: DefData.confirm_mes_equaldata*/
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        if (in_grakind === GraphKind.bar) this.prt_allginfo.grakind = GraphKind.bar;
        this.prt_allginfo.grabarspan = result.selected_grabarspan;
        //console.log(result.selected_grabarspan);
        let errflag = false; // 20200630 test bbb+++
        this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
          // 20200630 test bbb--- this.changebargraph(d_crt_ginfo.dataid, this.prt_allginfo.grabarspan)
          // 20200630 test bbb+++
          if (!errflag) {
            if (spankindflag == 0) {
              errflag = this.changebargraph(d_crt_ginfo.dataid, this.prt_allginfo.grabarspan);
            } else if (spankindflag == 1) {
              errflag = this.changeavrggraph(d_crt_ginfo.dataid, this.prt_allginfo.grabarspan);
            }
          } else {
            return;
          }
          //
        })
        // 20200630 test bbb+++
        if (errflag) {
          // back to 'auto'
          this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
            this.prt_allginfo.grabarspan = GraphBarSpan_str.tm_auto;
            if (spankindflag == 0) {
              this.changebargraph(d_crt_ginfo.dataid, this.prt_allginfo.grabarspan);
            } else if (spankindflag == 1) {
              this.changeavrggraph(d_crt_ginfo.dataid, this.prt_allginfo.grabarspan);
            }
          });
        }
        //
        this.change_graph();
        //
      } else {
      }
    });
  }

  public setdecimaldigits(dataid: string, decimaldigits: string) {
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      if (d_crt_ginfo.dataid === dataid) {
        d_crt_ginfo.fixed_digit_buf = 
          this.allcmn.isnumber(decimaldigits) ?
            decimaldigits : '1';
        // d_crt_ginfo.datastr_list = [];
        d_crt_ginfo.datalistinfos = [];

        let wkpos = 0;
        d_crt_ginfo.x_data_buf.forEach(xdata => {
          const out_tm = this.mycmn.convDateStr2Number(
            this.mycmn.retkmydatefmt(
                xdata,
                '',
                d_crt_ginfo.ismilliflag), 
            false);
          const wkydata = d_crt_ginfo.y_data_buf[wkpos++];
      
          // d_crt_ginfo.datastr_list.push(
          d_crt_ginfo.datalistinfos.push(
            new OneDatalistInfo(
              this.mycmn.getDatalistDateStr(new Date(out_tm))
                  + '　'
                  + this.mycmn.convNumber2FixedStr(
                      wkydata,
                      parseInt(d_crt_ginfo.fixed_digit_buf, 10))
            )
          );
        });

        localStorage.setItem(DefData.def_decimaldigits, d_crt_ginfo.fixed_digit_buf);
      }
    });
    this.change_graph();
  }

  public dispmsg_fopensan() {
    this.dispmsg(DefData.err_mes_fileopenspan);    
  }

  // private lastmsgtime = new Date(Date.now()).getTime();
  private lastmsgtime = 0;
  private wkstatic_display_datalist = -1;

  public onmsgnotify(msg: string) {
    if (msg === null) {
      console.log('error:msg is null');
      return;
    }
    const json = JSON.parse(msg);
    // console.log(json);
    let wkoneaxis_datalist = json.data.split('/');
    let wkaxis_index = 0;
    let intvl_for_millflag = json.dtime_milli * 1000 - this.lastmsgtime;
    let wkmillflag = json.dtime_milli != 0 ? true : false;

    if (this.lastmsgtime != 0) {
      wkoneaxis_datalist.forEach(axisd => {
        if (wkaxis_index >= parseInt(localStorage.getItem(DefData.def_mqtt_chcount), 10)) return;
        const wkydata_list = axisd.split(',');
        let wklastmsgtime = this.lastmsgtime;
        let d_crt_ginfo = this.prt_allginfo.oneinfo[wkaxis_index];
        
        wkaxis_index++;
        wkydata_list.forEach(d => {
          let out_tm = this.mycmn.convDateStr2Number(
              this.mycmn.retkmydatefmt(
                    wklastmsgtime,
                    '',
                    wkmillflag),
              false);
          wklastmsgtime += intvl_for_millflag / wkydata_list.length;

          if (d_crt_ginfo.x_data_base_buf.length >= parseInt(localStorage.getItem(DefData.def_mnt_datacount))) {
            d_crt_ginfo.x_data_base_buf.splice(0, 1);
            d_crt_ginfo.x_data_buf.splice(0, 1);
            d_crt_ginfo.y_data_base_buf.splice(0, 1);
            d_crt_ginfo.y_data_buf.splice(0, 1);
            // d_crt_ginfo.datastr_list.splice(0, 1);
            d_crt_ginfo.datalistinfos.splice(0, 1);
          }
          d_crt_ginfo.x_data_base_buf.push(out_tm);
          d_crt_ginfo.x_data_buf.push(out_tm);
    
          let wkydata = parseFloat(d);
          d_crt_ginfo.y_data_base_buf.push(wkydata);
          d_crt_ginfo.y_data_buf.push(wkydata);

          // d_crt_ginfo.datastr_list.push(
          d_crt_ginfo.datalistinfos.push(
            new OneDatalistInfo(
              this.mycmn.getDatalistDateStr(new Date(out_tm), true, wkmillflag)
                  + '　'
                  + this.mycmn.convNumber2FixedStr(
                      wkydata,
                      parseInt(d_crt_ginfo.fixed_digit_buf, 10))
            )
          );
          d_crt_ginfo.ismilliflag = wkmillflag;
        });
        this.prt_allginfo.scroll('end', this.scroll_viewport);
      });
    }

    this.lastmsgtime = json.dtime_milli * 1000;
    this.change_graph(false);
  }

  // ++++++++++ private functon ++++++++++++
  private dispmsg(in_msg) {
    const dialogRef = this.prt_allginfo.dialog.open(MsgDialogComponent, {
      width: '350px',
      data: {
        button: 'ok',
        mes: DefData.err_mes_fileopenspan
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
      } else {
      }
    });
  }

  private init_alldatabuf() {
    let wkxmax_all = Number.MIN_SAFE_INTEGER + 1;
    let wkymax_all = Number.MIN_SAFE_INTEGER + 1;
    let wkxmin_all = Number.MAX_SAFE_INTEGER - 1;
    let wkymin_all = Number.MAX_SAFE_INTEGER - 1;
    let wkemit_msg = 
        this.prt_allginfo.oneinfo.length > 0 ?
          true : false;

    this.toapp_msgnotify.emit(wkemit_msg);
    
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      let wky_data_buf = []
      d_crt_ginfo.y_data_buf.forEach(yd => {
        if (yd !== def_err_data) {
          wky_data_buf.push(yd);
        }
      });
      if (d_crt_ginfo.isdisplay) {
        let wkxmax = Math.max(...d_crt_ginfo.x_data_buf);
        let wkymax = Math.max(...wky_data_buf);
        let wkxmin = Math.min(...d_crt_ginfo.x_data_buf);
        let wkymin = Math.min(...wky_data_buf);
        if (wkxmax_all < wkxmax) { wkxmax_all = wkxmax; }
        if (wkymax_all < wkymax) { wkymax_all = wkymax; }
        if (wkxmin < wkxmin_all) { wkxmin_all = wkxmin; }
        if (wkymin < wkymin_all) { wkymin_all = wkymin; }
        d_crt_ginfo.x_axisinfo.reset();
        d_crt_ginfo.y_axisinfo.reset();
      }
    });
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      if (d_crt_ginfo.isdisplay) {
        d_crt_ginfo.x_data_buf_max = wkxmax_all;
        d_crt_ginfo.y_data_buf_max = wkymax_all;
        d_crt_ginfo.x_data_buf_min = wkxmin_all;
        d_crt_ginfo.y_data_buf_min = wkymin_all;
      }
    });
  }

  private myinitframe() {
    // set element of data_info
    const dinfo = document.getElementById('data_info_table');
    const table_h = this.prt_allginfo.oneinfo.length * 25 + 30;
    dinfo.setAttribute('height', table_h.toString());
    DefData.data_info_h = 60 + table_h; // 60 is 'display span rect' and margin;

    // console.log(this.svg_wrapper);
    while (this.svg_wrapper.firstChild) {
      this.svg_wrapper.removeChild(
        this.svg_wrapper.firstChild
      );
    }

    // absolute coordinate
    let wkadw = !this.def.ispro ? 321 : 0;
    const wksvg_wrapper_w = window.innerWidth - DefData.canvas_mrg * 2 - DefData.line_mrg * 2 - DefData.second_frame_w - DefData.left_ad_frame_w - DefData.right_ad_frame_w - wkadw;
    const wksvg_wrapper_h = window.innerHeight - DefData.data_info_h - DefData.menu_h - DefData.line_mrg;
    this.svg_wrapper.style.width = wksvg_wrapper_w.toString() + 'px';
    this.svg_wrapper.style.height = wksvg_wrapper_h.toString() + 'px';

    // settings of datalist_nav_frame.
    // ※ only when current_onegraphinfo is valid.
    this.datalist_nav_frame = document.getElementById('datalist_nav_frame')!;
    this.datalist_nav_frame.style.height 
      = (window.innerHeight - (60 + 55) - DefData.menu_h - DefData.line_mrg - DefData.sns_block_h) + 'px';

    // graph rect
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      d_crt_ginfo.axis_frame_x = this.svg_wrapper.clientWidth 
          - (DefData.x_axis_rightmrg + DefData.axis_mrg + DefData.canvas_mrg);
      d_crt_ginfo.axis_frame_x_base = d_crt_ginfo.axis_frame_x;
      d_crt_ginfo.axis_frame_y = this.svg_wrapper.clientHeight 
          - (DefData.axis_mrg + DefData.y_axis_topmrg);
      d_crt_ginfo.axis_frame_y_base = d_crt_ginfo.axis_frame_y;
    });
  }

  private createUserEvents() {
    this.svg_wrapper.onmousedown = this.OnMouseDown;
    this.svg_wrapper.onmousemove = this.OnMouseMove;
    this.svg_wrapper.onmouseup = this.OnMouseUp;
    this.svg_wrapper.ondblclick = this.OnDblclick;
    window.addEventListener('mouseup', e=> {
      this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
        if (!this.allcmn.isvalid(d_crt_ginfo)) { return; }
        if (e.clientX < DefData.axis_mrg
            || d_crt_ginfo.svg_graline_wrapper.clientWidth + DefData.axis_mrg < e.clientX
            || e.clientY < DefData.menu_h + DefData.y_axis_topmrg
            || d_crt_ginfo.svg_graline_wrapper.clientHeight + DefData.menu_h + DefData.y_axis_topmrg < e.clientY) {
          this.msdownflag = false;
          // console.log('window mouse leave');
        }
      });
    });
    window.addEventListener('keydown', e => {
      if (e.ctrlKey && !this.ctrlkeydownflag && !this.msdownflag) {
        this.ctrlkeydownflag = true;
      }
    });
    window.addEventListener('keyup', e=> {
      if (this.ctrlkeydownflag) {
        this.ctrlkeydownflag = false;
        if (this.msdownflag) {
          this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
            d_crt_ginfo.reset_element_drawrect();           
          });
          this.msdownflag = false;
        }
      }
    });
    window.addEventListener('resize', this.OnResize);
  }

  private OnResize = (e: any) => {
    // this.myinit();
  }

  // thisの判定の為アロー関数にする
  private OnMouseDown = (e: any) => {
    this.msdownflag = true;
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      d_crt_ginfo.imp_mousedown(
          e.clientX,
          e.clientY,
          this.ctrlkeydownflag);
    });
  }

  // thisの判定の為アロー関数にする
  private OnMouseMove = (e: any) => {
    // ※ drawrect is only one.
    if (this.msdownflag) {
      if (this.ctrlkeydownflag) {
        this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
          d_crt_ginfo.imp_mousemove_keydown(e.clientX, e.clientY, d_crt_ginfo.high_index);
        });
      } else {
        for (let i=0; i<this.prt_allginfo.oneinfo.length; i++) {
          const d_crt_ginfo = this.prt_allginfo.oneinfo[i];
          this.msdownflag = d_crt_ginfo.imp_mousemove_msdown(e.clientX, e.clientY);
        }
      }
    }
  }

  private OnMouseUp = (e: any) => {
    if (this.msdownflag) {
      if (this.ctrlkeydownflag) {
        let reterrmes = '';
        this.prt_allginfo.initgradispmanual();

        for (let i=0; i<this.prt_allginfo.oneinfo.length; i++) {
          let d_crt_ginfo = this.prt_allginfo.oneinfo[i];
          d_crt_ginfo.mouse_info.drawrect_end_x = e.clientX - DefData.axis_mrg;
          d_crt_ginfo.mouse_info.drawrect_end_y = e.clientY - DefData.menu_h - DefData.y_axis_topmrg;

          d_crt_ginfo.imp_mousemove_keydown(
              e.clientX,
              e.clientY,
              false);
          reterrmes = this.prt_allginfo.oneinfo[i].imp_keyup();
          if (reterrmes !== '') return;
          this.chgflag = true; // ooo observer
        }
      } else {
        this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
          d_crt_ginfo.imp_mouseup(e.clientX, e.clientY);
        });
      }
      this.msdownflag = false;
    }
  }

  private OnDblclick = (e: any) => {
    const wkrate = 0.5;
    this.msdownflag = false;
    this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
      d_crt_ginfo.imp_zoom(wkrate, wkrate, 1);
    })
  }

  private impretkmydata(
      sensorid: string,
      sensorkind: string,
      sensorname: string,
      unitstr: string,
      datalist: string[],
      colstr: string,
      graphkind: string,
      axistitle: string,
      slope: string,
      intercept: string) {

    let dlist = '';
    datalist.forEach(d => {
      dlist += '<string>' + d + '</string>';
    });

    const onefile =
      this.oneretfilestr(
        sensorid,
        sensorkind,
        sensorname,
        unitstr,
        colstr,
        dlist,
        graphkind,
        '',
        axistitle,
        slope,
        intercept);

    return onefile;
  }

  private oneretfilestr(
      sensorid: string,
      sensorkind: string,
      sensorname: string,
      unitstr: string,
      colstr: string,
      dlist: string,
      graphkind: string,
      gfilename: string,
      axistitle: string,
      slope: string,
      intercept: string) {

    const str =
      // '<FileDataList>'
      // +  '<filealldata>'
      // +    '<slope>1</slope>'
      // +    '<offset>0</offset>'
      // +    '<unitpoint>0.1</unitpoint>'
      // +    '<filedatalist>'
      '<OneFileData>'
      +        '<sensorid>' + sensorid + '</sensorid>'
      +        '<sensorkind>' + sensorkind + '</sensorkind>'
      +        '<sensorname>' + sensorname + '</sensorname>'
      +        '<graphkind>' + graphkind + '</graphkind>'
      +        '<graphid>' + gfilename + '</graphid>'
      +        '<colorstr>' + colstr + '</colorstr>'
      +        '<headerstr>' + axistitle + '</headerstr>'
      +        '<unitstr>' + unitstr + '</unitstr>'
      +        '<isgradation>0</isgradation>'
      +        '<circlecollist>'
      +        '</circlecollist>'
      +        '<slope>' + slope + '</slope>'
      +        '<intercept>' + intercept + '</intercept>'
      +        '<datalist>'
      +           dlist
      +        '</datalist>'
      +      '</OneFileData>';
      // +    '</filedatalist>'
      // +  '</filealldata>';
      // +'</FileDataList>';

    return str;
  }

  private retkmydefheader(onefiledata: string) {
    let ret = '';
    ret +=
      '<FileDataList>'
      + '<filealldata>'
      +   '<slope>1</slope>'
      +   '<offset>0</offset>'
      +   '<unitpoint>0.1</unitpoint>'
      +   '<filedatalist>'
      +     onefiledata
      +   '</filedatalist>'
      + '</filealldata>'
      + '</FileDataList>'

    return ret;  
  }

  private delmonitorgraph() {
    if (this.prt_allginfo.ismonitorflag) {
      this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
        if (d_crt_ginfo.ismonitor) {
          const wkdataids = [];
          wkdataids.push(d_crt_ginfo.dataid);
          this.deldata(wkdataids);
        }
      });
      this.reqdata = 'stop_mnt';
      this.change_graph();
      if (this.prt_allginfo.oneinfo.length == 0) {
        this.alldelete();
      }
      this.prt_allginfo.ismonitorflag = false;
    }
  }
}

export class AllGraphInfo {

  constructor() {
    this.dataid = new Array<string>();
    this.oneinfo = new Array<OneGraphInfo>();
    this.dataid = [];
    this.oneinfo = [];
    this.col_info = new GraphColorInfo();
    this.grakind = GraphKind.line;
    this.init_allgradata();
  }

  public mycmn = new MyCmn();
  public dialog: MatDialog
  public dataid: Array<string>;
  public oneinfo: Array<OneGraphInfo>;
  public gra_disp_start_base: string;
  public gra_disp_end_base: string;
  public all_gra_disp_start: string;
  public all_gra_disp_end: string;
  public all_gra_disp_avrg: string;
  public all_gra_disp_start_manual: string;
  public all_gra_disp_end_manual: string;
  public all_gra_disp_avrg_manual: string;

  public svg_wrapper;

  public col_info: GraphColorInfo;
  public grakind: GraphKind;
  public grabarspan = GraphBarSpan_str.tm_auto;
  public ismonitorflag = false;

  public init_allgradata() {
    this.gra_disp_start_base = '';
    this.gra_disp_end_base = '';
    this.all_gra_disp_start = '';
    this.all_gra_disp_end = '';
    this.all_gra_disp_avrg = '';
    this.all_gra_disp_start_manual = '';
    this.all_gra_disp_end_manual = '';
    this.all_gra_disp_avrg_manual = '';
  }

  // if equal dataid is exist then set new dataid.
  public retnewdataid(in_dataid: string) {
    let ret = in_dataid;
    this.oneinfo.forEach(d_crt_ginfo => {
      if (in_dataid === d_crt_ginfo.dataid) {
        ret = in_dataid + '_' + (this.mycmn.getDatalistDateStr(new Date(Date.now()), false));
      }
    });
    return ret;
  }
  
  public initgraphinfo(in_dataid: string, in_dataname: string) {
    const ret = new OneGraphInfo(in_dataid, in_dataname);
    ret.svg_wrapper = this.svg_wrapper;
    ret.prt_allginfo = this;
    ret.colstr_buf = this.col_info.colstr_list[this.oneinfo.length];
    this.dataid.push(in_dataid);
    this.oneinfo.push(ret);
    this.oneinfo[0].high_index = true;

    return ret;
  }

  public setgraphinfo_dataname_buf_old(
    in_dataid: string,
    dataname_buf_old: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].dataname_buf_old = dataname_buf_old;
      }
    }
  }

  public setgraphinfo_dataname_buf_new(
      in_dataid: string,
      dataname_buf_new: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].dataname_buf_new = dataname_buf_new;
      }
    }
  }

  // 未使用
  public setgraphinfo_datastr_list(
    in_dataid: string,
    //datastr_list: string[]) {
    datalistinfos: OneDatalistInfo[]) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        // this.oneinfo[i].datastr_list = datastr_list;
        this.oneinfo[i].datalistinfos = datalistinfos;
      }
    }
  }

  public setgraphinfo_unitstr_buf(
    in_dataid: string,
    unitstr_buf: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].unitstr_buf = unitstr_buf;
      }
    }
  }

  // 未使用
  public setgraphinfo_gra_disp_start(
    in_dataid: string,
    gra_disp_start: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].gra_disp_start = gra_disp_start;
      }
    }
  }

  // 未使用
  public setgraphinfo_gra_disp_end(
    in_dataid: string,
    gra_disp_end: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].gra_disp_end = gra_disp_end;
      }
    }
  }

  public setgraphinfo_gra_disp_avrg(
    in_dataid: string,
    gra_disp_end: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].gra_disp_end = gra_disp_end;
      }
    }
  }

  public setgraphinfo_colstr(
    in_dataid: string,
    in_colstr: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].colstr_buf = in_colstr;
      }
    }
  }

  public setgraphinfo_adjustinfo(
    in_dataid: string,
    in_slope: string,
    in_intercept: string) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === in_dataid) {
        this.oneinfo[i].adjust_info.setslopestr(in_slope);
        this.oneinfo[i].adjust_info.setinterceptstr(in_intercept);
        this.oneinfo[i].adjust_info.formula = 
            this.grakind === GraphKind.line ? 
              this.oneinfo[i].adjust_info.getformula() : DefData.def_title_data_str;
      }
    }
  }

  public retgraphinfo_dataname_buf_old(dataid: string) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === dataid) {
        return this.oneinfo[i].dataname_buf_old;
      }
    }
    return '';
  }

  public retgraphinfo_dataname_buf_new(dataid: string) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === dataid) {
        return this.oneinfo[i].dataname_buf_new;
      }
    }
    return '';
  }

  public getgraphinfo(dataid: string, out_graphinfo: OneGraphInfo) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oneinfo.length; i++) {
      if (this.oneinfo[i].dataid === dataid) {
        out_graphinfo = this.oneinfo[i];
        break;
      }
    }
  }

  public initgradispmanual() {     
    this.all_gra_disp_start = '';
    this.all_gra_disp_end = '';
    this.all_gra_disp_start_manual = '';
    this.all_gra_disp_end_manual = '';
    this.all_gra_disp_avrg_manual = '';
  }

  public retselectedcol(in_crt_ginfo: OneGraphInfo) {
    if (this.oneinfo.length > 1 && in_crt_ginfo.isdisplay_datalist) {
      return '#b2d8ff';
    }
    return null;
  }

  public combinegrainfo_witheqname() {
    let stat = false;

    for (let i=0; i<this.oneinfo.length; i++) {
      for (let j=i+1; j<this.oneinfo.length; j++) {
        if (this.oneinfo[j].dataname_buf_new.match(this.oneinfo[i].dataname_buf_new) !== null) {
          this.impcombinegrainfo(this.oneinfo[i], this.oneinfo[j]);
          this.oneinfo.splice(j, 1);
          stat = true;
        }
        if (stat) break;
      }
      if (stat) break;
    }
    return stat;
  }

  public isexist_eqname() {
    let stat = false;
    for (let i=0; i<this.oneinfo.length; i++) {
      for (let j=i+1; j<this.oneinfo.length; j++) {
        if (this.oneinfo[j].dataname_buf_new.match(this.oneinfo[i].dataname_buf_new) !== null) {
          return true;
        }
      }
    }
    return false;
  }

  public scroll(position: Position, in_viewport) {
    let scrollIndex: number;
    switch (position) {
      case 'start':
        scrollIndex = 0;
        break;
      case 'mid':
        if (this.oneinfo.length > 0) {
          scrollIndex = this.oneinfo[0].x_data_buf.length / 2;
        }
        break;
      case 'end':
        if (this.oneinfo.length > 0) {
          scrollIndex = this.oneinfo[0].x_data_buf.length;
        }
        break;
    }
    in_viewport.scrollToIndex(scrollIndex, 'smooth');
  }

  // ++++ private function ++++
  private impcombinegrainfo(src: OneGraphInfo, dest: OneGraphInfo) {
    let wkxy_data_buf = [];
    if (src.x_data_base_buf.length === src.y_data_base_buf.length
        && dest.x_data_buf.length === dest.y_data_base_buf.length) {
      for (let i=0; i<src.x_data_base_buf.length; i++) {
        let obj = {x: src.x_data_base_buf[i], y: src.y_data_base_buf[i]}
        wkxy_data_buf.push(obj);
      }
      for (let i=0; i<dest.x_data_base_buf.length; i++) {
        let obj = {x: dest.x_data_base_buf[i], y: dest.y_data_base_buf[i]}
        wkxy_data_buf.push(obj);
      }
    } else {
      // FP
    }
    src.x_data_base_buf = [];
    src.y_data_base_buf = [];
    src.x_data_buf = [];
    src.y_data_buf = [];
    // src.datastr_list = [];
    src.datalistinfos = [];

    wkxy_data_buf.sort((a, b) => a.x - b.x);
    let wkobj_bf = null;
    wkxy_data_buf.forEach(obj => {
      if (wkobj_bf === null) { wkobj_bf = obj; } 
      // exclude duplicate
      if (src.x_data_buf.length === 0 
          || !this.isduplicate(src.x_data_base_buf, src.y_data_base_buf, obj.x, obj.y)) {
        src.x_data_base_buf.push(obj.x);
        src.y_data_base_buf.push(obj.y);
        src.x_data_buf.push(obj.x);
        src.y_data_buf.push(obj.y);
      
        // src.datastr_list.push(
        src.datalistinfos.push(
          new OneDatalistInfo(
            this.mycmn.getDatalistDateStr(new Date(obj.x))
                + '　'
                + this.mycmn.convNumber2FixedStr(
                      obj.y,
                      parseInt(src.fixed_digit_buf, 10))
          )
       );
      }
    });
  }

  private isduplicate(
      exist_buf_x: number[],
      exist_buf_y: number[],
      crt_buf_x: number,
      crt_buf_y: number) {
    let check_max = exist_buf_x.length > 20 ? 20 : exist_buf_x.length;
    for (let i=exist_buf_x.length-check_max; i<exist_buf_x.length; i++) {
      // console.log(i + ',' + crt_buf_x + ',' + exist_buf_x[i]);
      if (exist_buf_x[i] === crt_buf_x && exist_buf_y[i] === crt_buf_y) {
        return true;
      }
    }
    return false;
  }
}

export class OneDataInfo_Dialog {
  constructor(in_dataid, in_dataname) {
    this.dataid = in_dataid;
    this.dataname = in_dataname;
  }
  public dataname: string;
  public dataid: string;
}

export class OneGraphInfo {
  constructor(in_dataid: string, in_dataname: string) {
    this.high_index = false;
    this.dataid = in_dataid;
    this.isdisplay = true;
    this.isdisplay_datalist = false;
    this.dataname_buf_old = in_dataname;
    this.dataname_buf_new = in_dataname;
    this.datalist_title = '';
    // this.datastr_list = [];
    this.datalistinfos = [];
    this.xaxis_title = '';
    this.yaxis_title = '';
    this.unitstr_buf = '';
    this.colstr_buf = '#000000';
    this.gra_disp_start = '';
    this.gra_disp_end = '';
    this.gra_disp_avrg = '';
    this.fixed_digit_buf = localStorage.getItem(DefData.def_decimaldigits);
    if (!this.allcmn.isvalid(this.fixed_digit_buf)) {
      this.fixed_digit_buf = '1';
    }
    this.x_data_buf = [];
    this.y_data_buf = [];
    this.x_data_base_buf = [];
    this.y_data_base_buf = [];

    this.adjust_info = new AdjustInfo();

    this.svg_graline_wrapper = document.createElement('div');
    // this.svg_graline_wrapper.setAttribute('style', 'position: absolute; border: 1px solid #212121; backgroud-color: #888888');
    this.svg_graline_wrapper.setAttribute('style', 'position: absolute; border: 1px solid #000000; backgroud-color: #888888');
    this.svg_drawrect_wrapper = document.createElement('div');
    this.svg_drawrect = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg_xaxis = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg_yaxis = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  public ngZone: any;

  public high_index: boolean;
  public dataid: string;
  public isdisplay: boolean;
  public isdisplay_datalist: boolean;
  public ismilliflag: boolean;
  public dataname_buf_old: string;
  public dataname_buf_new: string;
  public datalist_title: string;
  // public datastr_list: string[];
  public datalistinfos: OneDatalistInfo[];
  public xaxis_title: string;
  public yaxis_title: string;
  public unitstr_buf: string;
  public colstr_buf: string;
  public gra_disp_start: string;
  public gra_disp_end: string;
  public gra_disp_avrg: string;
  public fixed_digit_buf: string;
  public axis_frame_x = 0;
  public axis_frame_y = 0;
  public axis_frame_x_base = 0;
  public axis_frame_y_base = 0;

  public x_data_buf: number[];
  public y_data_buf: number[];
  public x_data_base_buf: number[];
  public y_data_base_buf: number[];
  public x_data_buf_max: number;
  public y_data_buf_max: number;
  public x_data_buf_min: number;
  public y_data_buf_min: number;
  public x_data_buf_min_intvl: number;
  public x_data_base_buf_min_intvl: number;
  public x_axisinfo = new AxisInfo();
  public y_axisinfo = new AxisInfo();
  public expansion_x_rate = 1;
  public expansion_y_rate = 1;
  public mouse_down_x = 0;
  public mouse_down_y = 0;
  public mouse_info: MouseInfo;
  public adjust_info: AdjustInfo;

  public svg_graline_wrapper: HTMLElement;
  public svg_drawrect_wrapper: HTMLElement;
  public svg_drawrect: SVGSVGElement;
  public svg: SVGSVGElement;
  public svg_xaxis: SVGSVGElement;
  public svg_yaxis: SVGSVGElement;
  public svg_wrapper: HTMLElement;
  public ads_wrapper: HTMLElement;
  public prt_allginfo: AllGraphInfo;
  public ismonitor = false;


  private isdebug = true;
  private allcmn = new Common();
  private mycmn = new MyCmn();

  public myinit() {
    this.initgradata();
    this.reset_element();  
  }

  public reset_zoom() {
    // console.log('reset_zoom');
    this.mouse_down_x = 0;
    this.mouse_down_y = 0;
    this.axis_frame_x = this.axis_frame_x_base;
    this.axis_frame_y = this.axis_frame_y_base;
    this.expansion_x_rate = 1;
    this.expansion_y_rate = 1;
    this.x_axisinfo.offset = 0;
    this.y_axisinfo.offset = 0;   
    this.myinitcanvas();
    this.mouse_info.move(0, 0,
      this.x_axisinfo,
      this.y_axisinfo);

    this.reset_element();
    this.mydrawfile();
    this.resetviewbox();
    this.setviewbox(0, 0, 0, 0);
  }

  public myinitcanvas() {
    this.svg_graline_wrapper.style.width = this.axis_frame_x.toString() + 'px';
    this.svg_graline_wrapper.style.height = this.axis_frame_y.toString() + 'px';
    this.svg_graline_wrapper.style.left = DefData.axis_mrg + 'px';
    this.svg_graline_wrapper.style.top = DefData.y_axis_topmrg + DefData.menu_h + 'px';
    this.svg_graline_wrapper.style.position = 'absolute';
    this.svg_graline_wrapper.id = this.dataid;
    this.svg_wrapper.appendChild(this.svg_graline_wrapper);

    this.svg_drawrect_wrapper.style.width = this.axis_frame_x.toString() + 'px';
    this.svg_drawrect_wrapper.style.height = this.axis_frame_y.toString() + 'px';
    this.svg_drawrect_wrapper.style.left = DefData.axis_mrg + 'px';
    this.svg_drawrect_wrapper.style.top = DefData.y_axis_topmrg + DefData.menu_h + 'px';
    this.svg_drawrect_wrapper.style.position = 'absolute';
    this.svg_drawrect.setAttribute('width', this.svg_drawrect_wrapper.style.width);
    this.svg_drawrect.setAttribute('height', this.svg_drawrect_wrapper.style.height);
    this.svg_drawrect.style.position = 'absolute';
    this.svg_wrapper.appendChild(this.svg_drawrect_wrapper);

    this.svg.setAttribute('width', this.svg_graline_wrapper.style.width);
    this.svg.setAttribute('height', this.svg_graline_wrapper.style.height);
    this.svg.style.position = 'absolute';
    
    this.svg_xaxis.setAttribute('width', this.svg_graline_wrapper.style.width);
    this.svg_xaxis.setAttribute('height',
                    (this.svg_graline_wrapper.clientHeight + DefData.axis_mrg).toString());
    this.svg_xaxis.style.position = 'absolute';
    this.svg_xaxis.style.top = DefData.menu_h + 'px';
    this.svg_xaxis.style.left = DefData.axis_mrg + 'px';

    this.svg_yaxis.setAttribute('width',
        (this.svg_graline_wrapper.clientWidth + DefData.axis_mrg + DefData.x_axis_rightmrg).toString());
    this.svg_yaxis.setAttribute('height', this.axis_frame_y.toString() + 'px');
    this.svg_yaxis.style.position = 'absolute';
    this.svg_yaxis.style.top = DefData.y_axis_topmrg + DefData.menu_h + 'px';

    this.mouse_info = new MouseInfo(DefData.axis_mrg,
      this.axis_frame_x,
      DefData.y_axis_topmrg,
      this.axis_frame_y,
      this.isdebug);
  }

  public mydrawfile() {
    if (this.x_data_buf.length > 0
        && this.y_data_buf.length > 0) {

      const axis_col = '#000000';
      const axis_linewidth = '2';
      
      this.draw_xaxis(
                  axis_col,
                  axis_linewidth);

      this.draw_yaxis(
                  axis_col,
                  axis_linewidth);

      if (this.isdisplay) {
        this.draw_grabase(this.prt_allginfo.grakind);
      }
      this.retspanpos_x();
    }
  }

  public setdispspan_x(from: number, to: number) {
    this.impsetdispspan_x(from, to);
  }

  public setdispspan_x_manual(from: number, to: number) {
    return this.impsetdispspan_x(from, to, false);
  }

  public impsetdispspan_x(from: number, to: number, autoflag: boolean=true) {
    if (from < to) {
      const wkfromframe = this.mycmn.getData2Frame(
          Math.abs(from - this.x_axisinfo.mind_mrg),
          Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg),
          this.axis_frame_x_base
      );
      const wktoframe = this.mycmn.getData2Frame(
          Math.abs(to - this.x_axisinfo.mind_mrg),
          Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg),
          this.axis_frame_x_base
      );

      this.expansion_x_rate = 0;
      this.expansion_y_rate = 0;
      this.imp_zoom(
          this.axis_frame_x_base / (wktoframe - wkfromframe),
          1,
          1);

      // manual span was setted after zoom.
      if (!autoflag) {
        //console.log('autoflag: false');
        this.prt_allginfo.all_gra_disp_start_manual 
            = this.mycmn.getDatalistDateStr(new Date(from));
        this.prt_allginfo.all_gra_disp_end_manual 
            = this.mycmn.getDatalistDateStr(new Date(to));
        this.prt_allginfo.all_gra_disp_avrg_manual
            = this.setdispavrg(from, to);
      }
      
      // don't have to retlimitoffscheck. because imp_zoom is reset before offset.
      this.x_axisinfo.offset = wkfromframe * this.expansion_x_rate;
      let wkprt_allginfo = this.retspanpos_x();
      
      this.setviewbox(
        0,
        0,
        this.x_axisinfo.offset,
        this.y_axisinfo.offset);

      // console.log('disp_set');
    }
  }

  public setdatalisttitle() {
    if (!(this.allcmn.isvalid(this.xaxis_title) && this.xaxis_title !== '')) {
      this.xaxis_title = DefData.def_title_datetime_str;
    }
    if (!(this.allcmn.isvalid(this.yaxis_title) && this.yaxis_title !== '')) {
      this.yaxis_title = DefData.def_title_data_str;
    }

    this.datalist_title
      = this.xaxis_title
        + ' / '
        + this.yaxis_title
        + ' / '
        + this.unitstr_buf;
  }

  public reset_element() {
    if (this.svg_graline_wrapper != null) {
      while (this.svg_graline_wrapper.firstChild) {
        this.svg_graline_wrapper.removeChild(this.svg_graline_wrapper.firstChild);
      }
    }
    if (this.svg != null) {
      while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
      }
    }
    if (this.svg_xaxis != null) {
      while (this.svg_xaxis.firstChild) {
        this.svg_xaxis.removeChild(this.svg_xaxis.firstChild);
      }
    }
    if (this.svg_yaxis != null) {
      while (this.svg_yaxis.firstChild) {
        this.svg_yaxis.removeChild(this.svg_yaxis.firstChild);
      }
    }
  }

  public reset_element_drawrect() {
    if (this.svg_drawrect != null) {
      while (this.svg_drawrect.firstChild) {
        this.svg_drawrect.removeChild(
          this.svg_drawrect.firstChild
        );
      }
    }
    if (this.svg_drawrect_wrapper != null) {
      while (this.svg_drawrect_wrapper.firstChild) {
        this.svg_drawrect_wrapper.removeChild(
          this.svg_drawrect_wrapper.firstChild
        );
      }
    }
    this.mouse_info.drawrect_reset();
  }

  public delete_element() {
    this.svg = null;
    this.svg_xaxis = null;
    this.svg_yaxis = null;
  }

  public initgradata() {
    this.x_data_buf = [];
    this.y_data_buf = [];
    this.x_data_base_buf = [];
    this.y_data_base_buf = [];
    // this.datastr_list = [];
    this.datalistinfos = [];
    this.x_axisinfo.reset();
    this.y_axisinfo.reset();
  }

  public imp_zoom(
      rate_x_number: number,
      rate_y_number: number,
      zoom_flag: number) {

    this.mouse_down_x = 0;
    this.mouse_down_y = 0;

    this.reset_element();

    let wkdx = 1, wkdy = 1;

    if (zoom_flag === 1) {  // zoom_in
      this.expansion_x_rate += rate_x_number;
      this.expansion_y_rate += rate_y_number;
      wkdx = this.expansion_x_rate - rate_x_number;
      if (wkdx === 0) wkdx = 1;
      wkdy = this.expansion_y_rate - rate_y_number;
      if (wkdy === 0) wkdy = 1;
    } else if (zoom_flag === 2) { // zoom_out
      this.expansion_x_rate -= rate_x_number;
      this.expansion_y_rate -= rate_y_number;
      wkdx = this.expansion_x_rate + rate_x_number;
      if (wkdx === 0) wkdx = 1;
      wkdy = this.expansion_y_rate + rate_y_number;
      if (wkdy === 0) wkdy = 1;
    }

    this.x_axisinfo.offset
        = this.x_axisinfo.offset * this.expansion_x_rate / wkdx;
        this.y_axisinfo.offset
        = this.y_axisinfo.offset * this.expansion_y_rate / wkdy;

    let wkzoom_init = false;
    this.axis_frame_x = this.axis_frame_x_base * this.expansion_x_rate;
    if (this.axis_frame_x <= this.axis_frame_x_base
        && this.expansion_y_rate !== 1) {
      wkzoom_init = true;
    }

    if (this.prt_allginfo.grakind !== GraphKind.bar) {
      this.axis_frame_y = this.axis_frame_y_base * this.expansion_y_rate;
      if (this.axis_frame_y <= this.axis_frame_y_base
          && this.expansion_y_rate !== 1) {
        wkzoom_init = true;
      }
    }
    if (wkzoom_init) {
      this.reset_zoom();
    } else {
      this.mydrawfile();
      this.setviewbox(
        0,
        0,
        this.x_axisinfo.offset,
        this.y_axisinfo.offset);
    }
  }

  public imp_mousedown(
        in_client_x: number,
        in_client_y: number,
        in_ctrlkeydownflag: boolean) {

    this.mouse_down_x = in_client_x;
    this.mouse_down_y = in_client_y;

    if (this.allcmn.isvalid(this.mouse_info)) {
      this.mouse_info.init();
    }
    if (in_ctrlkeydownflag) {
      this.reset_element_drawrect();
      this.mouse_info.drawrect_start_x = in_client_x - DefData.axis_mrg;
      if (this.prt_allginfo.grakind === GraphKind.line) {
        this.mouse_info.drawrect_start_y = in_client_y - DefData.menu_h - DefData.y_axis_topmrg;
      } else if (this.prt_allginfo.grakind === GraphKind.bar) {
        this.mouse_info.drawrect_start_y = 0;
      }
    }
  }

  public imp_mousemove_keydown(
      in_client_x: number,
      in_client_y: number,
      in_drawflag: boolean = true) {

    this.mouse_info.drawrect_end_x = in_client_x - DefData.axis_mrg;
    if (this.prt_allginfo.grakind === GraphKind.line) {
      this.mouse_info.drawrect_end_y = in_client_y - DefData.menu_h - DefData.y_axis_topmrg;
    } else if (this.prt_allginfo.grakind === GraphKind.bar) {
      this.mouse_info.drawrect_end_y = this.axis_frame_y_base;
    }
    
    if (Math.abs(this.mouse_info.drawrect_start_y - this.mouse_info.drawrect_end_y) > 5
        && Math.abs(this.mouse_info.drawrect_start_x - this.mouse_info.drawrect_end_x) > 5) {
      if (in_drawflag) {
        if (this.svg_drawrect != null) {
          // console.log(this);
          while (this.svg_drawrect.firstChild) {
            this.svg_drawrect.removeChild(this.svg_drawrect.firstChild);
          }
        }
        if (this.svg_drawrect_wrapper != null) {
          while (this.svg_drawrect_wrapper.firstChild) {
            this.svg_drawrect_wrapper.removeChild(this.svg_drawrect_wrapper.firstChild);
          }
        }
        //
        // absolute position
        const rect = new MyRect(
          this.mouse_info.drawrect_start_x,
          this.mouse_info.drawrect_start_y,
          this.mouse_info.drawrect_end_x,
          this.mouse_info.drawrect_end_y,
          DefData.drag_rect_col,
          '1');
          this.svg_drawrect.appendChild(rect.setRectPos());
          this.svg_drawrect_wrapper.appendChild(this.svg_drawrect);
      }
    }
  }

  public imp_mousemove_msdown(in_client_x: number, in_client_y: number) {
    let wkmsdownflag = false;
    if (!(this.expansion_x_rate === 1 && this.expansion_y_rate === 1)) {
      if (this.mouse_info.isvalid()) {
        wkmsdownflag = this.setviewbox(
                  in_client_x,
                  in_client_y,
                  this.x_axisinfo.offset,
                  this.y_axisinfo.offset);
        return wkmsdownflag;
      }
    }
    return false;
  }

  public imp_mouseup(in_client_x: number, in_client_y: number) {
    if (!(this.expansion_x_rate === 1 && this.expansion_y_rate === 1)) {
      //this.msdownflag = false;
      this.mouse_info.reset();  // TODO

      this.x_axisinfo.offset
        = this.retlimitoffs_x(-in_client_x + this.mouse_down_x + this.x_axisinfo.offset);
      this.y_axisinfo.offset 
        = this.retlimitoffs_y(in_client_y - this.mouse_down_y + this.y_axisinfo.offset);

      /*
      console.log('mouse_up:'
        + 'xoffs:' + this.x_axisinfo.offset 
        + ', yoffs:' + this.y_axisinfo.offset
        + ', clientY:' + in_client_y
        + ', mouse_down_y:' + this.mouse_down_y);
      */
      this.retspanpos_x();
    } else {
      //this.msdownflag = false;
    }
  }

  public imp_keyup() {
    let reterrmes = '';
    let mes = '';

    /*
    console.log('keyup:' 
      + this.mouse_info.drawrect_end_x + ',' + this.mouse_info.drawrect_start_x + ','
      + this.mouse_info.drawrect_end_y + ',' + this.mouse_info.drawrect_start_y
      );
    */

    if (Math.abs(this.mouse_info.drawrect_end_x - this.mouse_info.drawrect_start_x) > 30
        && Math.abs(this.mouse_info.drawrect_end_y - this.mouse_info.drawrect_start_y) > 30) {
      // 1. get the drawrect rawdata of absolute.
      // 2. refresh zoom
      // 3. redraw with rawdata span.
      //this.crt_disp_spanx_st = this.mycmn.getFrame2Data(
      let wkdata_x_st = this.mycmn.getFrame2Data(
        this.x_axisinfo.offset + this.mouse_info.drawrect_start_x,
        this.axis_frame_x,
        Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg)
      );
      //this.crt_disp_spanx_ed = this.mycmn.getFrame2Data(
      let wkdata_x_ed = this.mycmn.getFrame2Data(
        this.mouse_info.drawrect_end_x - this.mouse_info.drawrect_start_x,
        this.axis_frame_x,
        Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg)
      );
      // this.crt_disp_spany_st = this.mycmn.getFrame2Data(
      let wkdata_y_st = this.mycmn.getFrame2Data(
          (-this.y_axisinfo.offset + this.mouse_info.drawrect_start_y - DefData.y_axis_topmrg
              + (this.axis_frame_y - this.axis_frame_y_base)),
              this.axis_frame_y,
          Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg)
      );
      // this.crt_disp_spany_ed = this.mycmn.getFrame2Data(
      let wkdata_y_ed = this.mycmn.getFrame2Data(
          (-this.y_axisinfo.offset + this.mouse_info.drawrect_end_y - DefData.y_axis_topmrg
            + (this.axis_frame_y - this.axis_frame_y_base)),
            this.axis_frame_y,
          Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg)
      );

      /*
      console.log('datay:' + this.y_axisinfo.offset
        + ',max_d:' + this.y_axisinfo.maxd_mrg
        + ',st:' + (Math.abs(this.y_axisinfo.maxd_mrg) - wkdata_y_st)
        + ',ed:' + (Math.abs(this.y_axisinfo.maxd_mrg) - wkdata_y_ed));
      */

      if ((this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg)
          / Math.abs(wkdata_x_ed) < 100) {
        /*
        console.log(
          (wkdata_x_st + this.x_axisinfo.mind_mrg) + ',' +
          (wkdata_x_st + wkdata_x_ed + this.x_axisinfo.mind_mrg));
        */
        /*
        console.log((Math.abs(this.y_axisinfo.maxd_mrg) - wkdata_y_st) + ',' +
            (Math.abs(this.y_axisinfo.maxd_mrg) - wkdata_y_ed));
        */
        this.setdispspan_all(
          wkdata_x_st + this.x_axisinfo.mind_mrg,
          wkdata_x_st + wkdata_x_ed + this.x_axisinfo.mind_mrg,
          Math.abs(this.y_axisinfo.maxd_mrg) - wkdata_y_st,
          Math.abs(this.y_axisinfo.maxd_mrg) - wkdata_y_ed
        );
        // reterrmes = '';
      } else {
        reterrmes = DefData.err_mes_expansion_rate;
      }
    } else {
      reterrmes = DefData.err_mes_drawrect;
    }
    this.reset_element_drawrect();
    // this.mouse_info.drawrect_reset();

    if (reterrmes !== '') {
      const dialogRef = this.prt_allginfo.dialog.open(MsgDialogComponent, {
        width: '350px',
        data: {
          button: 'ok',
          mes: reterrmes
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result !== null && result !== undefined) {
        } else {
        }
      });
    }
    return reterrmes;
  }

  public draw_xaxis(
      in_col: string,
      in_linewidth: string) {

    const crdnt_bf = new MyPos(0, 0);
    const crdnt_af = new MyPos(this.axis_frame_x + DefData.x_axis_rightmrg + DefData.axis_mrg, 0);
    
    this.conv_myPos(crdnt_bf);
    this.conv_myPos(crdnt_af);

    // 1 is margin of line's width
    const lineOne = new MyLine(crdnt_bf.x - 1,
                          crdnt_bf.y,
                          crdnt_af.x,
                          crdnt_af.y,
                          in_col,
                          in_linewidth);

    if (this.high_index) {
      this.svg_xaxis.appendChild(lineOne.setLinePos());
      this.svg_wrapper.appendChild(this.svg_xaxis);
    }

    if (this.retaxisinfo(1)) {
      
      this.retspand_time();
      // for initialize display.
      let wkmin_x_base = Number.MAX_SAFE_INTEGER - 1;
      let wkmax_x_base = Number.MIN_SAFE_INTEGER + 1;
      this.prt_allginfo.oneinfo.forEach(d_crt_ginfo => {
        if (d_crt_ginfo.x_data_base_buf[0] < wkmin_x_base) {
          wkmin_x_base = d_crt_ginfo.x_data_base_buf[0];
        }
        if (wkmax_x_base < d_crt_ginfo.x_data_base_buf[d_crt_ginfo.x_data_base_buf.length - 1]) {
          wkmax_x_base = d_crt_ginfo.x_data_base_buf[d_crt_ginfo.x_data_base_buf.length - 1];
        }
      });
      this.prt_allginfo.gra_disp_start_base
        = this.mycmn.getDatalistDateStr(new Date(wkmin_x_base));
      this.prt_allginfo.gra_disp_end_base
        = this.mycmn.getDatalistDateStr(new Date(wkmax_x_base));

      // have to check after calculated span.
      if (!(this.prt_allginfo.grakind == GraphKind.bar
          && this.prt_allginfo.grabarspan === GraphBarSpan_str.tm_1day)) {
        this.adjust_startdata(1);
      }

      // call function (draw string of axis)
      let pos_d = this.x_axisinfo.mind;
      let fp_loop = 0;

      while (pos_d < this.x_axisinfo.maxd_mrg + this.x_axisinfo.span_d && fp_loop++ < 10000) {
        if (this.high_index) {
          this.draw_xaxis_onetext(pos_d);
        }
        pos_d += this.x_axisinfo.span_d;
      }
      if (fp_loop > 10000) {
        console.log('fp_loop');
      }
    }
  }

  public draw_yaxis(
      in_col: string,
      in_linewidth: string) {

    // draw axis
    const crdnt_bf = new MyPos(0, 0);
    const crdnt_af = new MyPos(0, this.axis_frame_y + DefData.y_axis_topmrg);
    let fp_loop = 0;
    // if axis is y, MyPos x=this.axis_mrg.
    this.conv_myPos(crdnt_bf, new MyPos(DefData.axis_mrg, DefData.axis_mrg));
    this.conv_myPos(crdnt_af, new MyPos(DefData.axis_mrg, DefData.axis_mrg));

    const lineOne = new MyLine(crdnt_bf.x,
                          crdnt_bf.y,
                          crdnt_af.x,
                          crdnt_af.y,
                          in_col,
                          in_linewidth);

    if (this.high_index) {
      this.svg_yaxis.appendChild(lineOne.setLinePos());
      this.svg_wrapper.appendChild(this.svg_yaxis);
    }

    // make string of axis
    if (this.retaxisinfo(2)) {

      if (!this.retspand_number()) { return false; }
      // call function (draw string of axis)
      if (this.y_axisinfo.mind < 0
          && 0 < this.y_axisinfo.mind + this.y_axisinfo.span_d) {
        this.y_axisinfo.mind = 0;
      }

      // have to check after calculated span.
      this.adjust_startdata(2);
      let pos_d = this.y_axisinfo.mind;
      if (this.high_index) {
        while (pos_d < this.y_axisinfo.maxd_mrg + this.y_axisinfo.span_d && fp_loop++ < 10000) {
          this.draw_yaxis_onetext(pos_d);
          pos_d += this.y_axisinfo.span_d;
        }
      }
    }
    if (fp_loop > 10000) {
      console.log('fp_loop');
    }
  }

  public isoverlimit_ydata(d: number) {
    const ret = (d < DefData.y_data_l_limit || DefData.y_data_u_limit < d) ?
      true : false;
    return ret;
  }

  // ++++ private function ++++
  // private retspanpos_x() {
  private retspanpos_x() {
    if (this.prt_allginfo.all_gra_disp_start_manual == '' 
        && this.prt_allginfo.all_gra_disp_end_manual == '') {
      const offs = this.x_axisinfo.offset;
      const wkdata_x_st = this.mycmn.getFrame2Data(
                              offs,
                              this.axis_frame_x,
                              Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg)
                            );

      const wkdata_x_ed = this.mycmn.getFrame2Data(
                              this.axis_frame_x_base,
                              this.axis_frame_x,
                              Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg)
                            );
      this.prt_allginfo.all_gra_disp_start
        = this.mycmn.getDatalistDateStr(new Date(wkdata_x_st + this.x_axisinfo.mind_mrg));
      this.prt_allginfo.all_gra_disp_end
        = this.mycmn.getDatalistDateStr(new Date(wkdata_x_st + this.x_axisinfo.mind_mrg + wkdata_x_ed));
      this.gra_disp_avrg
        = this.setdispavrg(
            wkdata_x_st + this.x_axisinfo.mind_mrg,
            wkdata_x_st + wkdata_x_ed + this.x_axisinfo.mind_mrg);
    } else {
      this.prt_allginfo.all_gra_disp_start = this.prt_allginfo.all_gra_disp_start_manual;
      this.prt_allginfo.all_gra_disp_end = this.prt_allginfo.all_gra_disp_end_manual;
      this.prt_allginfo.all_gra_disp_avrg = this.prt_allginfo.all_gra_disp_avrg_manual;
    }

    return this.prt_allginfo;
    /*
    console.log('x1, xlast, pos: '
        + this.mycmn.getDateStr(new Date(this.crt_ginfo.x_axisinfo.mind_mrg))
        + ','
        + this.mycmn.getDateStr(new Date(this.crt_ginfo.x_axisinfo.mind))
        + ',
        + this.mycmn.getDateStr(new Date(wkdata_x_st + this.crt_ginfo.x_axisinfo.mind_mrg))
        + ','
        + this.mycmn.getDateStr(new Date(wkdata_x_st + this.crt_ginfo.x_axisinfo.mind_mrg + wkdata_x_ed))
        );
    */
  }

  private retspand_number() {
    // adjust number of span_rawdata
    const wknum = 10;
    const info = this.y_axisinfo;
    if (this.allcmn.isvalid_NaN(info.span_d) && info.span_d !== 0) {
      let wkdcmlpos = info.span_d < 10 ? 0.0001 : 1;  // 0.0001 is decimalpoint of min data
      let fp_err_count = 0;
      let fp_loop = 0;
      while (fp_loop++ < 10000) {
        if (++fp_err_count > 20) { console.log('FP_error'); }
        if (0 < info.span_d && info.span_d <= 1 * wkdcmlpos) {
          info.span_d = 1 * wkdcmlpos;
        } else if (1 * wkdcmlpos < info.span_d && info.span_d <= 2 * wkdcmlpos) {
          info.span_d = 2 * wkdcmlpos;
        } else if (2 * wkdcmlpos < info.span_d && info.span_d <= 4 * wkdcmlpos) {
          info.span_d = 4 * wkdcmlpos;
        } else if (4 * wkdcmlpos < info.span_d && info.span_d <= 5 * wkdcmlpos) {
          info.span_d = 5 * wkdcmlpos;
        } else if (5 * wkdcmlpos < info.span_d && info.span_d <= 10 * wkdcmlpos) {
          info.span_d = 10 * wkdcmlpos;
        } else {
          wkdcmlpos *= wknum;
          if (this.isdebug) {
            // console.log('check_info.span.d:' + info.span_d + ',' + wkdcmlpos);
          }
          continue;
        }

        if (this.isdebug) {
          // console.log('span_d:' + info.span_d);
        }
        break;
      }
      if (fp_loop > 10000) {
        console.log('fp_loop');
      }
      info.span_sign_digits = Math.log10(wkdcmlpos);
      const wkdigit = parseInt(this.fixed_digit_buf, 10);
      if (info.span_sign_digits < wkdigit) {
        info.span_sign_digits = wkdigit;
      }
      return true;
    } else {
      return false;
    }
  }
  
  private retspand_time() {
    const info = this.x_axisinfo;
    // adjust number of span_rawdata
    const tm_1sec = 1000 * 1;
    const tm_2sec = 1000 * 2;
    const tm_5sec = 1000 * 5;
    const tm_10sec = 1000 * 10;
    const tm_30sec = 1000 * 30;
    const tm_1min = 1000 * 60;
    const tm_2min = 1000 * 60 * 2;
    const tm_5min = 1000 * 60 * 5;
    const tm_10min = 1000 * 10 * 60;
    const tm_30min = 1000 * 20 * 60
    const tm_1hour = 1000 * 60 * 60;
    const tm_2hour = 1000 * 60 * 60 * 2;
    const tm_4hour = 1000 * 60 * 60 * 4;
    const tm_8hour = 1000 * 60 * 60 * 8;
    const tm_12hour = 1000 * 60 * 60 * 12;
    const tm_1day = 1000 * 60 * 60 * 24;
    const tm_5day = 1000 * 60 * 60 * 24 * 5;
    const tm_10day = 1000 * 60 * 60 * 24 * 10;
    const tm_30day = 1000 * 60 * 60 * 24 * 30;
    const tm_60day = 1000 * 60 * 60 * 24 * 60;
    const tm_1year = 1000 * 60 * 60 * 24 * 365;

    let wkdefspan = [0, tm_1sec, tm_2sec, tm_5sec, tm_10sec, tm_30sec,
          tm_1min, tm_2min, tm_5min, tm_10min, tm_30min,
          tm_1hour, tm_2hour, tm_4hour, tm_8hour, tm_12hour,
          tm_1day, tm_5day, tm_10day, tm_30day, tm_60day, tm_1year];
    let wkpos = 0;
    let wkcalcspan = info.span_d;
    let fp_loop = 0;
    while (wkpos + 1 < wkdefspan.length && fp_loop++ < 10000) {
      wkcalcspan = this.impcalcspantime(wkdefspan[wkpos], wkdefspan[wkpos+1], info.span_d);
      if (wkcalcspan !== -1) {
        let wkspanframe = this.mycmn.getData2Frame(wkcalcspan,
          Math.abs(info.maxd_mrg - info.mind_mrg),
          this.axis_frame_x);
        if (wkspanframe < DefData.min_span_frame_x) {
          wkcalcspan = wkpos + 2 < wkdefspan.length ? wkdefspan[wkpos+2] : info.span_d;
          // console.log(wkcalcspan);
        }
        break;
      }
      wkpos++;
    }
    info.span_d = wkcalcspan;
    if (this.isdebug) {
      // console.log('spand_tm:' + info.span_d);
    }
  }

  private adjust_startdata(in_xyflag: number) {
    // out_info.spand => adjusted spand
    // adjust to nice round number
    let out_info = in_xyflag === 1 ? this.x_axisinfo : this.y_axisinfo;
    const wkadjust = out_info.mind / out_info.span_d;

    out_info.mind = out_info.span_d * Math.floor(wkadjust);
    // if adjusted number is small than yaxis_frame, re-adjust.
    let wkframe = in_xyflag === 1 ? this.axis_frame_x : this.axis_frame_y;
    const wkcheck = this.mycmn.getData2Frame(out_info.mind - out_info.mind_mrg,
                    Math.abs(out_info.maxd_mrg - out_info.mind_mrg),
                    wkframe);
    if (wkcheck < 0) {
      out_info.mind += out_info.span_d;
    }
  }

  private retlimitoffs_x(in_offset) {
    let wkxlimitoffset = this.axis_frame_x - this.axis_frame_x_base;
    let ret = in_offset;
    if (in_offset > wkxlimitoffset) {
      ret = wkxlimitoffset;
    } else if (in_offset < 0) {
      ret = 0;
    }
    return ret;
  }

  private retlimitoffs_y(in_offset) {
    let wkylimitoffset = this.axis_frame_y - this.axis_frame_y_base;
    let ret = in_offset;
    if (in_offset > wkylimitoffset) {
      ret = wkylimitoffset;
    } else if (in_offset < 0) {
      ret = 0;
    }
    return ret;
  }

  private setviewbox(
              clientX: number,
              clientY: number,
              axis_offs_x: number,
              axis_offs_y: number) {

    // !!attention sign
    let wkoffs_x = clientX - this.mouse_down_x - axis_offs_x;

    let wkretx = this.retlimitoffs_x(-wkoffs_x);
    if (wkretx != -wkoffs_x) {
      wkoffs_x = -wkretx;
      this.x_axisinfo.offset = wkretx;
    }

    let wkoffs_y = 0;
    if (this.prt_allginfo.grakind === GraphKind.line) {
      wkoffs_y = (clientY !== 0 && this.mouse_down_y !== 0) 
          ? (clientY - this.mouse_down_y + axis_offs_y) : axis_offs_y;
      let wkrety = this.retlimitoffs_y(wkoffs_y);
      if (wkrety != wkoffs_y) {
        wkoffs_y = wkrety;
        this.y_axisinfo.offset = wkrety;
      }
    } else if (this.prt_allginfo.grakind === GraphKind.bar) {
      this.y_axisinfo.offset = 0;
    }

    // * this clientRect is ok.
    const wkviewbox = '' + (-wkoffs_x).toString() + ' ' + (-wkoffs_y).toString()
                        + ' ' + this.svg.clientWidth
                        + ' ' + this.svg.clientHeight;
    const wkviewbox_xaxis = '' + (-wkoffs_x).toString() + ' ' + 0
                        + ' ' + this.svg_xaxis.clientWidth
                        + ' ' + this.svg_xaxis.clientHeight;
    const wkviewbox_yaxis = '' + 0 + ' ' + (-wkoffs_y).toString()
                        + ' ' + this.svg_yaxis.clientWidth
                        + ' ' + this.svg_yaxis.clientHeight;

    this.svg.setAttribute('viewBox', wkviewbox);
    this.svg_xaxis.setAttribute('viewBox', wkviewbox_xaxis);
    this.svg_yaxis.setAttribute('viewBox', wkviewbox_yaxis);
    // this.mouse_info.move(clientX, clientY, this.crt_ginfo.x_axisinfo, this.crt_ginfo.y_axisinfo);

    return true;
  }

  private resetviewbox() {
    const wkviewbox = '' + 0 + ' ' + 0
      + ' ' + this.svg.clientWidth
      + ' ' + this.svg.clientHeight;
      this.svg.setAttribute('viewBox', wkviewbox);

    const wkviewbox_xaxis = '' + 0 + ' ' + 0
                        + ' ' + this.svg_xaxis.clientWidth
                        + ' ' + this.svg_xaxis.clientHeight;
    this.svg_xaxis.setAttribute('viewBox', wkviewbox_xaxis);

    const wkviewbox_yaxis = '' + 0 + ' ' + 0
                        + ' ' + this.svg_yaxis.clientWidth
                        + ' ' + this.svg_yaxis.clientHeight;
    this.svg_yaxis.setAttribute('viewBox', wkviewbox_yaxis);
  }

  private setdispspan_all(
    in_from_x: number,
    in_to_x: number,
    in_from_y: number,
    in_to_y: number) {

    // console.log(in_from_y + ',' + in_to_y)
    let wkfromx = in_from_x < in_to_x ? in_from_x : in_to_x;
    let wktox = in_from_x < in_to_x ? in_to_x: in_from_x;
    let wkfromy = in_from_y < in_to_y ? in_from_y : in_to_y;
    let wktoy = in_from_y < in_to_y ? in_to_y : in_from_y;

    const wkfromframex = this.mycmn.getData2Frame(
        Math.abs(wkfromx - this.x_axisinfo.mind_mrg),
        Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg),
        this.axis_frame_x_base
    );
    const wktoframex = this.mycmn.getData2Frame(
        Math.abs(wktox - this.x_axisinfo.mind_mrg),
        Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg),
        this.axis_frame_x_base
    );

    let wkfromframey = this.mycmn.getData2Frame(
        Math.abs(wkfromy - this.y_axisinfo.mind_mrg),
        Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg),
        this.axis_frame_y_base
    );
    const wktoframey = this.mycmn.getData2Frame(
        Math.abs(wktoy - this.y_axisinfo.mind_mrg),
        Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg),
        this.axis_frame_y_base
    );

    const wkpos_bf = new MyPos(
      wkfromframex,
      wkfromframey);
    const wkpos_af = new MyPos(
      wktoframex,
      wktoframey);

    this.expansion_x_rate = 0;
    this.expansion_y_rate = 0;
    
    this.imp_zoom(
      this.axis_frame_x_base / (wkpos_af.x - wkpos_bf.x),
      this.axis_frame_y_base / Math.abs(wkpos_af.y - wkpos_bf.y),
      1);

    // don't have to retlimitoffscheck. because imp_zoom is reset before offset.
    this.x_axisinfo.offset = wkpos_bf.x * this.expansion_x_rate;
    this.y_axisinfo.offset = wkpos_bf.y * this.expansion_y_rate - DefData.y_axis_topmrg;

    // console.log(this.x_axisinfo.offset + ',' + this.y_axisinfo.offset);
    this.retspanpos_x();
    this.setviewbox(
      0,
      0,
      this.x_axisinfo.offset,
      this.y_axisinfo.offset);
  }

  private draw_xaxis_onetext(d: number) {
    const info = this.x_axisinfo;
    // draw string of axis
    const wkframe = this.mycmn.getData2Frame((d - info.mind_mrg),
                        Math.abs(info.maxd_mrg - info.mind_mrg),
                        this.axis_frame_x);
    const wkpos_bf = new MyPos(wkframe, 0);
    const wkpos_af = new MyPos(wkframe, 0);
    const text_col = DefData.axis_text_col;
    this.conv_myPos(wkpos_af);
    // test bbb--- if (wkpos_af.x + info.span_min_frame * 0.5 - DefData.axis_mrg >= this.axis_frame_x) {
    if (wkpos_af.x - DefData.axis_mrg >= this.axis_frame_x) {
      if (this.isdebug) {
        // console.log('span_min_frame:' + info.span_min_frame);
      }
      return;
    }
    const textOne_MD = new MyText(this.mycmn.getDateStr_MD(new Date(d), true, this.ismilliflag),
                        wkpos_af.x - DefData.axis_mrg + 40,
                        wkpos_af.y + 12,
                        text_col);
    const textOne_HMS = new MyText(this.mycmn.getDateStr_HMS(new Date(d), true, this.ismilliflag),
                        wkpos_af.x - DefData.axis_mrg + 40,
                        wkpos_af.y + 25,
                        text_col);

    this.svg_xaxis.appendChild(textOne_MD.setContext());
    this.svg_xaxis.appendChild(textOne_HMS.setContext());

    // draw horizontal_line of axis
    const line_width = DefData.axis_line_w.toString();
    const line_col = DefData.axis_line_col;
    const crdnt_af = new MyPos(wkpos_bf.x, this.axis_frame_y);
    this.conv_myPos(crdnt_af);
    if (crdnt_af.y <= DefData.y_axis_topmrg) {
      crdnt_af.y = DefData.y_axis_topmrg;
    }
    const lineOne = new MyLine(crdnt_af.x,
                          crdnt_af.y,
                          wkpos_af.x,
                          wkpos_af.y,
                          line_col,
                          line_width);

    this.svg_xaxis.appendChild(lineOne.setLinePos());
    this.svg_wrapper.appendChild(this.svg_xaxis);
  }

  private draw_yaxis_onetext(d: number) {
    const info = this.y_axisinfo;
    // adjust dispaly string of axis
    const wkd = !this.isoverlimit_ydata(d) ?
        d.toFixed(Math.abs(info.span_sign_digits)) : d.toFixed(0);
    // draw string of axis
    if (this.isdebug) {
      // console.log('margin_y:' + d + ',' + info.mind_mrg + ' ' + info.maxd_mrg);
      // console.log('uuu:' + wkd);
    }

    const wkframe = this.mycmn.getData2Frame((d - info.mind_mrg),
                        Math.abs(info.maxd_mrg - info.mind_mrg),
                        this.axis_frame_y);
    const col_text = DefData.axis_text_col;
    const wkpos_bf = new MyPos(0, wkframe);
    const wkpos_af = new MyPos(0, wkframe);

    // if axis is y, MyPos x=this.axis_mrg.
    this.conv_myPos(wkpos_af, new MyPos(DefData.axis_mrg, DefData.axis_mrg));
    const textOne = new MyText(wkd,
                        wkpos_af.x - DefData.axis_mrg + 10,
                        wkpos_af.y + 5,
                        col_text);
    this.svg_yaxis.appendChild(textOne.setContext());

    // draw vertical_line of axis
    const col = DefData.axis_text_col;
    const line_width = DefData.axis_line_w.toString();

    const crdnt_af = new MyPos(this.axis_frame_x, wkpos_bf.y);
    // if axis is y, MyPos x=this.axis_mrg.
    this.conv_myPos(crdnt_af, new MyPos(DefData.axis_mrg, DefData.axis_mrg));
    if (this.svg_yaxis.clientWidth - DefData.x_axis_rightmrg <= crdnt_af.x) {
      crdnt_af.x = this.svg_yaxis.clientWidth - DefData.x_axis_rightmrg;
    }
    const lineOne = new MyLine(wkpos_af.x,
                          wkpos_af.y,
                          crdnt_af.x - 2,
                          crdnt_af.y,
                          col,
                          line_width);

    this.svg_yaxis.appendChild(lineOne.setLinePos());
    this.svg_wrapper.appendChild(this.svg_yaxis);
  }

  public draw_grabase(in_gkind: GraphKind) {    
    switch(in_gkind) {
      case GraphKind.line:
        this.draw_graline();
        break;
      case GraphKind.bar:
        this.draw_grabar();
        break;
      default:
        break;
    }
  }

  private draw_graline(in_linewidth: string='3') {
    const x_d = this.x_data_buf;
    const y_d = this.y_data_buf;
    if (this.x_data_buf.length === 1) {
      // msg
      return;
    }
    const x_dwidth = Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg);
    const y_dwidth = Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg);
    // console.log(in_crt_ginfo.dataid + '=' + in_crt_ginfo.svg.childNodes.length);
    let wksvgaddflag = false;
    // console.log('start draw');

    if (x_dwidth != 0 && y_dwidth != 0) {
      let wkextend_lineflag = false;
      for (let i = 0; i < x_d.length - 1; i++) {
        if (i >= y_d.length - 1) { break; }  // FP
      // calc position
        if (y_d[i] !== def_err_data && y_d[i+1] !== def_err_data) {
          const wkpos_x_bf = this.mycmn.getData2Frame((x_d[i] - this.x_axisinfo.mind_mrg),
                                x_dwidth,
                                this.axis_frame_x);
          const wkpos_y_bf = y_d[i] !== def_err_data ?
                              this.mycmn.getData2Frame((y_d[i] - this.y_axisinfo.mind_mrg),
                                y_dwidth,
                                this.axis_frame_y) : def_err_data;

          for (let j=i; j<x_d.length-1; j++) {
            const wkpos_x_af = this.mycmn.getData2Frame((x_d[1 + j] - this.x_axisinfo.mind_mrg),
                                  x_dwidth,
                                  this.axis_frame_x);
            const wkpos_y_af = y_d[1 + j] !== def_err_data ?
                                this.mycmn.getData2Frame((y_d[1 + j] - this.y_axisinfo.mind_mrg),
                                  y_dwidth,
                                  this.axis_frame_y) : def_err_data;
            
            //TODO Caution! Outliner
            if (x_d.length > this.axis_frame_x_base && wkpos_x_af - wkpos_x_bf < 2) continue;

              // console.log(wkpos_x_bf + ',' + wkpos_x_af);
              const wkpos_bf = new MyPos(wkpos_x_bf, wkpos_y_bf);
              const wkpos_af = new MyPos(wkpos_x_af, wkpos_y_af);
              this.conv_myPos(wkpos_bf);
              this.conv_myPos(wkpos_af);
              const lineOne = new MyLine(wkpos_bf.x,
                                    wkpos_bf.y,
                                    wkpos_af.x,
                                    wkpos_af.y,
                                    this.colstr_buf,
                                    in_linewidth);
              this.svg.appendChild(lineOne.setLinePos());
              wksvgaddflag = true;
              i = j;
              wkextend_lineflag = true;
              break;
            // }
          }
          if (!wkextend_lineflag) {
            // console.log('FP: extend_line');
            break;
          }
        } else {
          // console.log('def_err_data');
        }
      }
    }
    if (wksvgaddflag) {
      this.svg_graline_wrapper.appendChild(this.svg);
    }
  }

  private draw_grabar() {

    const x_d = this.x_data_buf;
    const y_d = this.y_data_buf;
    if (this.x_data_buf.length === 1) {
      // msg
      return;
    }
    const x_dwidth = Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg);
    const y_dwidth = Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg);

    let bar_width = (this.axis_frame_x * this.x_data_buf_min_intvl / x_dwidth) / 2

    if (bar_width < 1) bar_width = 1;
    if (x_dwidth != 0 && y_dwidth != 0) {
      for (let i = 0; i < x_d.length; i++) {
        // if (i >= y_d.length - 1) { break; }  // FP
        // calc position
        if (y_d[i] !== def_err_data && y_d[i] !== 0) {
          const wkpos_x = this.mycmn.getData2Frame((x_d[i] - this.x_axisinfo.mind_mrg),
                                x_dwidth,
                                this.axis_frame_x);
          const wkpos_y = y_d[i] !== def_err_data ?
                              this.mycmn.getData2Frame((y_d[i] - this.y_axisinfo.mind_mrg),
                                y_dwidth,
                                this.axis_frame_y) : def_err_data;
          const wkpos_y_base = this.mycmn.getData2Frame((0 - this.y_axisinfo.mind_mrg),
                                  y_dwidth,
                                  this.axis_frame_y);
          // console.log(wkpos_x_bf + ',' + wkpos_x_af);
          const wkpos = new MyPos(wkpos_x, wkpos_y);
          const wkpos_base = new MyPos(wkpos_x, wkpos_y_base);
          this.conv_myPos(wkpos);
          this.conv_myPos(wkpos_base);
          const barOne = new MyRect(
            wkpos.x - bar_width,
            wkpos.y,
            wkpos.x + bar_width,
            wkpos_base.y,
            this.colstr_buf,
            '1');

          // console.log(barOne);
          this.svg.appendChild(barOne.setRectPos());
        } else {
          // console.log('def_err_data');
        }
      }
      this.svg_graline_wrapper.appendChild(this.svg);
    }
  }  
  private retaxisinfo(in_xyflag: number) {
    // calc max. and min.
    let maxd;
    let wk_min_span_frame, wk_min_spand_split;
    let wk_axis_frame;
    let out_info;
    if (in_xyflag === 1) {
      maxd = this.x_data_buf_max;
      out_info = this.x_axisinfo;
      wk_min_span_frame = DefData.min_span_frame_x;
      wk_min_spand_split = DefData.min_spand_x_split;
      wk_axis_frame = this.axis_frame_x;
      out_info.mind = this.x_data_buf_min;
      // console.log(out_info.mind);
    } else {
      maxd = this.y_data_buf_max;
      out_info = this.y_axisinfo;
      wk_min_span_frame = DefData.min_span_frame_y;
      wk_min_spand_split = DefData.min_spand_y_split;
      wk_axis_frame = this.axis_frame_y;
      out_info.mind = this.prt_allginfo.grakind === GraphKind.line ?
          this.y_data_buf_min : 0;
    }
    
    // console.log('in_rawdatalen:' + in_rawdata.length);
    if (!(this.allcmn.isvalid_NaN(wk_min_span_frame) && wk_min_span_frame >= 0)) {
      // console.log(this.allcmn.isvalid_NaN(in_min_span_frame));
      return false;
    }
    // adjust height of span_rawdata
    // that is changed involved in count of split
    let wkframe = wk_axis_frame;
    let wkminsplit = wk_min_spand_split;
    let fp_loop = 0;
    while (wk_min_span_frame <= wkframe && fp_loop++ < 10000) {
      // +++Correspond DecimalPoint of spand +++
      if (this.prt_allginfo.grakind === GraphKind.line
          || this.prt_allginfo.grakind === GraphKind.bar && in_xyflag === 2 
          || this.prt_allginfo.grakind === GraphKind.bar 
              && in_xyflag === 1
              && this.prt_allginfo.grabarspan === GraphBarSpan_str.tm_auto) {
        let wkspand;
        if (maxd !== out_info.mind) {
          wkspand = Math.abs(maxd - out_info.mind) / wkminsplit++;
          let wkdecimalpos = 0;

          while (wkspand < 1.0 && fp_loop++ < 10000) {
            wkspand *= 10;
            wkdecimalpos++;
          }
          wkdecimalpos == 0 ? 1 : wkdecimalpos;
          out_info.span_d = Math.round(wkspand) / Math.pow(10, wkdecimalpos);
        } else {
          out_info.span_d = 1;
        }
        // +++ +++
        wkframe = this.mycmn.getData2Frame(out_info.span_d,
          Math.abs(maxd - out_info.mind),
          wk_axis_frame);
      } else { //if (this.prt_allginfo.grakind === GraphKind.bar) {
        out_info.span_d = this.mycmn.retGraphBarSpan(this.prt_allginfo.grabarspan) * 1000;
        // bar && in_xyflag === 1
        wkframe = this.mycmn.getData2Frame(out_info.span_d,
          Math.abs(maxd - out_info.mind),
          wk_axis_frame);
        // console.log('barspand:' + maxd + ',' + out_info.mind + ',' + out_info.span_d + ',' + wkframe);
        break;
      }

      if (maxd === out_info.mind) { break; }
    }
    if (fp_loop > 10000) {
      console.log('fp_loop');
    }

    // mind_mrg and maxd_mrg is calculated only initialization.
    if (out_info.maxd_mrg === 0 && out_info.mind_mrg === 0) {
      // out_info.maxd_mrg = maxd + out_info.span_d / 2;
      if (this.prt_allginfo.grakind === GraphKind.line) {
        out_info.maxd_mrg = maxd + out_info.span_d / 2;
        out_info.mind_mrg = out_info.mind - out_info.span_d / 2;
      } else if (this.prt_allginfo.grakind === GraphKind.bar) {
        if (in_xyflag === 1) {
          // xaxis
          if (this.prt_allginfo.grabarspan !== GraphBarSpan_str.tm_auto) {
            out_info.maxd_mrg = maxd + out_info.span_d * 1.5;
            out_info.mind_mrg = out_info.mind - out_info.span_d * 2;
            // let wktm = parseInt((out_info.mind / (out_info.span_d * 1000)).toString(), 10);
            let wktm = out_info.span_d;
            // console.log(wktm);
            out_info.mind_mrg = out_info.mind - out_info.span_d * 1.5;
          } else {
            out_info.maxd_mrg = maxd + out_info.span_d / 2;
            out_info.mind_mrg = out_info.mind - out_info.span_d / 2;    
          }
        } else {
          out_info.maxd_mrg = maxd + out_info.span_d / 2;
          // yaxis
          out_info.mind_mrg = out_info.mind;
        }
      }
      /*
      if (in_xyflag === 1)
        console.log('spand:' + out_info.mind_mrg + ',' + out_info.maxd_mrg + ',' + out_info.span_d + ',' + in_xyflag);
      */
    }

    if (wkframe < wk_min_span_frame) {
      wkframe = wk_min_span_frame;
      if (in_xyflag === 1) {
        // if (this.prt_allginfo.grakind === GraphKind.line) {
          out_info.span_d = this.mycmn.getFrame2Data(wkframe,
                                  this.axis_frame_x,
                                  Math.abs(this.x_axisinfo.maxd_mrg - this.x_axisinfo.mind_mrg));
        // console.log('ooo:' + out_info.span_d);
        // }
      } else {
        if (this.prt_allginfo.grakind === GraphKind.line) {
          out_info.span_d = this.mycmn.getFrame2Data(wkframe,
            this.axis_frame_y,
            Math.abs(this.y_axisinfo.maxd_mrg - this.y_axisinfo.mind_mrg));
        }
      }
    }
    // console.log(wkframe + ',' + out_info.span_d);
    out_info.span_min_frame = wkframe;
    //

    return true;
  }

  private impcalcspantime(st: number, ed: number, d: number) {
    // console.log(st + ',' + d + ',' + ed);
    if (st < d && d <= ed) {
      return ed;
    }
    return -1;
  }

  private conv_myPos(
              pos: MyPos,
              org_pos: MyPos= new MyPos(0, DefData.axis_mrg)) {
    pos.x = pos.x + org_pos.x;
    pos.y = this.svg_wrapper.clientHeight - (pos.y + org_pos.y);
  }

  private setdispavrg(
      st: number,
      ed: number) {
    let pos = 0;
    let sumcount = 0;
    let wkd = 0;

    this.x_data_buf.forEach(d => {
      if (st <= d && d <= ed) {
        if (this.y_data_buf[pos] != def_err_data)
          wkd += this.y_data_buf[pos];
        sumcount++;
      }
      pos++;
    });

    return (!isNaN(wkd / sumcount) ? (wkd / sumcount).toFixed(2) : DefData.def_invalid_data_str);
  }

}

type Position = 'start' | 'mid' | 'end';

enum BarKind {
  on = 'ON',
  off = 'OFF',
  close = 'CLOSE',
  open = 'OPEN'
}

enum GraphBarSpan {
  min_1 = 60,
  min_10 = 60 * 10,
  hour_1 = 60 * 60,
  day_1 = 60 * 60 * 24,
  auto = 0
}

class OneDatalistInfo {
  constructor(data: string,
      ismax: boolean = false,
      ismin: boolean = false) {
    this.data = data;
    this.ismax = ismax;
    this.ismin = ismin;
  }

  public data: string;
  public ismax: boolean;
  public ismin: boolean;
}

class MyPos {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public x: number;
  public y: number;
}

class MyCmn {
  constructor() {

  }
  public allcmn = new Common();

  public getMax(d: number[], mrg: number= 0) {
    const max = d.reduce((a, b) => {
      return (Math.max(a, b) + mrg);
    });

    return max;
  }

  public getMin(d: number[], mrg: number= 0) {
    const min = d.reduce((a, b) => {
      return (Math.min(a, b) + mrg);
    });

    return min;
  }

  public getData2Frame(d: number, d_len: number, frame_len: number) {
    return ((frame_len / d_len) * d);
  }

  public getFrame2Data(frame: number, frame_len: number, d_len: number) {
    return ((d_len / frame_len) * frame);
  }

  public getDatalistDateStr(tmd: Date,
      delimflag: boolean = true,
      millflag: boolean = false) {
    const YY = tmd.getFullYear();
    if (!millflag) {
      return (YY
        + (delimflag ? '/' : '')
        + this.getDateStr(tmd, delimflag));
    } else {
      return this.getDateStr(tmd, delimflag, true);
    }
  }

  public getDatalistDayStr(tmd: Date,
      delimflag: boolean = true,
      millflag: boolean = false) {
    const YY = tmd.getFullYear();
    if (!millflag) {
      return (YY
        + (delimflag ? '/' : '')
        + this.getDateStr_MD(tmd, delimflag));
    } else {
      return this.getDateStr_MD(tmd, delimflag, true);
    }
  }

  public getDateStr(tmd: Date,
      delimflag: boolean = true,
      millflag: boolean = false) {
    const wktmstr = 
        (!millflag ?
          (this.change_dt(tmd.getMonth() + 1)
            + (delimflag ? '/' : '')
            + this.change_dt(tmd.getDate())
            + (delimflag ? ' ' : '')) : '')
        + this.change_dt(tmd.getHours())
        + (delimflag ? ':' : '')
        + this.change_dt(tmd.getMinutes())
        + (delimflag ? ':' : '')
        + this.change_dt(tmd.getSeconds())
        + (millflag ? 
          ('.' + this.change_dt(tmd.getMilliseconds(), true)) : '')

    // console.log(tmd.getMilliseconds());
    return wktmstr;
  }

  public getDateStr_MD(tmd: Date,
      delimflag: boolean = true,
      millflag: boolean = false) {
    let wktmstr;
    if (!millflag) {
      wktmstr = this.change_dt(tmd.getMonth() + 1)
          + (delimflag ? '/' : '')
          + this.change_dt(tmd.getDate())
    } else {
      wktmstr = '';
    }
    return wktmstr;
  }

  public getDateStr_HMS(tmd: Date,
      delimflag: boolean = true,
      milliflag: boolean = false) {
    const wktmstr = 
        this.change_dt(tmd.getHours())
        + (delimflag ? ':' : '')
        + this.change_dt(tmd.getMinutes())
        + (delimflag ? ':' : '')
        + this.change_dt(tmd.getSeconds())
        + (milliflag ? ('.' + this.change_dt(tmd.getMilliseconds(), true)) : '');

    return wktmstr;
  }

  public retkmydatefmt(serial_dt, rowdata, milliflag = false) {
    const date = new Date(parseFloat(serial_dt));
    const wkmonth = this.change_dt(date.getMonth() + 1);
    const wkday = this.change_dt(date.getDate());
    const wkhour = this.change_dt(date.getHours());
    const wkmin = this.change_dt(date.getMinutes());
    const wksec = this.change_dt(date.getSeconds());
    let wkmilli = '';
    if (milliflag) {
      wkmilli = date.getMilliseconds().toString();
      // console.log(wkmill);
    }
    const space = rowdata === '' ? '' : ' ';
    const ret = (date.getFullYear().toString() + wkmonth + wkday + wkhour + wkmin + wksec + wkmilli) + space + rowdata;
    return ret;
  }

  public convDateStr2Number(in_str: string, in_dlm: boolean = false) {
    // ex. 2020/01/10 12:30:00 ⇒ in_dlm:true
    // ex. 20200110123000 ⇒ in_dlm:false
    let retnum = 0;
    let wkdlm = 0;
    let wkstr = '';
    let wkyear = '';
    let wkmon = '';
    let wkday = '';
    let wkhour = '';
    let wkmin = '';
    let wksec = '';
    let wkmill = '';
    let wkcrtstr = '';
    let wkpos = 0;

    if (in_str!.length >= 14) {
      if (!in_dlm) {
        wkyear = in_str.slice(0, 4);
        if (in_dlm) { wkdlm++; }
        wkmon = in_str.slice(4 + wkdlm, 6 + wkdlm);
        if (in_dlm) { wkdlm++; }
        wkday = in_str.slice(6 + wkdlm, 8 + wkdlm);
        if (in_dlm) { wkdlm++; }
        wkhour = in_str.slice(8 + wkdlm, 10 + wkdlm);
        if (in_dlm) { wkdlm++; }
        wkmin = in_str.slice(10 + wkdlm, 12 + wkdlm);
        if (in_dlm) { wkdlm++; }
        wksec = in_str.slice(12 + wkdlm, 14 + wkdlm);
        if (in_str!.length >= 17) {
          wkmill = in_str.slice(14 + wkdlm, 17 + wkdlm);
          // console.log(wkmill);
        }
      } else {
        // tslint:disable-next-line: prefer-for-of
        let wkclm = 0;
        for (let i = 0; i < in_str.length; i++) {
          wkstr = in_str.substring(i, i + 1);
          // console.log(wkstr);
          // year
          if (wkyear === '') {
            if (wkstr !== '/') {
              wkcrtstr += wkstr;
            } else {
              wkyear = wkcrtstr;
              wkcrtstr = '';
              wkclm++;
              continue;
            }
          } else if (wkmon === '' && wkclm === 1) {
            if (wkstr !== '/') {
              wkcrtstr += wkstr;
            } else {
              wkmon = wkcrtstr;
              wkcrtstr = '';
              wkclm++;
              continue;
            }
          } else if (wkday === '' && wkclm === 2) {
            if (wkstr !== ' ') {
              wkcrtstr += wkstr;
            } else {
              wkday = wkcrtstr;
              wkcrtstr = '';
              wkclm++;
              continue;
            }
          } else if (wkhour === '' && wkclm === 3) {
            if (wkstr !== ':') {
              wkcrtstr += wkstr;
            } else {
              wkhour = wkcrtstr;
              wkcrtstr = '';
              wkclm++;
              continue;
            }
          } else if (wkmin === '' && wkclm === 4) {
            if (wkstr !== ':') {
              wkcrtstr += wkstr;
            } else {
              wkmin = wkcrtstr;
              wkcrtstr = '';
              wkclm++;
              continue;
            }
          } else if (wksec === '' && wkclm === 5) {
            wkcrtstr += wkstr;
            wkstr = '';
          }
        }
        wksec = wkcrtstr;
      }
      // if sec. is no data.
      if (wkmin === '') { wkmin = wkcrtstr; }
      if (wksec === '') { wksec = '0'; }
      if (wkmill === '') { wkmill = '0'; }
      // console.log(wkyear + ' ' + wkmon + ' ' + wkday + ' ' + wkhour + ' ' + wkmin + ' ' + wksec);
      let wkyear_num = parseInt(wkyear, 10);
      let wkmon_num = parseInt(wkmon, 10);
      let wkday_num = parseInt(wkday, 10);
      let wkhour_num = parseInt(wkhour, 10);
      let wkmin_num = parseInt(wkmin, 10);
      let wksec_num = parseInt(wksec, 10);
      let wkmill_num = parseInt(wkmill, 10);
      if (this.allcmn.isvalid_tmstr(
            wkyear_num,
            wkmon_num,
            wkday_num,
            wkhour_num,
            wkmin_num,
            wksec_num,
            wkmill_num)) {
        const wkdate = new Date(wkyear_num,
                          wkmon_num - 1,
                          wkday_num,
                          wkhour_num,
                          wkmin_num,
                          wksec_num,
                          wkmill_num);
        retnum = wkdate.getTime();
      }
    }
    // console.log(retnum);
    return retnum;
  }

  // 1:open 2:close (if door data)
  public convRawDataStr2Number(in_str: string) {
    // if in_str is 'open' or 'close' then convert to like next line.
    let ret = this.allcmn.isnumber(in_str) !== null ? parseFloat(in_str) : def_err_data;
    // test bbb+++
    if (in_str.indexOf('open') != -1 || in_str.indexOf('close') != -1) ret = 1;
    // TODO distinguish open and close.

    if (ret !== def_err_data
        && ret < def_valid_max_data
        && def_valid_min_data < ret) {
      return ret;
    } else {
      return def_err_data;
    }
  }

  public convNumber2FixedStr(in_d: number, in_fixednum: number = 1) {
    if (in_d !== def_err_data) {
      if (in_d === parseInt(in_d.toString(), 10)) {
        return in_d.toFixed(in_fixednum);
      }
      return in_d.toFixed(in_fixednum);
    } else {
      return DefData.def_invalid_data_str;
    }
    // TODO effective digit.
  }

  public retGraphBarSpan(in_gspan: GraphBarSpan_str) {
    let wkspan = 0;
    switch(in_gspan) {
      case GraphBarSpan_str.tm_1min:
        wkspan = GraphBarSpan.min_1;
        break;
      case GraphBarSpan_str.tm_10min:
        wkspan = GraphBarSpan.min_10;
        break;
      case GraphBarSpan_str.tm_1hour:
        wkspan = GraphBarSpan.hour_1;
        break;
      case GraphBarSpan_str.tm_1day:
        wkspan = GraphBarSpan.day_1;
        break;
      case GraphBarSpan_str.tm_auto:
        wkspan = 0;
        break;
      default:
        break;
    }
    return wkspan;
  }

  // ++++ private function ++++
  private change_dt(d: number, milliflag: boolean=false) {
    const wk = d.toString();
    if (milliflag) {
      if (d < 10) {
        return ('00' + wk);
      } else if (d < 100) {
        return ('0' + wk);
      }
    } else {
      if (d < 10) {
        return ('0' + wk);
      }
    }
    return wk;
  }

  // +++++++ for Debug +++++++
  public Debug_CreateTimeData(max_len: number) {
    const st = 1569996000000;
    const onespan = 1000 * 60 * 5;  // 5min
    const span = 1000 * 60 * 60 * 24 * 10;  // 10day
    let retcount = 0;
    let tmdata: number[];
    tmdata = [];

    for (let i = st; i < st + span; i = i + onespan) {
      tmdata.push(i);
      // console.log(i);
      if (max_len <= ++retcount) {
        break;
      }
    }

    return tmdata;
  }

  public Debug_CreateRawData(max_len: number) {
    const st = -10;
    const onespan = 5;
    const span = 30;
    let retcount = 0;
    let rawdata: number[];
    rawdata = [];
    do {
      for (let i = st; i < st + span; i = i + onespan) {
        rawdata.push(i);
        // console.log(i);
        if (max_len <= ++retcount) {
          break;
        }
      }
    } while (retcount < max_len);

    return rawdata;
  }
}

class MyText {
  private x: number;
  private y: number;
  private col: string;
  private content: string;
  private text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  constructor(in_content: string,
              in_x: number, in_y: number,
              in_col: string) {

      this.x = in_x;
      this.y = in_y;
      this.col = in_col;
      this.content = in_content;
  }

  public setContext() {
    // console.log(this.col + ' ' + this.x + ' ' + this.y + ' ' + this.content);
    this.text.setAttribute('x', this.x.toString());
    this.text.setAttribute('y', this.y.toString());
    this.text.setAttribute('fill', this.col);
    this.text.setAttribute('font-size', '0.7rem');
    // this.text.setAttribute('fill', '#000');
    this.text.textContent = this.content;

    return this.text;
  }
}

class MyLine {
  private x1: number;
  private x2: number;
  private y1: number;
  private y2: number;
  private line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  // private line: any;
  private col: string;
  private width: string;

  constructor(
          in_x1: number, in_y1: number, in_x2: number, in_y2: number,
          in_col: string,
          in_width: string) {
    // this.line = in_line;
    this.x1 = in_x1;
    this.x2 = in_x2;
    this.y1 = in_y1;
    this.y2 = in_y2;
    this.col = in_col;
    this.width = in_width;
  }

  public setLinePos() {
    this.line.setAttribute('width', '0');
    this.line.setAttribute('height', '0');
    this.line.setAttribute('x1', this.x1.toString());
    this.line.setAttribute('y1', this.y1.toString());
    this.line.setAttribute('x2', this.x2.toString());
    this.line.setAttribute('y2', this.y2.toString());
    this.line.setAttribute('stroke', this.col);
    this.line.setAttribute('stroke-width', this.width);

    return this.line;
  }
}

class MyRect {
  private x1: number;
  private x2: number;
  private y1: number;
  private y2: number;
  private rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  // private line: any;
  private col: string;
  private width: string;
  // private mycmn = new Common();

  constructor(
          in_x1: number, in_y1: number, in_x2: number, in_y2: number,
          in_col: string,
          in_width: string) {
    if (in_x1 < in_x2) {
      this.x1 = in_x1;
      this.x2 = in_x2;
    } else {
      this.x1 = in_x2;
      this.x2 = in_x1;
    }
    if (in_y1 < in_y2) {
      this.y1 = in_y1;
      this.y2 = in_y2;
    } else {
      this.y2 = in_y1;
      this.y1 = in_y2;
    }
    this.col = in_col;
    this.width = in_width;
  }

  public setRectPos() {
    // console.log(this.rect);
    this.rect.setAttributeNS(null,
        'width',
        (Math.abs(this.x2 - this.x1)).toString());
    this.rect.setAttributeNS(null,
        'height',
        (Math.abs(this.y2 - this.y1)).toString());
    this.rect.setAttributeNS(null,
        'x',
        (this.x1).toString());
    this.rect.setAttributeNS(null,
        'y',
        (this.y1).toString());

    if (this.width !== '') {
      this.rect.setAttributeNS(null, 
          'stroke',
          'black');
      this.rect.setAttributeNS(null, 
          'stroke-width',
          this.width);
    }
    
    this.rect.setAttributeNS(null, 
        'fill',
        this.col);

        //'#'+Math.round(0xffffff * Math.random()).toString(16));

    return this.rect;
  }
}

class AxisInfo {
  constructor() {
  }
  public mind = 0;
  public maxd = 0;
  public maxd_mrg = 0;  // rawdata include margin
  public mind_mrg = 0;  // rawdata include margin
  public span_d = 0;
  public span_sign_digits = 0;
  public span_min_frame = 0;
  public offset = 0;

  public reset() {
    this.mind = 0;
    this.maxd = 0;
    this.maxd_mrg = 0;  // rawdata include margin
    this.mind_mrg = 0;  // rawdata include margin
    this.span_d = 0;
    this.span_sign_digits = 0;
    this.span_min_frame = 0;
    this.offset = 0;
  }
}

class MouseInfo {
  constructor(in_axis_mrg: number = 0,
              in_axis_frame_x: number = 0,
              in_y_axis_topmrg: number = 0,
              in_axis_frame_y: number = 0,
              isdebug = false) {
    this.xdata = -1;
    this.ydata = -1;
    this.axis_mrg = in_axis_mrg;
    this.axis_frame_x = in_axis_frame_x;
    this.y_axis_topmrg = in_y_axis_topmrg;
    this.axis_frame_y = in_axis_frame_y;

    this.drawrect_start_x = -1;
    this.drawrect_start_y = -1;
    this.isdebug = isdebug;
  }
  private isdebug: boolean;
  private mycmn = new MyCmn();
  private axis_mrg: number;
  private axis_frame_x: number;
  private y_axis_topmrg: number;
  private axis_frame_y: number;

  public xdata: number;
  public ydata: number;

  public drawrect_start_x: number;
  public drawrect_start_y: number;
  public drawrect_end_x: number;
  public drawrect_end_y: number;

  public move(abs_mouse_pos_x: number,
              abs_mouse_pos_y: number,
              x_axisinfo: AxisInfo,
              y_axisinfo: AxisInfo,
              expansion_rate: number= 1) {

    // console.log('move');
    this.xdata = this.mycmn.getFrame2Data((abs_mouse_pos_x - this.axis_mrg),
          this.axis_frame_x,
          Math.abs(x_axisinfo.maxd_mrg - x_axisinfo.mind_mrg))
        + Math.abs(x_axisinfo.mind_mrg);

    // test 30 ⇒ menu height
    this.ydata = this.mycmn.getFrame2Data((abs_mouse_pos_y
                          - this.y_axis_topmrg
                          - 30),
        this.axis_frame_y,
        Math.abs(y_axisinfo.maxd_mrg - y_axisinfo.mind_mrg));
    this.ydata = Math.abs(y_axisinfo.maxd_mrg) - this.ydata;
  }

  public isvalid() {
    return (this.xdata !== -1 && this.ydata !== -1) ? true : false;
  }
  public init() {
    this.xdata = 0;
    this.ydata = 0;
  }
  public reset() {
    this.xdata = -1;
    this.ydata = -1;
  }
  public drawrect_reset() {
    this.drawrect_start_x = -1;
    this.drawrect_start_y = -1;
    this.drawrect_end_x = -1;
    this.drawrect_end_y = -1;
  }
}

class AdjustInfo {
  private slope_str: string;
  private intercept_str: string;
  public formula: string;

  private slope: number;
  private intercept: number;

  constructor(
  ) {
    this.slope = 1;
    this.intercept = 0;
    this.slope_str = '1';
    this.intercept_str = '0';
    this.formula = this.getformula();
  }

  public setslopestr(in_slope: string) {
    this.slope_str = in_slope;
    this.slope = parseFloat(in_slope);
  }

  public getslopestr() {
    return this.slope_str;
  }

  public getinterceptstr() {
    return this.intercept_str;
  }

  public setinterceptstr(in_intercept: string) {
    this.intercept_str = in_intercept;
    this.intercept = parseFloat(in_intercept);
  }

  public getformula() {
    return (this.retformula(this.slope_str, this.intercept_str));
  }

  public getcalc_y(xdata: number) {
    // console.log(this.slope + ',' + this.intercept);
    return (xdata * this.slope + this.intercept);
  }

  public retformula(in_slope_str: string, in_intercept_str: string) {
    let wkadjustformula_slope = 'x';
    let wkadjustformula_intercept = '';
    let wkadjustformula = '';

    if (Math.abs(parseFloat(in_slope_str)) !== 1) {
      wkadjustformula_slope = in_slope_str + 'x';
    }
    if (Math.abs(parseFloat(in_intercept_str)) !== 0) {
      if (parseFloat(this.intercept_str) > 0) {
        wkadjustformula_intercept = ' + ' + in_intercept_str;
      } else {
        wkadjustformula_intercept = ' - ' + Math.abs(parseFloat(in_intercept_str));
      }
    }

    wkadjustformula = 'y = '
        + wkadjustformula_slope
        + wkadjustformula_intercept;

    // console.log(wkadjustformula);
    return wkadjustformula;
  }
}

class GraphColorInfo {
  constructor() {
    this.colstr_list = [];
    // this.colstr_list.push('rgb(65, 105, 225)');
    this.colstr_list.push('#4169e1');
    this.colstr_list.push('#ff0000');
    this.colstr_list.push('#008080');
    this.colstr_list.push('#ffa500');
    this.colstr_list.push('#32cd32');
    this.colstr_list.push('#483d8b');
    this.colstr_list.push('#ffd700');
    this.colstr_list.push('#fa8072');
    this.colstr_list.push('#adff2f');
    this.colstr_list.push('#00ffff');
    this.colstr_list.push('#ffdab9');
    this.colstr_list.push('#808080');
  }

  public colstr_list: string[];
  public convcol(in_col: string) {
    // if the brightness is included, remove it.
    if (in_col.length === 9) {
      // console.log(in_col.slice(3, 9));
      return ('#' + in_col.slice(3, 9));
    }
    return in_col;
  }
}
