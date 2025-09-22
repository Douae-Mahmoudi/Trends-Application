// src/app/github/github.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { Modal } from '../modal/modal';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

interface TrendingTopic {
  category: string;
  created_at: string;
  description: string;
  full_name: string;
  url: string;
  owner: string;
  stars: number;
  watchers: number;
  isFavorite: boolean;
}

@Component({
  selector: 'app-github',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Modal],
  templateUrl: './github.html',
  styleUrls: ['./github.css']
})
export class Github implements OnInit {
  allTopics: TrendingTopic[] = [];
  filteredTopics: TrendingTopic[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedTopic: TrendingTopic | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.fetchGithubTrends();
  }

  // 🔥 Récupère les tendances GitHub depuis le backend Flask
  fetchGithubTrends(): void {
    fetch('http://127.0.0.1:5000/api/github')
      .then(response => response.json())
      .then((data: any[]) => {
        this.allTopics = data.map(topic => ({
          category: topic.category,
          created_at: topic.created_at,
          description: topic.description,
          full_name: topic.full_name,
          url: topic.url,
          owner: topic.owner,
          stars: topic.stars,
          watchers: topic.watchers,
          isFavorite: this.favoriteService.isFavorite(topic.full_name)
        }));
        this.filteredTopics = this.allTopics;
      })
      .catch(error => {
        console.error('Erreur lors du chargement des tendances GitHub:', error);
      });
  }

  filterTopics(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredTopics = this.allTopics;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredTopics = this.allTopics.filter(topic =>
        topic.full_name.toLowerCase().includes(searchTermLower) ||
        topic.description.toLowerCase().includes(searchTermLower) ||
        topic.owner.toLowerCase().includes(searchTermLower)
      );
    }
  }

  openModal(topic: TrendingTopic): void {
    this.selectedTopic = topic;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTopic = null;
  }

  toggleFavorite(topic: TrendingTopic): void {
    const id = topic.full_name;
    if (this.favoriteService.isFavorite(id)) {
      this.favoriteService.removeFavorite(id);
    } else {
      const favoriteItem: FavoriteItem = {
        id: id,
        type: 'github',
        data: topic
      };
      this.favoriteService.addFavorite(favoriteItem);
    }
    topic.isFavorite = this.favoriteService.isFavorite(id);
  }
}
