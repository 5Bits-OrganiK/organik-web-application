import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ConservationStore} from '../../../application/conservation.store';
import {AlertItem} from '../../../../communication/presentation/components/alert-item/alert-item';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    TranslatePipe,
    AlertItem
  ],
  selector: 'app-conservation-alerts',
  styleUrl: './conservation-alerts.css',
  templateUrl: './conservation-alerts.html',
})
/**
 * View with the prioritized conservation alerts and the way to contact suppliers.
 */
export class ConservationAlerts implements OnInit {
  private readonly store = inject(ConservationStore);

  /** Active alerts, most urgent first. */
  protected readonly alerts = this.store.prioritizedAlerts;

  ngOnInit(): void {
    this.store.loadConservation();
  }
}
