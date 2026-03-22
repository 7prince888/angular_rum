import { Routes } from '@angular/router';

import { ComtestComponent } from './comtest/comtest.component';
import { ToggleComponent } from './toggle/toggle.component';

export const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'homexs', component: ComtestComponent },
  { path: 'toggle', component: ToggleComponent },
 
];
