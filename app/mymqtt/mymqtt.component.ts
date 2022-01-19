import { Component, OnInit, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { MyglobalService } from '../service/myglobal.service';
import { Common } from '../mycommon/common';
import { DefData } from '../maingraph/mygraphclass';
import { MatDialog } from '@angular/material/dialog';
import { MsgDialogComponent } from '../msg-dialog/msg-dialog.component';

@Component({
  selector: 'app-mymqtt',
  templateUrl: './mymqtt.component.html',
  styleUrls: ['./mymqtt.component.css']
})
export class MymqttComponent implements OnInit {
  @Input() getdata: any;
  @Output() msgnotify = new EventEmitter<string>();

  constructor(
    private global: MyglobalService,
    private dialog: MatDialog
  ) { }

  public allcmn = new Common();

  private localmsgcomtime = 0;
  private dialogRef = null;
  private mntstopflag = false;

  ngOnInit() {
    this.global.client = null;
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    let change: SimpleChange = changes['getdata'];
    // console.log('ngchange: ' + change.currentValue);
    
    if (this.allcmn.isvalid(change.currentValue)) {
      if (change.currentValue === '') {
        // console.log('disconnect_mqtt');
        this.mntstopflag = false;
        this.delmqtt();
      } else if (change.currentValue === 'stop_mnt') {
        // for monitoring data stay display.
        this.mntstopflag = true;
        this.delmqtt();
      } else {
        // console.log(change);
        this.mntstopflag = false;
        this.setinit(); // TODO 最小間隔
      }
    }
  }

  svname: string;
  port: number;
  clientId: string;
  username: string;
  password: string;
  ssl: boolean;
  topic: string;
  chcount: number;

  public setinit(autospan = 600) {
    // at this point, a settings of mqttserver exists.
    const wkport = localStorage.getItem(DefData.def_mqtt_port);
    let wkssl = false;
    switch (localStorage.getItem(DefData.def_mqtt_ssl)) {
      case DefData.def_mqtt_ssl_on:
        wkssl = true;
        break;
      case DefData.def_mqtt_ssl_off:
        wkssl = false;
        break;
      default:
        break;
    }

    this.setmqttinfo(
      localStorage.getItem(DefData.def_mqtt_server),
      this.allcmn.isvalid(wkport) ? parseInt(wkport) : 8083,
      (Date.now()).toString(),
      localStorage.getItem(DefData.def_mqtt_username),
      localStorage.getItem(DefData.def_mqtt_password),
      wkssl,
      localStorage.getItem(DefData.def_mqtt_topic)
    );

    this.cmn_initmqtt();

    let timerid = setInterval(() => {
      if (Date.now() - this.localmsgcomtime - autospan * 1000 > 0) { // if no connection span is more 1min. .
        // console.log(this.global.client);
        if (this.global.client !== null) {
          this.cmn_initmqtt();
        }
      }
    }, autospan * 1000);
    //
  }

  public setmqttinfo(
    in_svname: string,
    in_port: number,
    in_clientId: string,
    in_username: string,
    in_password: string,
    in_ssl: boolean,
    in_topic: string) {

    this.svname = in_svname;
    this.port = in_port;
    this.clientId = in_clientId;
    this.username = in_username;
    this.password = in_password;
    this.ssl = in_ssl;
    this.topic = in_topic;

    // console.log('ssl:' + this.ssl);
    // console.log('wkclientId:' + this.wkclientid);
  }

  public cmn_initmqtt(in_lostflag: boolean=false) {
    /* this path is due to some component is exist
    /  (* but maingraph only)*/
    /*
    if (this.global.client !== null && this.global.client.isConnected()) {
      // console.log('mqtt: my reset connect');
      this.global.client.disconnect();
    }
    */
    this.delmqtt();
    /*    
    console.log("sv:" + this.svname);
    console.log(this.port);
    console.log(this.password);
    // console.log('mqtt: my init connect');
    */
    this.global.client
      = new Paho.MQTT.Client(
              this.svname,
              this.port,
              this.clientId);
              //'id_' + this.wkclientid);  // ssl

    this.global.client.connect({
      onSuccess: this.onConnected.bind(this),
      onFailure: this.onFailure.bind(this),      
      useSSL: this.ssl,
      userName: this.username,
      password: this.password
      // reconnect: true // 20190612 test bbb+++  Paho.MQTT.jsが対応していない（バグ）
    });
    if (this.dialogRef !== null) {
      this.dialogRef.close();
      this.dialogRef = null;
    }

    if (!in_lostflag)  {// 最初の一回のみ関数を定義する
      this.onConnectionLost();
    }
  }

  public delmqtt() {
    if (this.global.client !== null && this.global.client.isConnected()) {
      this.global.client.disconnect();
    }
  }

  onConnected() {
    // console.log('conneccted');
    this.global.client.subscribe(this.topic);
    this.onMessage();
  }

  onFailure() {
    console.log('mqtt failure');
    // ※スリープ状態になった場合などNetworkが切断された場合にコールされる
    // →　この状態で再接続しても確立できない
    // →　その場合はブラウザをリフレッシュする必要がある。
    //
    this.global.client = null;
  }

  onMessage() {
    this.global.client.onMessageArrived = (message: Paho.MQTT.Message) => {
      this.msgnotify.emit(message.payloadString);
      this.localmsgcomtime = Date.now();
    }
  }

  onConnectionLost() {
    this.global.client.onConnectionLost = (responseObject: Object) => {
      // console.log('Connection lost : ' + JSON.stringify(responseObject));
      // maingraph only
      this.dialogRef = this.dialog.open(MsgDialogComponent, {
        width: '350px',
        data: {
          button: 'ok',
          mes: DefData.err_mes_network
        }
      });

      this.global.client = null;
      this.clientId = (Date.now()).toString()
      this.localmsgcomtime = 0;
      //
      /* maingraph is not restart.*/
      if (!this.mntstopflag) {
        this.cmn_initmqtt(true);
      }
    };
  }
}
