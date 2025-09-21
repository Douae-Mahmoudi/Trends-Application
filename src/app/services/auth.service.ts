

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private mockUsers = [
    { email: 'user@test.com', password: 'test123' },
  ];

  constructor() {}

  login(email: string, password: string): boolean {
    const user = this.mockUsers.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    } else {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('isLoggedIn');
  }

  changePassword(oldPass: string, newPass: string): boolean {

    const user = this.mockUsers.find(u => u.password === oldPass);
    if (user) {
      console.log(`Mot de passe de l'utilisateur ${user.email} changé.`);
      return true;
    }
    return false;
  }
}
