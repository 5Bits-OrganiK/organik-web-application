import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {SessionStore} from '../../../../iam/application/session.store';
import {ConservationStore} from '../../../../conservation/application/conservation.store';
import {PageTitleStore} from '../../../application/page-title.store';
import {AppFooter} from '../app-footer/app-footer';
import {AppHeader} from '../app-header/app-header';
import {Sidebar} from '../sidebar/sidebar';

@Component({
  imports: [
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    AppHeader,
    AppFooter,
    Sidebar
  ],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
/**
 * Application shell: navigation sidebar, top bar and the routed module content.
 */
export class Layout implements OnInit {
  private readonly conservation = inject(ConservationStore);
  private readonly session = inject(SessionStore);

  /** Number of active alerts shown on the header shortcut. */
  protected readonly alertCount = this.conservation.alertCount;

  /** Translation key of the page currently shown in the content area. */
  protected readonly pageTitleKey = inject(PageTitleStore).key;

  /** Whether the viewport is too narrow for a permanent sidebar. */
  protected readonly isCompact = signal(false);

  constructor() {
    if (typeof matchMedia === 'function') {
      const narrow = matchMedia('(max-width: 959.98px)');
      this.isCompact.set(narrow.matches);
      narrow.addEventListener('change', event => this.isCompact.set(event.matches));
    }
  }

  ngOnInit(): void {
    this.session.loadSession();
    this.conservation.loadConservation();
  }

  /**
   * Closes the navigation drawer after navigating on compact screens.
   *
   * @param drawer - The navigation drawer to close.
   */
  protected closeOnCompact(drawer: MatSidenav): void {
    if (this.isCompact()) {
      drawer.close().then();
    }
  }
}
