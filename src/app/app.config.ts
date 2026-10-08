import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {SettingsStore} from './profiles/application/settings.store';
import {LanguageStore} from './shared/application/language.store';
import {PageTitleStrategy} from './shared/infrastructure/page-title-strategy';
import { FAKE_API_ENABLED } from './shared/infrastructure/fake-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({anchorScrolling: 'enabled'})
    ),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    provideHttpClient(),
    { provide: FAKE_API_ENABLED, useValue: true },
    provideTranslateService({
      loader: provideTranslateHttpLoader({prefix: './i18n/', suffix: '.json'}),
      lang: environment.defaultLanguage,
      fallbackLang: 'en'
    }),
    provideAppInitializer(() => {
      inject(LanguageStore).restore();
      inject(SettingsStore).restore();
    })
  ]
};
