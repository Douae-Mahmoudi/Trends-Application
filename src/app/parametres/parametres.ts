import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css']
})
export class Parametres implements OnInit {
  isDarkMode: boolean = false;
  oldPassword!: string;
  newPassword!: string;
  passwordChangeMessage: string = '';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDarkMode();
  }

  onChangePassword(): void {
    const success = this.authService.changePassword(this.oldPassword, this.newPassword);
    if (success) {
      this.passwordChangeMessage = 'Mot de passe changé avec succès.';
      this.oldPassword = '';
      this.newPassword = '';
    } else {
      this.passwordChangeMessage = 'Erreur: Ancien mot de passe incorrect.';
    }
  }

  // Bascule le thème en utilisant le service dédié
  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  // Gère la déconnexion de l'utilisateur
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
