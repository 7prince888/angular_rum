import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsService } from './items.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Items</h2>
      <table *ngIf="items.length; else noData" border="1" cellpadding="8">
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items">
            <td *ngFor="let col of columns">{{ item[col] }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #noData><p>No items available.</p></ng-template>
    </div>
  `
})
export class ItemsComponent implements OnInit {
  items: any[] = [];
  columns: string[] = [];
  constructor(private itemsService: ItemsService) {}
  ngOnInit() {
    this.itemsService.getItems().subscribe(
      (data) => {
        this.items = data || [];
        if (this.items.length) {
          this.columns = Object.keys(this.items[0]);
        }
      },
      (error) => {
        console.error('Failed to load items', error);
      }
    );
  }
}
