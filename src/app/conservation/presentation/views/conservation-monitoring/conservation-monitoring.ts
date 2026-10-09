import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {ModuleBanner} from '../../../../shared/presentation/components/module-banner/module-banner';
import {BadgeTone, StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {ConservationStore} from '../../../application/conservation.store';
import {ReadingStatus} from '../../../domain/model/reading-status';

const READING_TONE: Readonly<Record<ReadingStatus, BadgeTone>> = {
  normal: 'info',
  warning: 'warning',
  critical: 'danger'
};

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TranslatePipe,
    ModuleBanner,
    StatusBadge
  ],
  selector: 'app-conservation-monitoring',
  styleUrl: './conservation-monitoring.css',
  templateUrl: './conservation-monitoring.html',
})
/**
 * View that monitors the temperature and humidity of each storage zone.
 */
export class ConservationMonitoring implements OnInit {
  private readonly store = inject(ConservationStore);

  protected readonly columns = ['zone', 'product', 'temperature', 'humidity', 'recorded', 'status'];
  protected readonly readings = this.store.readingItems;
  protected readonly zones = this.store.zones;
  protected readonly zonesWithoutReadings = this.store.zonesWithoutReadings;

  protected readonly zoneFilter = signal('');
  protected readonly fromFilter = signal('');
  protected readonly toFilter = signal('');

  /** Readings of the history that match the filters. */
  protected readonly history = computed(() =>
    this.store.history({
      zoneId: this.zoneFilter() || null,
      from: this.fromFilter() || null,
      to: this.toFilter() || null
    })
  );
  protected readonly toneOf = (status: ReadingStatus) => READING_TONE[status];

  protected onZone(event: Event): void {
    this.zoneFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onFrom(event: Event): void {
    this.fromFilter.set((event.target as HTMLInputElement).value);
  }

  protected onTo(event: Event): void {
    this.toFilter.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.store.loadConservation();
  }
}
