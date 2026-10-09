import {Component, computed, inject, output} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthStore} from '../../../../iam/application/auth.store';
import {SessionStore} from '../../../../iam/application/session.store';
import {NAVIGATION_ITEMS} from '../../navigation/navigation-items';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
    MatIconButton,
    TranslatePipe
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
/**
 * Main navigation of the administrative frontend.
 */
export class Sidebar {
  /** Translation key that describes the role of the signed-in user. */
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  /** Modules the signed-in user can open, in display order. */
  protected readonly items = computed(() => NAVIGATION_ITEMS.filter(item => this.session.canOpen(item.link)));

  protected readonly roleKey = this.session.roleKey;
  /** The signed-in user. */
  protected readonly user = this.session.currentUser;

  /**
   * Ends the session and goes back to the login.
   */
  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']).then();
  }
  /** Emits when the user follows a navigation link. */
  navigated = output<void>();
}
