import {effect, inject, Injectable, signal} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {translate} from '@ngx-translate/core';

/**
 * Application service that tracks the translation key of the active page.
 *
 * @remarks
 * The shell header reads {@link PageTitleStore.key} and the browser tab title is
 * kept in sync whenever the page, the language or the loaded translations change.
 */
@Injectable({providedIn: 'root'})
export class PageTitleStore {
  private readonly browserTitle = inject(Title);
  private readonly keySignal = signal<string | null>(null);
  private readonly appName = translate('app.title');
  private readonly pageName = translate(() => this.keySignal() ?? 'app.title');

  /** Translation key of the active page, or `null` before the first navigation. */
  readonly key = this.keySignal.asReadonly();

  constructor() {
    effect(() => {
      const appName = String(this.appName());
      this.browserTitle.setTitle(this.keySignal() ? `${this.pageName()} · ${appName}` : appName);
    });
  }

  /** Marks the page identified by the translation key as the active one. */
  set(key: string | null): void {
    this.keySignal.set(key);
  }
}
