import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./login.css']
})
export class Login {
  isLoginMode = true;

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  private mockUsers = [
    { email: 'user@test.com', password: 'test123' },
  ];

  constructor(private router: Router) { } // Injecter le service Router

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onLogin() {
    const userFound = this.mockUsers.find(
      u => u.email === this.loginForm.email && u.password === this.loginForm.password
    );

    if (userFound) {
      alert('Connexion réussie !');
      console.log('Utilisateur connecté :', userFound.email);
      // Rediriger vers la page de la sidebar
      this.router.navigate(['/sidebar']);
    } else {
      alert('Email ou mot de passe incorrect.');
    }
  }

  onRegister() {
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }

    const emailExists = this.mockUsers.some(u => u.email === this.registerForm.email);
    if (emailExists) {
      alert('Cet email est déjà utilisé.');
      return;
    }

    const newUser = {
      email: this.registerForm.email,
      password: this.registerForm.password
    };
    this.mockUsers.push(newUser);
    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    this.toggleMode();
  }

  onGoogleLogin() {
    console.log('Connexion via Google...');
  }

  onLinkedinLogin() {
    console.log('Connexion via LinkedIn...');
  }

  onGoogleRegister() {
    console.log('Inscription via Google...');
  }

  onLinkedinRegister() {
    console.log('Inscription via LinkedIn...');
  }
}
