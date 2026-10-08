import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {Supplier} from '../../../domain/model/supplier.entity';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    TranslatePipe
  ],
  selector: 'app-supplier-card',
  styleUrl: './supplier-card.css',
  templateUrl: './supplier-card.html',
})
/**
 * Presentation component that summarizes one supplier in the directory.
 */
export class SupplierCard {
  /** Supplier to display. */
  supplier = input.required<Supplier>();
  /** Avatar color; alternates in the directory to tell neighbours apart. */
  tone = input<'green' | 'blue'>('green');
}
