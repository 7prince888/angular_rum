import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private api = 'http://localhost:3000/api/items';
  constructor(private http: HttpClient) {}
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }
}
