import {Component, inject, OnInit} from '@angular/core';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {ConservationStore} from '../../../../conservation/application/conservation.store';
import {RequisitionStore} from '../../../../requisition/application/requisition.store';
import {Notifier} from '../../../../communication/application/notifier';
import {Clock} from '../../../../shared/domain/services/clock';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {AnalyticsStore} from '../../../application/analytics.store';
import {REPORT_INDICATORS, ReportIndicator} from '../../../domain/model/report-request';

/** Days before today the report period starts by default. */
const DEFAULT_PERIOD_DAYS = 30;

/** The period must not end before it starts. */
const validPeriod = (group: AbstractControl): ValidationErrors | null => {
  const from = group.get('from')?.value as string;
  const to = group.get('to')?.value as string;
  return from && to && to < from ? {period: true} : null;
};

/** At least one report section must be selected. */
const atLeastOneSection = (group: AbstractControl): ValidationErrors | null =>
  Object.values(group.value as Record<string, boolean>).some(Boolean) ? null : {noSection: true};

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatCheckbox,
    MatFormField,
    MatError,
    MatInput,
    TranslatePipe,
    FormCard
  ],
  selector: 'app-report-form',
  styleUrl: './report-form.css',
  templateUrl: './report-form.html',
})
/**
 * View to configure and generate the operational report as a PDF.
 */
export class ReportForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly analytics = inject(AnalyticsStore);
  private readonly conservation = inject(ConservationStore);
  private readonly requisition = inject(RequisitionStore);
  private readonly clock = inject(Clock);
  private readonly notifier = inject(Notifier);

  protected readonly indicators = REPORT_INDICATORS;
  /** Latest day a report can cover. */
  protected readonly maxDate = this.clock.today().toString();

  protected readonly form = this.fb.group(
    {
      from: [this.clock.today().plusDays(-DEFAULT_PERIOD_DAYS).toString(), Validators.required],
      to: [this.clock.today().toString(), Validators.required],
      format: ['pdf'],
      sections: this.fb.group(
        {alerts: true, requests: true, inventory: true, conservation: true},
        {validators: atLeastOneSection}
      )
    },
    {validators: validPeriod}
  );

  ngOnInit(): void {
    this.analytics.loadAnalytics();
    this.conservation.loadConservation();
    this.requisition.loadRequisition();
  }

  /**
   * Generates the PDF and keeps the user on the form to produce more reports.
   */
  protected generate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {from, to, sections} = this.form.getRawValue();
    const selected = REPORT_INDICATORS.filter((indicator: ReportIndicator) => sections[indicator]);
    const fileName = this.analytics.generateReport({from, to, indicators: selected});
    this.notifier.success('reports.form.generated', {file: fileName});
  }
}
