import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyglobalService {

  public client = null;
  // public mqtt_topic = '10001031';
  public svname_mqtt = 'v157-7-220-136.myvps.jp';

  constructor() { }
}
