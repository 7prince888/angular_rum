import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MydataService {

  constructor() { }
   getAppData(): string[] {
    return ['Item 1', 'Item 2', 'Item 3'];
  }
}
