import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {AppFooter} from '../../../../shared/presentation/components/app-footer/app-footer';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';
import {AuthStore} from '../../../application/auth.store';
import {AuthenticationError, AuthenticationFailure} from '../../../domain/model/authentication-error';
import {EMAIL_FIELD_PATTERN} from '../../../../shared/presentation/forms/form-patterns';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatIconButton,
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
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
/**
 * Sign-in screen of the administrative frontend.
 */
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Page the user wanted to open before being sent to the login, read from the query string. */
  protected readonly returnUrl = signal<string | undefined>(undefined);

  /** Landing address; on a local network it follows the host the app was opened from. */
  protected readonly landingUrl = environment.landingUrl.replace('localhost', location.hostname);

  protected readonly form = this.fb.group({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(EMAIL_FIELD_PATTERN)]}),
    password: new FormControl('', {nonNullable: true, validators: Validators.required})
  });

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly failure = signal<AuthenticationFailure | null>(null);

  constructor() {
    this.route.queryParams.subscribe(params => this.returnUrl.set(params['returnUrl']));
  }

  protected togglePassword(): void {
    this.showPassword.update(visible => !visible);
  }

  /**
   * Signs the user in and opens the page they asked for.
   */
  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const {email, password} = this.form.getRawValue();
    this.failure.set(null);
    this.submitting.set(true);
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl(this.safeReturnUrl()).then(),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.failure.set(error instanceof AuthenticationError ? error.reason : 'invalid-credentials');
      }
    });
  }

  /** Only internal paths are accepted, so the login cannot be used to redirect elsewhere. */
  private safeReturnUrl(): string {
    const target = this.returnUrl();
    return target && target.startsWith('/') && !target.startsWith('//') ? target : '/dashboard';
  }
}
