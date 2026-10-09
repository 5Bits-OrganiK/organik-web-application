import {Component, inject} from '@angular/core';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';
import {SettingsStore} from '../../../application/settings.store';

/** The risk threshold must be greater than the critical one. */
const riskAboveCritical = (group: AbstractControl): ValidationErrors | null => {
  const critical = Number(group.get('criticalDays')?.value);
  const risk = Number(group.get('riskDays')?.value);
  return risk <= critical ? {thresholds: true} : null;
};

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
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(SettingsStore);
  private readonly notifier = inject(Notifier);

  protected readonly form = this.fb.group(
    {
      criticalDays: [this.store.expirationPolicy().criticalDays, [Validators.required, Validators.min(0)]],
      riskDays: [this.store.expirationPolicy().riskDays, [Validators.required, Validators.min(1)]]
    },
    {validators: riskAboveCritical}
  );

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
