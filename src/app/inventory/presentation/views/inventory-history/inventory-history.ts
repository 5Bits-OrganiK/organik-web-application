import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {InventoryStore} from '../../../application/inventory.store';

@Component({
  imports: [RouterLink, MatAnchor, TranslatePipe, StatusBadge],
  selector: 'app-inventory-history',
  styleUrl: './inventory-history.css',
  templateUrl: './inventory-history.html',
})
/**
 * View with the movements of the inventory (who changed what and when) and the offers.
 */
export class InventoryHistory implements OnInit {
  private readonly inventory = inject(InventoryStore);

  protected readonly events = this.inventory.events;
  protected readonly offers = this.inventory.offers;

  ngOnInit(): void {
    this.inventory.loadInventory();
  }
}
