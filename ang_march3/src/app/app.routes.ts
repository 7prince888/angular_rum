import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { SplunkRumAdminComponent } from './splunk-rum-admin/splunk-rum-admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'myhome', pathMatch: 'full' },
  { path: 'myhome', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'rum', component: SplunkRumAdminComponent },
];
