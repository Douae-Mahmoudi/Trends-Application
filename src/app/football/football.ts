import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
import { HttpClientModule } from '@angular/common/http'; // Ajouté pour s'assurer que HttpClient est disponible

// Définition de la structure de base des données de match
interface FootballMatch {
  away_team: string;
  category: string;
  competition: string;
  date: string;
  home_team: string;
  score: string;
  status: string;
  // Ajout de l'ID BDD pour la suppression future
  favoriteId: number | null;
  isFavorite: boolean;
}

@Component({
  selector: 'app-football',
  standalone: true,
  // IMPORTANT : Ajoutez HttpClientModule pour les services utilisant HTTP
  imports: [CommonModule, FormsModule, Sidebar, HttpClientModule],
  templateUrl: './football.html',
  styleUrls: ['./football.css']
})
export class Football implements OnInit {
  allMatches: FootballMatch[] = [];
  filteredMatches: FootballMatch[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedMatch: FootballMatch | null = null;
  private currentFavorites: FavoriteItem[] = []; // Cache local des favoris du backend

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.loadCurrentFavorites().then(() => {
      this.fetchMatches();
    });
  }

  // 1. Chargement initial des favoris pour pouvoir marquer les matchs existants
  async loadCurrentFavorites(): Promise<void> {
    return new Promise((resolve) => {
      this.favoriteService.getFavorites().subscribe({
        next: (data) => {
          this.currentFavorites = data;
          console.log("Favoris chargés:", data.length);
          resolve();
        },
        error: (err) => {
          console.error("Erreur de chargement des favoris:", err);
          resolve(); // Continuer même en cas d'erreur
        }
      });
    });
  }

  // 🔥 Récupération des matchs et vérification de l'état "Favori"
  fetchMatches(): void {
    fetch('http://127.0.0.1:5000/api/sports')
      .then(res => res.json())
      .then((data: any) => {
        const matches = Array.isArray(data) ? data : data.all_matches;

        this.allMatches = matches.map((match: any) => {
          const formatted: FootballMatch = {
            away_team: match.away_team,
            category: match.category ?? "sports",
            competition: match.competition,
            date: match.date,
            home_team: match.home_team,
            score: match.score,
            status: match.status,
            // Vérifie si le match est dans la liste des favoris chargés
            ...this.checkIfFavorite(match)
          };
          return formatted;
        });

        this.filteredMatches = this.allMatches;
      })
      .catch(err => console.error("Erreur chargement des matchs:", err));
  }

  // 🔍 Fonction utilitaire pour la vérification
  private checkIfFavorite(match: any): { isFavorite: boolean, favoriteId: number | null } {
    const matchTitle = this.generateMatchTitle(match);
    const favorite = this.currentFavorites.find(fav => fav.title === matchTitle);

    return {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null
    };
  }

  // 🔍 Recherche (Logique inchangée)
  filterMatches(): void {
    // ... code inchangé ...
    if (this.searchTerm.trim() === '') {
      this.filteredMatches = this.allMatches;
    } else {
      this.filteredMatches = this.allMatches.filter(match =>
        match.home_team.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        match.away_team.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        match.competition.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // 📌 Modal (Logique inchangée)
  openModal(match: FootballMatch): void {
    this.selectedMatch = match;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMatch = null;
  }

  // ⭐ Favoris - Logique Asynchrone
  toggleFavorite(match: FootballMatch): void {
    match.isFavorite = !match.isFavorite; // Optimistic UI update

    if (!match.isFavorite) {
      // Suppression du favori (si un ID est disponible)
      if (match.favoriteId !== null) {
        this.favoriteService.removeFavorite(match.favoriteId).subscribe({
          next: () => {
            match.favoriteId = null; // Supprime l'ID local
            // Optionnel: Mettre à jour currentFavorites
          },
          error: (err) => {
            console.error('Erreur de suppression:', err);
            match.isFavorite = true; // Rollback
            alert(`Erreur de suppression: ${err.message}`);
          }
        });
      } else {
        // Cas où l'ID n'était pas chargé, mais le match était marqué comme favori
        console.warn("Impossible de supprimer le favori car l'ID est manquant.");
      }

    } else {
      // Ajout du favori
      const title = this.generateMatchTitle(match);
      const category = match.competition;
      const source = match.category;
      const url = `https://sport-match-link-fictif/${title.replace(/\s/g, '-')}`; // Utilise une URL fictive

      this.favoriteService.addFavorite(title, url, category, source).subscribe({
        next: (response) => {
          // L'API POST ne retourne pas l'ID, donc il faut recharger les favoris pour avoir l'ID
          // Simplification: On recharge les favoris après un ajout réussi.
          this.loadCurrentFavorites().then(() => {
            // Une fois les favoris rechargés, mettez à jour l'état du match pour obtenir le nouvel ID
            const updatedState = this.checkIfFavorite(match);
            match.favoriteId = updatedState.favoriteId;
          });
        },
        error: (err) => {
          console.error('Erreur d\'ajout:', err);
          match.isFavorite = false; // Rollback
          alert(`Erreur d'ajout aux favoris: ${err.message}`);
        }
      });
    }
  }

  private generateMatchTitle(match: FootballMatch): string {
    return `${match.home_team} vs ${match.away_team} - ${match.date}`;
  }
}
