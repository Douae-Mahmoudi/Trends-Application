// src/app/football/football.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

interface FootballMatch {
  away_team: string;
  category: string;
  competition: string;
  date: string;
  home_team: string;
  score: string;
  status: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-football',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './football.html',
  styleUrls: ['./football.css']
})
export class Football implements OnInit {
  allMatches: FootballMatch[] = [];
  filteredMatches: FootballMatch[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedMatch: FootballMatch | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.fetchMatches();
  }

  // 🔥 Récupération des matchs depuis ton backend Flask
  fetchMatches(): void {
    fetch('http://127.0.0.1:5000/api/sports') // ✅ adapte l’URL à ton API
      .then(res => res.json())
      .then((data: any) => {
        console.log("Données reçues du backend:", data);

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
            isFavorite: this.favoriteService.isFavorite(this.generateMatchId(match))
          };
          return formatted;
        });

        this.filteredMatches = this.allMatches;
      })
      .catch(err => console.error("Erreur chargement des matchs:", err));
  }

  // 🔍 Recherche
  filterMatches(): void {
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

  // 📌 Modal
  openModal(match: FootballMatch): void {
    this.selectedMatch = match;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMatch = null;
  }

  // ⭐ Favoris
  toggleFavorite(match: FootballMatch): void {
    const id = this.generateMatchId(match);
    if (this.favoriteService.isFavorite(id)) {
      this.favoriteService.removeFavorite(id);
    } else {
      const favoriteItem: FavoriteItem = {
        id: id,
        type: 'football',
        data: match
      };
      this.favoriteService.addFavorite(favoriteItem);
    }
    match.isFavorite = this.favoriteService.isFavorite(id);
  }

  private generateMatchId(match: FootballMatch): string {
    return `football-${match.home_team}-${match.away_team}-${match.date}`;
  }
}
