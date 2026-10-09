import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {InterpolationParameters, TranslateService} from '@ngx-translate/core';

/**
 * Application service that shows translated, non-blocking feedback to the user.
 */
@Injectable({providedIn: 'root'})
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  /**
   * Shows a confirmation message for a completed action.
   *
   * @param key - Translation key of the message.
   * @param params - Interpolation parameters of the message.
   */
  success(key: string, params?: InterpolationParameters): void {
    this.snackBar.open(
      this.translate.instant(key, params),
      this.translate.instant('common.close'),
      {duration: 4000, politeness: 'polite'}
    );
  }
}
