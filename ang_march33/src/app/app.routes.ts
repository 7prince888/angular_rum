import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { RumComponent } from './rum/rum.component';
import { SplunkRumToggleComponent } from './splunk-rum-toggle/splunk-rum-toggle.component';


export const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'rum', component: RumComponent },
  { path: 'splunk', component: SplunkRumToggleComponent },
];
