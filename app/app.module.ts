import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// ttt import { MaterialModule } from './material.module';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppComponent } from './app.component';
import { MaingraphComponent } from './maingraph/maingraph.component';
import { DispspanComponent } from './dispspan/dispspan.component';
import { DispspanDialogComponent } from './dispspan-dialog/dispspan-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SetdatanameDialogComponent } from './setdataname-dialog/setdataname-dialog.component';
import { SetunitstrDialogComponent } from './setunitstr-dialog/setunitstr-dialog.component';
import { SetadjustdataDialogComponent } from './setadjustdata-dialog/setadjustdata-dialog.component';
import { SetdeldataDialogComponent } from './setdeldata-dialog/setdeldata-dialog.component';
import { SetcolorDialogComponent } from './setcolor-dialog/setcolor-dialog.component';
import { MsgDialogComponent } from './msg-dialog/msg-dialog.component';
import { CombinegraphDialogComponent } from './combinegraph-dialog/combinegraph-dialog.component';
import { AdsenseModule } from 'ng2-adsense';
import { SetbargraphsettingsDialogComponent } from './setbargraphsettings-dialog/setbargraphsettings-dialog.component';
import { MymqttComponent } from './mymqtt/mymqtt.component';
import { SetdecimaldigitsDialogComponent } from './setdecimaldigits-dialog/setdecimaldigits-dialog.component';
import { SetmonitorsettingsDialogComponent } from './setmonitorsettings-dialog/setmonitorsettings-dialog.component';
import { CdkVirtualScrollFixedBufferComponent } from './cdk-virtual-scroll-fixed-buffer/cdk-virtual-scroll-fixed-buffer.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GoogleAdsenseComponent } from './google-adsense/google-adsense.component';

const appRoutes: Routes = [
  {
    path: 'maingraph',
    component: MaingraphComponent },
  /*
  {
    path: 'heroes',
    component: HeroListComponent,
    data: { title: 'Heroes List' }
  },
  { path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
  */
  {
    path: 'dispspan-dialog',
    component: DispspanDialogComponent
  },
  {
    path: 'setdataname-dialog',
    component: SetdatanameDialogComponent
  },
  {
    path: 'setunitstr-dialog',
    component: SetunitstrDialogComponent
  },
  {
    path: 'setadjustdata-dialog',
    component: SetadjustdataDialogComponent
  },
  {
    path: 'setdeldata-dialog',
    component: SetdeldataDialogComponent
  },
  {
    path: 'setcolor-dialog',
    component: SetcolorDialogComponent
  },
  {
    path: 'msg-dialog',
    component: MsgDialogComponent
  },
  {
    path: 'setbargraphsettings-dialog',
    component: SetbargraphsettingsDialogComponent
  },
  {
    path: 'setdecimaldigits-dialog',
    component: SetdecimaldigitsDialogComponent
  },
  {
    path: 'setmonitorsettings-dialog',
    component: SetmonitorsettingsDialogComponent
  },

];

@NgModule({
  declarations: [
    AppComponent,
    MaingraphComponent,
    DispspanComponent,
    DispspanDialogComponent,
    SetdatanameDialogComponent,
    SetunitstrDialogComponent,
    SetadjustdataDialogComponent,
    SetdeldataDialogComponent,
    SetcolorDialogComponent,
    MsgDialogComponent,
    CombinegraphDialogComponent,
    SetbargraphsettingsDialogComponent,
    MymqttComponent,
    SetdecimaldigitsDialogComponent,
    SetmonitorsettingsDialogComponent,
    CdkVirtualScrollFixedBufferComponent,
    GoogleAdsenseComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,

    MatDialogModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ColorPickerModule,

    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    // other imports here
    /*SharedModule,*/
    /*
    AdsenseModule.forRoot({
      adClient: 'ca-pub-8697434929081249',
      adSlot: 6351438477
    }),
    */
    AdsenseModule.forRoot({
      adClient: 'ca-pub-8697434929081249',
      adSlot: 4251898444
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
