import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';

@Component({
  imports: [TranslatePipe],
  selector: 'app-footer',
  styleUrl: './app-footer.css',
  templateUrl: './app-footer.html',
})
/**
 * Footer with the copyright and the links to the terms and conditions and the privacy policy.
 *
 * @remarks
 * Both documents live on the landing page, so every screen of the application points to the same
 * published text. On a local network the landing address follows the host the app was opened from.
 */
export class AppFooter {
  private readonly landingUrl = environment.landingUrl.replace('localhost', location.hostname).replace(/\/$/, '');

  protected readonly termsUrl = `${this.landingUrl}/terminos.html`;
  protected readonly privacyUrl = `${this.landingUrl}/privacidad.html`;
  protected readonly year = new Date().getFullYear();
}
