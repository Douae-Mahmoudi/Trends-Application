import { Injectable } from '@angular/core';

export interface FavoriteItem {
  id: string;
  type: 'football' | 'github' | 'reddit' | 'news' | 'youtube';
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favorites: FavoriteItem[] = [];

  constructor() {
    this.loadFavorites();
  }

  addFavorite(item: FavoriteItem): void {
    if (!this.isFavorite(item.id)) {
      this.favorites.push(item);
      this.saveFavorites();
    }
  }

  // Retire un élément de la liste des favoris
  removeFavorite(id: string): void {
    this.favorites = this.favorites.filter(item => item.id !== id);
    this.saveFavorites();
  }

  isFavorite(id: string): boolean {
    return this.favorites.some(item => item.id === id);
  }

  // Récupère tous les favoris
  getFavorites(): FavoriteItem[] {
    return this.favorites;
  }

  // Sauvegarde les favoris dans le stockage local du navigateur
  private saveFavorites(): void {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  // Charge les favoris depuis le stockage local
  private loadFavorites(): void {
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
      this.favorites = JSON.parse(favorites);
    }
  }
}
