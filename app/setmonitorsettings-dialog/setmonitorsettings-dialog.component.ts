import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, NgForm, Validators, FormArray} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
// import { OneDataInfo_Dialog } from '../maingraph/maingraph.component';
import { DefData } from '../maingraph/mygraphclass';
import { Common, InputDataValidator, InputHankakuStrDataValidator } from '../mycommon/common';

@Component({
  selector: 'app-setmonitorsettings-dialog',
  templateUrl: './setmonitorsettings-dialog.component.html',
  styleUrls: ['./setmonitorsettings-dialog.component.css']
})
export class SetmonitorsettingsDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SetmonitorsettingsDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  myInputstrForm: FormGroup;
  allcmn = new Common();
  chcount_value = 1;

  ngOnInit() {
    const wkinitname = this.data.newname;
    this.myInputstrForm = this.fb.group({
      dinfos: this.fb.array([]),
      new_name_server: new FormControl(
          localStorage.getItem(DefData.def_mqtt_server),
          [Validators.required, InputHankakuStrDataValidator()]),
      new_name_port: new FormControl(
          localStorage.getItem(DefData.def_mqtt_port),
          [Validators.required, InputDataValidator()]),
      new_name_username: new FormControl(
          localStorage.getItem(DefData.def_mqtt_username),
          [Validators.required]),
      new_name_password: new FormControl(
          localStorage.getItem(DefData.def_mqtt_password),
          [Validators.required]),
      new_name_topic: new FormControl(
          localStorage.getItem(DefData.def_mqtt_topic),
          [Validators.required, InputDataValidator()]),
      new_name_chcount: new FormControl(
          localStorage.getItem(DefData.def_mqtt_chcount),
          [Validators.required]),
      new_name_ssl: new FormControl(
          localStorage.getItem(DefData.def_mqtt_ssl),
          [Validators.required]),
      new_display_datacount: new FormControl(
          localStorage.getItem(DefData.def_mnt_datacount),
          [Validators.required, InputDataValidator()]),
    });
    this.chcount_value = parseInt(localStorage.getItem(DefData.def_mqtt_chcount), 10);
  }

  save() {
    localStorage.setItem(DefData.def_mqtt_server, this.new_name_server.value);
    localStorage.setItem(DefData.def_mqtt_port, this.new_name_port.value);
    localStorage.setItem(DefData.def_mqtt_username, this.new_name_username.value);
    localStorage.setItem(DefData.def_mqtt_password, this.new_name_password.value);
    localStorage.setItem(DefData.def_mqtt_topic, this.new_name_topic.value);
    localStorage.setItem(DefData.def_mqtt_chcount, this.new_name_chcount.value);
    localStorage.setItem(DefData.def_mqtt_ssl, this.new_name_ssl.value);
    localStorage.setItem(DefData.def_mnt_datacount, this.new_display_datacount.value);
    // not used ??? TODO
    this.data.newstrname_server = this.new_name_server.value;
    this.data.newstrname_port = this.new_name_port.value;
    this.data.newstrname_username = this.new_name_username.value;
    this.data.newstrname_password = this.new_name_password.value;
    this.data.newstrname_topic = this.new_name_topic.value;
    this.data.new_name_chcount = this.new_name_chcount.value;
    this.data.new_name_ssl = this.new_name_ssl.value;
    this.data.new_display_datacount = this.new_display_datacount.value;
    this.dialogRef.close(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  get dinfos(): FormArray {
    return this.myInputstrForm.get('dinfos') as FormArray;
  }
  get new_name_server(): FormControl {
    return this.myInputstrForm.get('new_name_server') as FormControl;
  }
  get new_name_port(): FormControl {
    return this.myInputstrForm.get('new_name_port') as FormControl;
  }
  get new_name_username(): FormControl {
    return this.myInputstrForm.get('new_name_username') as FormControl;
  }
  get new_name_password(): FormControl {
    return this.myInputstrForm.get('new_name_password') as FormControl;
  }
  get new_name_topic(): FormControl {
    return this.myInputstrForm.get('new_name_topic') as FormControl;
  }
  get new_name_ssl(): FormControl {
    return this.myInputstrForm.get('new_name_ssl') as FormControl;
  }
  get new_name_chcount(): FormControl {
    return this.myInputstrForm.get('new_name_chcount') as FormControl;
  }
  get new_display_datacount(): FormControl {
    return this.myInputstrForm.get('new_display_datacount') as FormControl;
  }
}
