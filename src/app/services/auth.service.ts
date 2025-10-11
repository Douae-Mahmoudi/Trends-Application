import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  // Suivi de l'état d'authentification
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Suivi de l'email utilisateur
  private userEmailSubject = new BehaviorSubject<string | null>(null);
  userEmail$ = this.userEmailSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkSession(); // Vérifie la session dès le démarrage
  }

  private setAuthenticatedState(isAuthenticated: boolean, email: string | null = null): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.userEmailSubject.next(email);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // 🔐 Vérifie si une session est active côté backend
  checkSession(): void {
    this.http.get<any>(`${this.apiUrl}/session_test`, { withCredentials: true }).pipe(
      tap(response => {
        if (response.username) {
          this.setAuthenticatedState(true, response.username);
        } else {
          this.setAuthenticatedState(false, null);
        }
      }),
      catchError(() => {
        this.setAuthenticatedState(false, null);
        return of(null);
      })
    ).subscribe();
  }

  login(email: string, password: string): Observable<any> {
    const payload = { username: email, password: password };
    return this.http.post<any>(`${this.apiUrl}/login`, payload, { withCredentials: true }).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthenticatedState(true, email);
        }
      }),
      catchError(error => {
        this.setAuthenticatedState(false, null);
        return of(error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.setAuthenticatedState(false, null);
      }),
      catchError(error => {
        console.error("Erreur lors de la déconnexion", error);
        this.setAuthenticatedState(false, null);
        return of(error);
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const payload = {
      old_password: oldPassword,
      new_password: newPassword
    };
    return this.http.post<any>(`${this.apiUrl}/change_password`, payload, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur de changement de mot de passe', error);
        return of(error);
      })
    );
  }

  register(email: string, password: string): Observable<any> {
    const payload = { username: email, password: password };
    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      catchError(error => {
        console.error("Erreur lors de l'enregistrement", error);
        return of(error);
      })
    );
  }
}
