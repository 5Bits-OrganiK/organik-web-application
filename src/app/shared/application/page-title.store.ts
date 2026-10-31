import {Injectable, signal} from '@angular/core';

/**
 * Application service that tracks the translation key of the active page.
 *
 * @remarks
 * The root component sets the key after every navigation and the shell header reads
 * {@link PageTitleStore.key} to show the page title.
 */
@Injectable({providedIn: 'root'})
export class PageTitleStore {
  private readonly keySignal = signal<string | null>(null);

  /** Translation key of the active page, or `null` before the first navigation. */
  readonly key = this.keySignal.asReadonly();

  /** Marks the page identified by the translation key as the active one. */
  set(key: string | null): void {
    this.keySignal.set(key);
  }
}
