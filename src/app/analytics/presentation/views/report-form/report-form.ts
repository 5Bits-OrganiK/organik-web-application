import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {ConservationStore} from '../../../../conservation/application/conservation.store';
import {RequisitionStore} from '../../../../requisition/application/requisition.store';
import {Notifier} from '../../../../communication/application/notifier';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {AnalyticsStore} from '../../../application/analytics.store';
import {REPORT_INDICATORS, ReportIndicator} from '../../../domain/model/report-request';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';

/** Days before today the report period starts by default. */
const DEFAULT_PERIOD_DAYS = 30;

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatSelectModule,
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
  // The period must not end before it starts, and at least one report section must be selected.
  private readonly fb = inject(FormBuilder);
  private readonly analytics = inject(AnalyticsStore);
  private readonly conservation = inject(ConservationStore);
  private readonly requisition = inject(RequisitionStore);
  private readonly notifier = inject(Notifier);

  protected readonly indicators = REPORT_INDICATORS;
  /** Latest day a report can cover. */
  protected readonly maxDate = CalendarDate.today().toString();

  private readonly from = new FormControl(CalendarDate.today().plusDays(-DEFAULT_PERIOD_DAYS).toString(), {nonNullable: true, validators: Validators.required});

  protected readonly form = this.fb.group({
    from: this.from,
    to: new FormControl(CalendarDate.today().toString(), {nonNullable: true, validators: [Validators.required, control => this.from.value && control.value < this.from.value ? {period: true} : null]}),
    format: new FormControl('pdf', {nonNullable: true}),
    sections: new FormControl<ReportIndicator[]>([...REPORT_INDICATORS], {nonNullable: true, validators: Validators.required})
  });

  constructor() {
    this.from.valueChanges.subscribe(() => this.form.controls.to.updateValueAndValidity());
  }

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
    const selected = REPORT_INDICATORS.filter((indicator: ReportIndicator) => sections.includes(indicator));
    const fileName = this.analytics.generateReport({from, to, indicators: selected});
    this.notifier.success('reports.form.generated', {file: fileName});
  }
}
