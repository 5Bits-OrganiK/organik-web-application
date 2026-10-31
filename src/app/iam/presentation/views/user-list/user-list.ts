import {Component, computed, inject, OnInit, viewChild} from '@angular/core';
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
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
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
    MatSort,
    MatSortHeader,
    MatPaginator,
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

  protected readonly columns = ['fullName', 'email', 'role', 'status', 'actions'];

  protected readonly sort = viewChild(MatSort);
  protected readonly paginator = viewChild(MatPaginator);

  /** Data source of the table, sorted and paged by the table controls. */
  protected readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.users());
    const sort = this.sort();
    if (sort) {
      source.sort = sort;
    }
    const paginator = this.paginator();
    if (paginator) {
      source.paginator = paginator;
    }
    return source;
  });
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
