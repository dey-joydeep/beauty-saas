import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type {
    ApiResponse,
    AuthResponse,
    InitLoginResponse,
    LoginCredentials,
    VerifyOtpParams,
} from '@cthub-bsaas/web-admin/auth';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    private readonly apiUrl = '/api/auth';

    constructor(private readonly http: HttpClient) { }

    login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials);
    }

    initLogin(credentials: LoginCredentials): Observable<ApiResponse<InitLoginResponse>> {
        return this.http.post<ApiResponse<InitLoginResponse>>(`${this.apiUrl}/login/init`, credentials);
    }

    verifyOtp(params: VerifyOtpParams): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-otp`, params);
    }

    socialLogin(provider: 'google' | 'facebook', token: string): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/social/${provider}`, { token });
    }

    requestPasswordReset(email: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, { token, newPassword });
    }

    resendOtp(email: string): Observable<ApiResponse<{ success: boolean; message?: string }>> {
        return this.http.post<ApiResponse<{ success: boolean; message?: string }>>(`${this.apiUrl}/login/resend-otp`, { email });
    }

    refreshToken(refreshToken: string): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh-token`, { refreshToken });
    }

    logout(): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {});
    }
}
