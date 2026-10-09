import {Component, inject, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {SessionStore} from '../../../../iam/application/session.store';
import {ROLES} from '../../../../iam/domain/model/role';

@Component({
  imports: [TranslatePipe],
  selector: 'app-profile-list',
  styleUrl: './profile-list.css',
  templateUrl: './profile-list.html',
})
/**
 * View with the profile of the signed-in user and the access each role grants.
 */
export class ProfileList implements OnInit {
  private readonly session = inject(SessionStore);

  protected readonly user = this.session.currentUser;
  protected readonly roles = ROLES;

  ngOnInit(): void {
    this.session.loadSession();
  }
}
