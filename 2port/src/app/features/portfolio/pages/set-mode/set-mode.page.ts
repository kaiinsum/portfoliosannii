import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioModeService } from '../../../../core/services/portfolio-mode.service';
import type { PortfolioMode } from '../../../../core/models/portfolio.models';

@Component({
  selector: 'app-set-mode-page',
  template: ``,
})
export class SetModePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modeSvc = inject(PortfolioModeService);

  constructor() {
    const mode = this.route.snapshot.data['mode'] as PortfolioMode | undefined;
    if (mode === 'design' || mode === 'technical') this.modeSvc.setMode(mode);
    void this.router.navigateByUrl('/');
  }
}

