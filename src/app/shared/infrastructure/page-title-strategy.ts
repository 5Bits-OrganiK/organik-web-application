import {inject, Injectable} from '@angular/core';
import {RouterStateSnapshot, TitleStrategy} from '@angular/router';
import {PageTitleStore} from '../application/page-title.store';

/**
 * Router title strategy that resolves route titles as translation keys.
 */
@Injectable({providedIn: 'root'})
export class PageTitleStrategy extends TitleStrategy {
  private readonly pageTitle = inject(PageTitleStore);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.pageTitle.set(this.buildTitle(snapshot) ?? null);
  }
}
