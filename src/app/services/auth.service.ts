import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5001/api';

  // Utilise un BehaviorSubject pour suivre l'état d'authentification
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  // Observable public pour que les composants puissent s'abonner
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Sujet pour stocker et diffuser l'email de l'utilisateur
  private userEmailSubject = new BehaviorSubject<string | null>(null);
  userEmail$ = this.userEmailSubject.asObservable();

  constructor(private http: HttpClient) {
    // Tentative de vérifier l'état au démarrage (peut être basé sur un cookie ou localStorage, si utilisé)
    // Pour l'instant, on laisse l'état à false et on s'appuie sur le login pour le mettre à jour.
  }

  // Méthode pour mettre à jour l'état et l'email après un succès de connexion
  private setAuthenticatedState(isAuthenticated: boolean, email: string | null = null): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.userEmailSubject.next(email);
  }

  // NOUVELLE MÉTHODE POUR L'AUTH GUARD (permet de vérifier l'état actuel)
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Fonction de connexion
  login(email: string, password: string): Observable<any> {
    const payload = { username: email, password: password };
    return this.http.post<any>(`${this.apiUrl}/login`, payload, { withCredentials: true }).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthenticatedState(true, email); // Met à jour l'état après un succès
        }
      }),
      catchError(error => {
        this.setAuthenticatedState(false, null);
        return of(error);
      })
    );
  }

  // Fonction de déconnexion
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.setAuthenticatedState(false, null); // Réinitialise l'état après déconnexion
      }),
      catchError(error => {
        console.error("Erreur lors de la déconnexion", error);
        // Même en cas d'erreur côté serveur, nous déconnectons côté client
        this.setAuthenticatedState(false, null);
        return of(error);
      })
    );
  }

  // NOUVELLE MÉTHODE POUR CHANGER LE MOT DE PASSE
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const payload = {
      old_password: oldPassword,
      new_password: newPassword
    };

    // Nous allons créer cet endpoint dans le backend Flask juste après
    return this.http.post<any>(`${this.apiUrl}/change_password`, payload, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur de changement de mot de passe', error);
        return of(error);
      })
    );
  }

  // Fonction d'enregistrement
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
