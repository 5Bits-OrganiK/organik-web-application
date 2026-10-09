import {Component, computed, effect, inject, input, OnInit} from '@angular/core';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {DomainError} from '../../../../shared/domain/model/domain-error';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {emailValidator} from '../../../../shared/presentation/forms/validators';
import {UsersStore} from '../../../application/users.store';
import {MODULE_KEYS, ModuleKey, ROLES, RoleId} from '../../../domain/model/role';
import {UserStatus} from '../../../domain/model/user.entity';

/** The role must be allowed to use the module assigned to the user. */
const roleCanAccessModule = (group: AbstractControl): ValidationErrors | null => {
  const role = ROLES.find(candidate => candidate.id === group.get('role')?.value);
  const module = group.get('assignedModule')?.value as ModuleKey | '';
  return role && module && role.accessTo(module) === 'none' ? {moduleNotAllowed: true} : null;
};

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatFormField,
    MatError,
    MatInput,
    TranslatePipe,
    FormCard
  ],
  selector: 'app-user-form',
  styleUrl: './user-form.css',
  templateUrl: './user-form.html',
})
/**
 * View to create a user, or to edit one when an `id` is bound from the route.
 */
export class UserForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(UsersStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  /** Identifier of the user being edited; absent when creating one. */
  id = input<string>();

  protected readonly roles = ROLES.map(role => role.id);
  protected readonly modules = MODULE_KEYS;
  protected readonly statuses: readonly UserStatus[] = ['pending', 'accepted'];

  /** The user being edited, once loaded. */
  protected readonly editing = computed(() => {
    const id = this.id();
    return id ? this.store.findById(id) : undefined;
  });

  protected readonly form = this.fb.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, emailValidator]],
      role: this.fb.control<RoleId | ''>('', Validators.required),
      assignedModule: this.fb.control<ModuleKey | ''>('', Validators.required),
      status: this.fb.control<UserStatus>('pending', Validators.required),
      notes: ['']
    },
    {validators: roleCanAccessModule}
  );

  private patched = false;

  constructor() {
    // Fill the form once, as soon as the user to edit is available.
    effect(() => {
      const user = this.editing();
      if (user && !this.patched) {
        this.patched = true;
        this.form.patchValue({
          fullName: user.fullName,
          email: user.email.toString(),
          role: user.role.id,
          assignedModule: user.assignedModule,
          status: user.status,
          notes: user.notes
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadUsers();
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
