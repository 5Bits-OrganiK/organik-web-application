import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  imports: [
    TranslatePipe,
    MatButton
  ],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.css',
  templateUrl: './page-not-found.html',
})
export class PageNotFound implements OnInit {
  protected invalidPath = '';
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  ngOnInit(): void {
    this.invalidPath = this.route.snapshot.url.map(url => url.path).join('/');
  }

  protected navigateToHome(): void {
    this.router.navigate(['dashboard']).then();
  }
}
