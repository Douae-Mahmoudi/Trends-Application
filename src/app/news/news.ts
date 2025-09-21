
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
  private allArticles: NewsArticle[] = [
    {
      author: "speckx",
      category: "tech_news",
      source: "Hacker News",
      title: "I regret building this $3000 Pi AI cluster",
      url: "https://www.jeffgeerling.com/blog/2025/i-regret-building-3000-pi-ai-cluster",
      isFavorite: false
    },
    {
      author: "Jane Doe",
      category: "business_news",
      source: "Business Insider",
      title: "The rise of remote work and its impact on real estate",
      url: "https://www.businessinsider.com/remote-work-real-estate-impact",
      isFavorite: false
    },
    {
      author: "John Smith",
      category: "science_news",
      source: "NASA",
      title: "New discovery of a habitable exoplanet",
      url: "https://www.nasa.gov/exoplanet-discovery",
      isFavorite: false
    },
    {
      author: "Emily White",
      category: "tech_news",
      source: "Wired",
      title: "The future of quantum computing",
      url: "https://www.wired.com/quantum-computing-future",
      isFavorite: false
    }
  ];

  filteredArticles: NewsArticle[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedArticle: NewsArticle | null = null;

  // Injection du service de favoris dans le constructeur
  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.allArticles.forEach(article => {
      article.isFavorite = this.favoriteService.isFavorite(article.url);
    });
    this.filteredArticles = this.allArticles;
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
