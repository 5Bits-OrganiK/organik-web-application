import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {DomainError} from '../../../../shared/domain/model/domain-error';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {EMAIL_FIELD_PATTERN} from '../../../../shared/presentation/forms/form-patterns';
import {UsersStore} from '../../../application/users.store';
import {MODULE_KEYS, ModuleKey, ROLES, RoleId} from '../../../domain/model/role';
import {UserStatus} from '../../../domain/model/user.entity';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatFormField,
    MatError,
    MatInput, MatSelectModule,
    TranslatePipe,
    FormCard
  ],
  selector: 'app-user-form',
  styleUrl: './user-form.css',
  templateUrl: './user-form.html',
})
/**
 * View to create a user, or to edit one when an `id` comes in the route.
 */
export class UserForm {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(UsersStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(Notifier);

  /** Identifier of the user being edited; absent when creating one. */
  protected readonly id = signal<string | undefined>(undefined);

  protected readonly roles = ROLES.map(role => role.id);
  protected readonly statuses: readonly UserStatus[] = ['pending', 'accepted'];

  private readonly selectedRole = signal<RoleId | ''>('');

  /** Modules the chosen role can use, so a role is never paired with a module it cannot access. */
  protected readonly availableModules = computed(() => {
    const role = ROLES.find(candidate => candidate.id === this.selectedRole());
    return role ? MODULE_KEYS.filter(module => role.accessTo(module) !== 'none') : MODULE_KEYS;
  });

  protected readonly form = this.fb.group({
    fullName: new FormControl('', {nonNullable: true, validators: Validators.required}),
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(EMAIL_FIELD_PATTERN)]}),
    role: new FormControl<RoleId | ''>('', {nonNullable: true, validators: Validators.required}),
    assignedModule: new FormControl<ModuleKey | ''>('', {nonNullable: true, validators: Validators.required}),
    status: new FormControl<UserStatus>('pending', {nonNullable: true, validators: Validators.required}),
    notes: new FormControl('', {nonNullable: true})
  });

  constructor() {
    this.form.controls.role.valueChanges.subscribe(role => {
      this.selectedRole.set(role);
      const module = this.form.controls.assignedModule.value;
      if (module && !this.availableModules().includes(module)) {
        this.form.controls.assignedModule.setValue('');
      }
    });
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      // Fill the form once the user to edit is available.
      this.store.loadUsers().subscribe(() => this.fill());
    });
  }

  private fill(): void {
    const id = this.id();
    const user = id ? this.store.findById(id) : undefined;
    if (user) {
      this.form.patchValue({
        fullName: user.fullName,
        email: user.email.toString(),
        role: user.role.id,
        assignedModule: user.assignedModule,
        status: user.status,
        notes: user.notes
      });
    }
  }

  /**
   * Creates or updates the user and returns to the users list.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const command = {...value, role: value.role as RoleId, assignedModule: value.assignedModule as ModuleKey};
    const id = this.id();
    try {
      const saved$ = id ? this.store.updateUser(id, command) : this.store.createUser(command);
      saved$.subscribe(user => {
        this.notifier.success(id ? 'iam.users.form.updated' : 'iam.users.form.created', {name: user.fullName});
        this.router.navigate(['/users']).then();
      });
    } catch (error) {
      if (!(error instanceof DomainError)) {
        throw error;
      }
      this.form.controls.email.setErrors({inUse: true});
      this.form.controls.email.markAsTouched();
    }
  }
}
