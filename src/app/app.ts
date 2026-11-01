import {Component, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {SettingsStore} from './profiles/application/settings.store';
import {LanguageStore} from './shared/application/language.store';
import {PageTitleStore} from './shared/application/page-title.store';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
/**
 * Root component. It keeps the title of the active page, shown in the header and in the browser tab.
 *
 * @remarks
 * Route titles are translation keys, so the tab title is rewritten after each navigation and
 * whenever the language or the loaded translations change.
 */
export class App {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly pageTitle = inject(PageTitleStore);

  constructor() {
    // Apply the language and the expiration thresholds saved in a previous visit.
    inject(LanguageStore).restore();
    inject(SettingsStore).restore();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.pageTitle.set(this.activeTitleKey());
        // The router writes the raw route title right after this event, so ours goes after it.
        queueMicrotask(() => this.updateTabTitle());
      }
    });
    this.translate.onLangChange.subscribe(() => this.updateTabTitle());
    this.translate.onTranslationChange.subscribe(() => this.updateTabTitle());
  }

  /** Title key of the deepest active route, or `null` when it has none. */
  private activeTitleKey(): string | null {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.title ?? null;
  }

  private updateTabTitle(): void {
    const appName = this.translate.instant('app.title');
    const key = this.pageTitle.key();
    document.title = key ? `${this.translate.instant(key)} · ${appName}` : appName;
  }
}
