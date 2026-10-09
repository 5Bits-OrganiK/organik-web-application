import {Component, inject} from '@angular/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {LanguageStore, SUPPORTED_LANGUAGES} from '../../../application/language.store';

@Component({
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  selector: 'app-language-switcher',
  styleUrl: './language-switcher.css',
  templateUrl: './language-switcher.html',
})
/**
 * Presentation component that switches the active UI language.
 */
export class LanguageSwitcher {
  private readonly languageStore = inject(LanguageStore);

  /** Currently selected language code in the toggle group. */
  protected readonly currentLang = this.languageStore.current;
  /** Supported language codes available to users. */
  protected readonly languages = SUPPORTED_LANGUAGES;

  /**
   * Changes the active application language.
   *
   * @param language - Locale code to activate.
   */
  protected useLanguage(language: string): void {
    this.languageStore.use(language);
  }
}
