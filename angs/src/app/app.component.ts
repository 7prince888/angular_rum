import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetapiComponent } from './component/getapi/getapi.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,GetapiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angs';
}
