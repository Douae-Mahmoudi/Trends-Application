import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './favoris.html',
  styleUrls: ['./favoris.css']
})
export class Favoris implements OnInit {
  favorites: FavoriteItem[] = [];

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.favorites = this.favoriteService.getFavorites();
  }

  removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorite(id);
    this.favorites = this.favoriteService.getFavorites(); // Mettre à jour la liste
  }
}
