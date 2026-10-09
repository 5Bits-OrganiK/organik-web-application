import {Component, inject, OnInit} from '@angular/core';
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
import {Notifier} from '../../../../communication/application/notifier';
import {ModuleBanner} from '../../../../shared/presentation/components/module-banner/module-banner';
import {UsersStore} from '../../../application/users.store';

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
    ModuleBanner
  ],
  selector: 'app-user-list',
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
/**
 * View with the users of the minimarket and their roles.
 */
export class UserList implements OnInit {
  private readonly store = inject(UsersStore);
  private readonly notifier = inject(Notifier);

  protected readonly columns = ['user', 'email', 'role', 'status', 'actions'];
  protected readonly users = this.store.users;

  ngOnInit(): void {
    this.store.loadUsers();
  }

  /**
   * Sends the invitation again to a user who has not accepted it.
   *
   * @param id - Identifier of the user.
   */
  protected resend(id: string): void {
    this.store.resendInvitation(id).subscribe(user => {
      this.notifier.success('iam.users.invitation-resent', {email: user.email.toString()});
    });
  }
}
