import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatError, MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {emailValidator} from '../../../../shared/presentation/forms/validators';
import {AppFooter} from '../../../../shared/presentation/components/app-footer/app-footer';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {AuthStore} from '../../../application/auth.store';
import {SignUpRole} from '../../../domain/model/registration';
import {RegistrationError, RegistrationFailure} from '../../../domain/model/registration-error';

/** Plans offered on the landing, by segment. */
export const PLANS: Readonly<Record<SignUpRole, readonly string[]>> = {
  administrator: ['basic', 'professional', 'enterprise'],
  supplier: ['listing', 'partner']
};

/** Shortest password the registration accepts. */
export const MIN_PASSWORD_LENGTH = 8;

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatIconButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCheckbox,
    MatFormField,
    MatError,
    MatPrefix,
    MatSuffix,
    MatIcon,
    MatInput,
    MatProgressSpinner,
    TranslatePipe,
    LanguageSwitcher,
    AppFooter
  ],
  selector: 'app-register',
  styleUrls: ['../login/login.css', './register.css'],
  templateUrl: './register.html',
})
/**
 * Sign-up screen: creates the account of a minimarket administrator.
 */
export class Register {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly suppliers = inject(SuppliersStore);

  /** Role chosen on the landing (`?role=supplier` or `?role=administrator`), bound from the query string. */
  role = input<string>();

  /** Plan chosen on the landing (`?plan=growth`), bound from the query string. */
  plan = input<string>();

  /** Landing address; on a local network it follows the host the app was opened from. */
  protected readonly landingUrl = environment.landingUrl.replace('localhost', location.hostname);
  protected readonly termsUrl = `${this.landingUrl.replace(/\/$/, '')}/terminos.html`;
  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  protected readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, emailValidator]],
    role: ['administrator' as SignUpRole],
    company: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    terms: [false, Validators.requiredTrue]
  });

  protected readonly isSupplier = computed(() => this.chosenRole() === 'supplier');
  private readonly chosenRole = signal<SignUpRole>('administrator');

  /** Plan to register with: the one chosen on the landing when it belongs to the chosen segment. */
  protected readonly chosenPlan = computed(() => {
    const plan = this.plan();
    return plan && PLANS[this.chosenRole()].includes(plan) ? plan : null;
  });

  constructor() {
    effect(() => {
      const requested = this.role() === 'supplier' ? 'supplier' : 'administrator';
      this.form.controls.role.setValue(requested);
    });
    this.form.controls.role.valueChanges.subscribe(role => this.chosenRole.set(role));
  }

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly failure = signal<RegistrationFailure | null>(null);

  protected togglePassword(): void {
    this.showPassword.update(visible => !visible);
  }

  /**
   * Creates the account, signs the new user in and opens the dashboard.
   */
  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const {fullName, email, role, company, password} = this.form.getRawValue();
    this.failure.set(null);
    this.submitting.set(true);
    this.auth.register({fullName, email, role, company, password, plan: this.chosenPlan() ?? undefined}).subscribe({
      next: user => {
        if (user.supplierId) {
          // A new supplier company enters the directory so the minimarkets can see it.
          this.suppliers
            .registerSupplier(
              {businessName: company, contactName: fullName, phone: '', email, categories: '', organicCertification: 'Pending verification'},
              user.supplierId
            )
            .subscribe();
        }
        this.router.navigateByUrl('/dashboard').then();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.failure.set(error instanceof RegistrationError ? error.reason : 'email-taken');
      }
    });
  }
}
