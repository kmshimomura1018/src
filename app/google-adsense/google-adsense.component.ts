import { Component, OnInit, AfterViewInit, Input, isDevMode } from '@angular/core';

@Component({
  selector: 'app-google-adsense',
  templateUrl: './google-adsense.component.html',
  styleUrls: ['./google-adsense.component.css']
})
export class GoogleAdsenseComponent implements OnInit, AfterViewInit {
  devMode = false;
  constructor() {
    //20210719 test bbb--- this.devMode = isDevMode();
  }

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    /*
    try {
      console.log('google ads');
      (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
    } catch (e) {
      console.log(e);
    }
    */
  }
}
