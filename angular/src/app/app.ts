import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ItemsComponent } from './items.component';

@Component({
  selector: 'app-root',
  imports: [HttpClientModule, ItemsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly title = 'frontend';
}
