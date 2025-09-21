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
  private allMatches: FootballMatch[] = [
    {
      away_team: "Estudiantes de La Plata",
      category: "sports",
      competition: "Copa Libertadores",
      date: "2025-09-19T00:30:00Z",
      home_team: "CR Flamengo",
      score: "2-0",
      status: "IN_PLAY",
      isFavorite: false
    },
    {
      away_team: "Manchester United",
      category: "sports",
      competition: "Premier League",
      date: "2025-09-19T14:00:00Z",
      home_team: "Liverpool",
      score: "1-1",
      status: "FINISHED",
      isFavorite: false
    },
    {
      away_team: "Real Madrid",
      category: "sports",
      competition: "La Liga",
      date: "2025-09-19T18:30:00Z",
      home_team: "FC Barcelona",
      score: "0-0",
      status: "SCHEDULED",
      isFavorite: false
    }
  ];

  filteredMatches: FootballMatch[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedMatch: FootballMatch | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.allMatches.forEach(match => {
      const id = this.generateMatchId(match);
      match.isFavorite = this.favoriteService.isFavorite(id);
    });
    // On garde tous les matchs, on ne filtre pas au départ
    this.filteredMatches = this.allMatches;
  }

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

  openModal(match: FootballMatch): void {
    this.selectedMatch = match;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMatch = null;
  }

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
    return `football-${match.home_team}-${match.away_team}`;
  }
}
