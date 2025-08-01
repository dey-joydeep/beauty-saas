import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserStats } from './user.service';
import { TranslateModule } from '@ngx-translate/core';
import { CurrentUserService } from '../../core/auth/services/current-user.service';
import { ErrorService } from '../../core/error.service';
import { BaseComponent } from '../../core/base.component'; // Assuming BaseComponent is located here

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent extends BaseComponent implements OnInit {
  stats: UserStats | null = null;
  isAdmin = false;

  constructor(
    private userService: UserService,
    public currentUserService: CurrentUserService,
    protected override errorService: ErrorService,
  ) {
    super(errorService);
  }

  public override ngOnInit(): void {
    this.checkRoleAndFetch();
  }

  checkRoleAndFetch(): void {
    const user = this.currentUserService.currentUser;
    // Use the role property instead of roles
    this.isAdmin = !!user && user.role === 'admin';

    if (!this.isAdmin) {
      // Set the error message directly since BaseComponent has a setter for the error property
      this.error = 'You do not have permission to view this data.';
      this.loading = false;
      return;
    }

    // Use a default tenant ID since tenantId doesn't exist on User
    const tenant_id = 'default-tenant';
    this.loading = true;
    this.userService.getUserStats(tenant_id).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.errorService.getErrorMessage(err);
        this.loading = false;
      },
    });
  }
}
