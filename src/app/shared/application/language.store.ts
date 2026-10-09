import {DOCUMENT, inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../environments/environment';

/** Languages the interface is translated to. */
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

const STORAGE_KEY = 'organik.language';

/**
 * Application service that keeps the interface language and remembers the user's choice.
 */
@Injectable({providedIn: 'root'})
export class LanguageStore {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  /** Language currently shown, as a signal. */
  readonly current = this.translate.currentLang;

  /**
   * Applies the language chosen in a previous visit, or the default one.
   */
  restore(): void {
    const saved = this.read();
    this.apply(saved ?? environment.defaultLanguage);
  }

  /**
   * Switches the interface language and remembers it.
   *
   * @param language - Language code to activate.
   */
  use(language: string): void {
    this.apply(language);
    this.write(language);
  }

  private apply(language: string): void {
    this.translate.use(language);
    this.document.documentElement.lang = language;
  }

  private read(): string | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGUAGES.find(language => language === saved) ?? null;
    } catch {
      return null;
    }
  }

  private write(language: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage can be unavailable (private mode); the choice then only lasts for this visit.
    }
  }
}
