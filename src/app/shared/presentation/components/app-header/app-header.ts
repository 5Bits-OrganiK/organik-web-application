import {Component, computed, inject, input, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatBadge} from '@angular/material/badge';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Clock} from '../../../domain/services/clock';
import {GlobalSearch} from '../global-search/global-search';
import {LanguageSwitcher} from '../language-switcher/language-switcher';

@Component({
  imports: [
    RouterLink,
    MatIconButton,
    MatIcon,
    MatBadge,
    TranslatePipe,
    GlobalSearch,
    LanguageSwitcher
  ],
  selector: 'app-header',
  styleUrl: './app-header.css',
  templateUrl: './app-header.html',
})
/**
 * Top bar of the shell: page title, current date, global search, alerts shortcut and language.
 */
export class AppHeader {
  private readonly translate = inject(TranslateService);
  private readonly clock = inject(Clock);

  /** Translation key of the active page. */
  titleKey = input<string | null>(null);
  /** Whether the menu button that opens the navigation drawer is shown. */
  showMenuButton = input(false);
  /** Number of active alerts shown on the alerts shortcut. */
  alertCount = input(0);
  /** Emits when the user asks to open or close the navigation drawer. */
  menuToggle = output<void>();

  /** Long date in the active language, e.g. "2 de octubre de 2026". */
  protected readonly today = computed(() =>
    new Intl.DateTimeFormat(this.translate.currentLang() ?? 'es', {dateStyle: 'long'}).format(
      this.clock.now()
    )
  );
}
