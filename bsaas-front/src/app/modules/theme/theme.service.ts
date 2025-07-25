import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateThemeParams } from '../../models/theme-params.model';
import { map } from 'rxjs/operators';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private apiUrl = '/api/theme';

  constructor(private http: HttpClient) {}

  getTheme(token: string, tenantId: string): Observable<Theme> {
    return this.http
      .get<{ primary_color: string; secondary_color: string; accent_color: string }>(`${this.apiUrl}/${tenantId}`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(
        map((theme) => ({
          primaryColor: theme.primary_color,
          secondaryColor: theme.secondary_color,
          accentColor: theme.accent_color,
        })),
      );
  }

  updateTheme(token: string, tenantId: string, params: UpdateThemeParams): Observable<Theme> {
    // Map camelCase params to snake_case for backend
    const body = {
      primary_color: params.primaryColor,
      secondary_color: params.secondaryColor,
      accent_color: params.accentColor,
    } as { primary_color: string; secondary_color: string; accent_color: string };
    return this.http
      .put<{ primary_color: string; secondary_color: string; accent_color: string }>(`${this.apiUrl}/${tenantId}`, body, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(
        map((theme) => ({
          primaryColor: theme.primary_color,
          secondaryColor: theme.secondary_color,
          accentColor: theme.accent_color,
        })),
      );
  }
}
