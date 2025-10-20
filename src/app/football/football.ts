import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Assurez-vous que ces chemins d'importation sont corrects pour votre projet
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
import { HttpClientModule } from '@angular/common/http';
import HistoriqueService from '../services/historique.service';
import { AuthService } from '../services/auth.service';

// --- Données Mock Simulant la Réponse de l'API ---
const MOCK_FOOTBALL_MATCHES = [
  {
    away_team: "RC LENS",
    category: "football",
    competition: "Ligue des Champions",
    date: "2025-10-25T19:00:00Z",
    home_team: "Paris FC",
    score: "2- 1",
    status: "Scheduled",
  },
  {
    away_team: "FC Bayern",
    category: "football",
    competition: "Bundesliga",
    date: "2025-10-18T14:30:00Z",
    home_team: "Borussia Dortmund",
    score: "1 - 3",
    status: "Finished",
  },
  {
    away_team: "Real Madrid",
    category: "football",
    competition: "La Liga",
    date: "2025-10-19T17:00:00Z",
    home_team: "FC Barcelone",
    score: "2 - 2",
    status: "In_Play",
  },
  // Le match personnalisé que vous avez demandé
  {
    away_team: "Maroc",
    category: "football",
    competition: "Demi-finale de la Coupe du monde U20 2025 ",
    date: "2025-10-15T21:00:00Z",
    home_team: "France",
    score: "1 - 1 (4 - 5Pén.)", // Score spécifique pour les tirs au but
    status: "Finished",
  },
  {
    away_team: "Maroc",
    category: "football",
    competition: "Finale",
    date: "2025-10-20T00:00:00Z",
    home_team: "Argentine ",
    score: "En attente",
    status: "Scheduled",
  }
];
// -----------------------------------------------------

interface FootballMatch {
  away_team: string; // Team 2 (pour affichage utilisateur)
  category: string;
  competition: string;
  date: string;
  home_team: string; // Team 1 (pour affichage utilisateur)
  score: string;
  status: string;
  favoriteId: number | null;
  isFavorite: boolean;
  url: string;
}

@Component({
  selector: 'app-football',
  standalone: true,
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
  private currentFavorites: FavoriteItem[] = [];

  isLoading: boolean = true;

  constructor(
    private favoriteService: FavoriteService,
    private historiqueService: HistoriqueService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentFavorites().then(() => {
      this.fetchMatches();
    });
  }

  async loadCurrentFavorites(): Promise<void> {
    // Simulation: les favoris seraient normalement chargés ici.
    return new Promise((resolve) => {
      console.log("Chargement des favoris simulé.");
      this.currentFavorites = [];
      resolve();
    });
  }

  // Utilise les données mock au lieu de l'appel HTTP
  fetchMatches(): void {
    this.isLoading = true;

    // Simulation d'un délai réseau de 500ms
    setTimeout(() => {
      try {
        const matches = MOCK_FOOTBALL_MATCHES;

        this.allMatches = matches.map((match: any) => {
          const matchTitle = this.generateMatchTitle(match);
          const matchUrl = this.generateMatchUrl(matchTitle);

          const formatted: FootballMatch = {
            away_team: match.away_team,
            category: match.category ?? "sports",
            competition: match.competition,
            date: match.date,
            home_team: match.home_team,
            score: match.score,
            status: match.status,
            url: matchUrl,
            ...this.checkIfFavorite({title: matchTitle, url: matchUrl})
          };
          return formatted;
        });

        this.filteredMatches = this.allMatches;
        this.isLoading = false;
        console.log("Matchs chargés (MOCK DATA).", this.allMatches.length);
      } catch (err) {
        console.error("Erreur chargement des matchs (MOCK):", err);
        this.isLoading = false;
      }
    }, 500); // Délai pour simuler le chargement
  }

  private checkIfFavorite(item: {title: string, url: string}): { isFavorite: boolean, favoriteId: number | null } {
    const favorite = this.currentFavorites.find(fav => fav.url === item.url);

    // Pour la démo, rendons le match "France vs Maroc" (Team 1 vs Team 2) favori par défaut
    if (item.title.includes("France vs Maroc")) {
      return { isFavorite: true, favoriteId: 999 }; // ID mock
    }

    return {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null
    };
  }

  filterMatches(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredMatches = this.allMatches;
    } else {
      // Le filtrage utilise toujours les clés techniques (home_team/away_team)
      this.filteredMatches = this.allMatches.filter(match =>
        match.home_team.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        match.away_team.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        match.competition.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  openModal(match: FootballMatch): void {
    this.selectedMatch = match;
    this.showModal = true;

    // Simulation: L'historique ne sera pas vraiment suivi sans un service réel
    if (this.authService.isLoggedIn()) {
      const source: any = 'football';
      this.historiqueService.trackVisit(
        this.generateMatchTitle(match),
        match.url,
        source,
        match.competition
      );
      console.log(`Visite tracée pour: ${this.generateMatchTitle(match)}`);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMatch = null;
  }

  toggleFavorite(match: FootballMatch): void {
    // Pour cette version Mock, on simule juste le basculement et les logs
    match.isFavorite = !match.isFavorite; // Optimistic UI update
    const team1 = match.home_team;
    const team2 = match.away_team;

    if (!match.isFavorite) {
      console.log(`SIMULATION: Suppression du favori pour Équipe 1 (${team1}) vs Équipe 2 (${team2})`);
      match.favoriteId = null;
    } else {
      console.log(`SIMULATION: Ajout du favori pour Équipe 1 (${team1}) vs Équipe 2 (${team2})`);
      // Simuler l'obtention d'un nouvel ID
      match.favoriteId = Math.floor(Math.random() * 1000) + 100;
    }
  }

  // Utilise Team 1 et Team 2 dans le titre généré pour la logique interne (logs, etc.)
  private generateMatchTitle(match: any): string {
    return `${match.home_team} vs ${match.away_team} - ${match.date}`;
  }

  private generateMatchUrl(title: string): string {
    return `https://sports.example.com/match/${title.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}
