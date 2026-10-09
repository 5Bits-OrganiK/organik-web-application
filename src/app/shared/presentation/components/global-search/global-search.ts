import {Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NAVIGATION_ITEMS} from '../../navigation/navigation-items';
import {PROTOTYPE_INTERACTIONS} from '../../navigation/interactions';

/** A module or action that can be opened from the search box. */
interface SearchEntry {
  label: string;
  link: string;
  icon: string;
}

/** Lowercases and strips diacritics so "analitica" matches "Analítica". */
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  imports: [
    ReactiveFormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatIcon,
    TranslatePipe
  ],
  selector: 'app-global-search',
  styleUrl: './global-search.css',
  templateUrl: './global-search.html',
})
/**
 * Search box that jumps to any module or key action of the application.
 */
export class GlobalSearch {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly query = new FormControl('', {nonNullable: true});
  private readonly queryValue = toSignal(this.query.valueChanges, {initialValue: ''});

  private readonly entries = computed<SearchEntry[]>(() => {
    this.translate.currentLang();
    return [
      ...NAVIGATION_ITEMS.map(item => ({
        label: this.translate.instant(item.label),
        link: item.link,
        icon: item.icon
      })),
      ...PROTOTYPE_INTERACTIONS.map(interaction => ({
        label: this.translate.instant(interaction.action),
        link: interaction.link,
        icon: 'bolt'
      }))
    ];
  });

  /** Entries matching the text typed by the user. */
  protected readonly results = computed<SearchEntry[]>(() => {
    const text = normalize(this.queryValue());
    return text
      ? this.entries().filter(entry => normalize(entry.label).includes(text)).slice(0, 8)
      : [];
  });

  /** Keeps the input empty after an option is picked. */
  protected readonly displayNothing = (): string => '';

  /**
   * Opens the selected entry and clears the search box.
   *
   * @param link - Router path of the selected entry.
   */
  protected open(link: string): void {
    this.router.navigateByUrl(link).then();
    this.query.setValue('');
  }
}
