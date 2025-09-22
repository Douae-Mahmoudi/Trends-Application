// src/app/news/news.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

interface NewsArticle {
  author: string;
  category: string;
  source: string;
  title: string;
  url: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './news.html',
  styleUrls: ['./news.css']
})
export class News implements OnInit {
  allArticles: NewsArticle[] = [];
  filteredArticles: NewsArticle[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedArticle: NewsArticle | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.fetchArticles();
  }

  // 🔥 Récupération des articles depuis ton backend Flask
  fetchArticles(): void {
    fetch('http://127.0.0.1:5000/api/news') // ✅ adapte l’URL selon ton API
      .then(res => res.json())
      .then((data: any) => {
        console.log("Données reçues du backend (news):", data);

        // Si ton backend renvoie { all_articles: [...] }
        const articles = Array.isArray(data) ? data : data.all_articles;

        this.allArticles = articles.map((article: any) => ({
          author: article.author || "Inconnu",
          category: article.category || "general_news",
          source: article.source || "Unknown",
          title: article.title,
          url: article.url,
          isFavorite: this.favoriteService.isFavorite(article.url)
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

  toggleFavorite(article: NewsArticle): void {
    const id = article.url;
    if (this.favoriteService.isFavorite(id)) {
      this.favoriteService.removeFavorite(id);
    } else {
      const favoriteItem: FavoriteItem = {
        id: id,
        type: 'news',
        data: article
      };
      this.favoriteService.addFavorite(favoriteItem);
    }
    article.isFavorite = this.favoriteService.isFavorite(id);
  }
}
