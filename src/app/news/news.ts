import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
import { HttpClientModule } from '@angular/common/http'; // 👈 Import nécessaire pour le service HTTP

interface NewsArticle {
  author: string;
  category: string;
  source: string;
  title: string;
  url: string; // Utilisé comme identifiant unique
  isFavorite: boolean;
  favoriteId: number | null; // 👈 ID du favori dans la base de données (pour suppression)
}

@Component({
  selector: 'app-news',
  standalone: true,
  // 👈 Ajout de HttpClientModule aux imports
  imports: [CommonModule, FormsModule, Sidebar, HttpClientModule],
  templateUrl: './news.html',
  styleUrls: ['./news.css']
})
export class News implements OnInit {
  allArticles: NewsArticle[] = [];
  filteredArticles: NewsArticle[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedArticle: NewsArticle | null = null;
  private currentFavorites: FavoriteItem[] = []; // Cache local des favoris du backend

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    // 1. Charger les favoris actuels avant de charger les articles
    this.loadCurrentFavorites().then(() => {
      this.fetchArticles();
    });
  }

  // 1. Chargement asynchrone des favoris depuis le backend
  async loadCurrentFavorites(): Promise<void> {
    return new Promise((resolve) => {
      this.favoriteService.getFavorites().subscribe({
        next: (data) => {
          this.currentFavorites = data;
          resolve();
        },
        error: (err) => {
          console.error("Erreur de chargement des favoris:", err);
          resolve();
        }
      });
    });
  }

  // 2. Vérification de l'état "Favori" pour un article
  private checkIfFavorite(article: any): { isFavorite: boolean, favoriteId: number | null } {
    // On utilise l'URL, qui est le champ 'url' dans la table 'favorites' du backend
    const favorite = this.currentFavorites.find(fav => fav.url === article.url);

    return {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null
    };
  }

  // 🔥 Récupération des articles et initialisation de l'état "Favori"
  fetchArticles(): void {
    fetch('http://127.0.0.1:5000/api/news') // ✅ adapte l’URL selon ton API
      .then(res => res.json())
      .then((data: any) => {
        console.log("Données reçues du backend (news):", data);

        const articles = Array.isArray(data) ? data : data.all_articles;

        this.allArticles = articles.map((article: any) => ({
          author: article.author || "Inconnu",
          category: article.category || "general_news",
          source: article.source || "Unknown",
          title: article.title,
          url: article.url,
          // 👈 Utiliser la fonction de vérification
          ...this.checkIfFavorite(article)
        }));

        this.filteredArticles = this.allArticles;
      })
      .catch(err => console.error("Erreur lors du chargement des articles:", err));
  }

  filterArticles(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredArticles = this.allArticles;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredArticles = this.allArticles.filter(article =>
        article.title.toLowerCase().includes(searchTermLower) ||
        article.author.toLowerCase().includes(searchTermLower) ||
        article.source.toLowerCase().includes(searchTermLower)
      );
    }
  }

  openModal(article: NewsArticle): void {
    this.selectedArticle = article;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedArticle = null;
  }

  // ⭐ Logique de favori mise à jour (asynchrone)
  toggleFavorite(article: NewsArticle): void {
    article.isFavorite = !article.isFavorite; // Mise à jour optimiste

    if (!article.isFavorite) {
      // Suppression du favori
      if (article.favoriteId !== null) {
        this.favoriteService.removeFavorite(article.favoriteId).subscribe({
          next: () => {
            article.favoriteId = null; // Supprime l'ID local
          },
          error: (err) => {
            console.error('Erreur de suppression:', err);
            article.isFavorite = true; // Rollback
            alert(`Erreur de suppression: ${err.message}`);
          }
        });
      } else {
        console.warn("Impossible de supprimer le favori car l'ID BDD est manquant.");
      }

    } else {
      // Ajout du favori
      const title = article.title;
      const url = article.url;
      const category = article.category;
      const source = article.source;

      this.favoriteService.addFavorite(title, url, category, source).subscribe({
        next: (response) => {
          // L'ajout a réussi, on recharge les favoris pour récupérer l'ID généré
          this.loadCurrentFavorites().then(() => {
            // Mettre à jour l'état de l'article pour obtenir le nouvel ID
            const updatedState = this.checkIfFavorite(article);
            article.favoriteId = updatedState.favoriteId;
          });
        },
        error: (err) => {
          console.error('Erreur d\'ajout:', err);
          article.isFavorite = false; // Rollback
          alert(`Erreur d'ajout aux favoris: ${err.message}`);
        }
      });
    }
  }
}
