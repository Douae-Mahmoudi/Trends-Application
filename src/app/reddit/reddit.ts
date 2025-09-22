import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface TrendingPost {
  author: string;
  title: string;
  url: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-reddit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    HttpClientModule   // ✅ Ajout obligatoire pour HttpClient
  ],
  templateUrl: './reddit.html',
  styleUrls: ['./reddit.css']
})
export class Reddit implements OnInit {
  allPosts: TrendingPost[] = [];  // Initialement vide, rempli depuis backend
  filteredPosts: TrendingPost[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedPost: TrendingPost | null = null;

  constructor(
    private favoriteService: FavoriteService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchRedditTrends();
  }

  // 🔹 Récupération des tendances Reddit depuis le backend Flask
  fetchRedditTrends(): void {
    this.http.get<any[]>('http://localhost:5000/api/reddit')
      .subscribe(
        (data) => {
          console.log("✅ Données reçues du backend:", data);
          this.allPosts = data.map(post => ({
            author: post.author,
            title: post.title,
            url: post.url,
            isFavorite: this.favoriteService.isFavorite(post.url)
          }));
          this.filteredPosts = this.allPosts;
        },
        (error) => {
          console.error("❌ Erreur lors de la récupération des tendances Reddit:", error);
        }
      );
  }

  // 🔹 Filtrer les posts selon le texte saisi
  filterPosts(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredPosts = this.allPosts;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredPosts = this.allPosts.filter(post =>
        post.title.toLowerCase().includes(searchTermLower) ||
        post.author.toLowerCase().includes(searchTermLower)
      );
    }
  }

  // 🔹 Ouvrir la fenêtre modale
  openModal(post: TrendingPost): void {
    this.selectedPost = post;
    this.showModal = true;
  }

  // 🔹 Fermer la fenêtre modale
  closeModal(): void {
    this.showModal = false;
    this.selectedPost = null;
  }

  // 🔹 Gérer les favoris
  toggleFavorite(post: TrendingPost): void {
    const id = post.url;
    if (this.favoriteService.isFavorite(id)) {
      this.favoriteService.removeFavorite(id);
    } else {
      const favoriteItem: FavoriteItem = {
        id: id,
        type: 'reddit',
        data: post
      };
      this.favoriteService.addFavorite(favoriteItem);
    }
    post.isFavorite = this.favoriteService.isFavorite(id);
  }
}
