import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';
import {SettingsStore} from '../../../application/settings.store';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatError,
    MatInput,
    TranslatePipe,
    LanguageSwitcher
  ],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
/**
 * View where the administrator sets the interface language and the expiration thresholds.
 */
export class Settings {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(SettingsStore);
  private readonly notifier = inject(Notifier);

  protected readonly form = this.fb.group({
    criticalDays: new FormControl(this.store.expirationPolicy().criticalDays, {nonNullable: true, validators: [Validators.required, Validators.min(0)]}),
    riskDays: new FormControl(this.store.expirationPolicy().riskDays, {nonNullable: true, validators: [Validators.required, Validators.min(this.store.expirationPolicy().criticalDays + 1)]})
  });

  constructor() {
    // The risk threshold must be greater than the critical one.
    this.form.controls.criticalDays.valueChanges.subscribe(critical => {
      this.form.controls.riskDays.setValidators([Validators.required, Validators.min(Number(critical) + 1)]);
      this.form.controls.riskDays.updateValueAndValidity();
    });
  }

  /**
   * Applies the thresholds to the inventory and remembers them.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {criticalDays, riskDays} = this.form.getRawValue();
    this.store.saveExpirationPolicy(Number(criticalDays), Number(riskDays));
    this.notifier.success('settings.expiration.saved');
  }
}
