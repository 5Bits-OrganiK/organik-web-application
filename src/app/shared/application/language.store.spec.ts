import {TestBed} from '@angular/core/testing';
import {provideTranslateService, TranslateService} from '@ngx-translate/core';
import {LanguageStore} from './language.store';

describe('LanguageStore', () => {
  let store: LanguageStore;
  let translate: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({providers: [provideTranslateService()]});
    store = TestBed.inject(LanguageStore);
    translate = TestBed.inject(TranslateService);
  });

  afterEach(() => localStorage.clear());

  it('should start in English when nothing was saved', () => {
    store.restore();

    expect(translate.currentLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('should remember the language the user picked', () => {
    store.use('es');
    expect(localStorage.getItem('organik.language')).toBe('es');

    store.restore();
    expect(translate.currentLang()).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('should ignore a saved language that is not supported', () => {
    localStorage.setItem('organik.language', 'fr');

    store.restore();

    expect(translate.currentLang()).toBe('en');
  });
});
