import { Component } from '@angular/core';
import { ItemsComponent } from './items.component';

@Component({
  selector: 'app-root',
  imports: [ItemsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly title = 'frontend';
}
