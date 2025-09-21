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
  private allTopics: TrendingTopic[] = [
    {
      category: "trending_python",
      created_at: "2025-09-04T14:37:36Z",
      description: "MapAnything: Universal Feed-Forward Metric 3D Reconstruction",
      full_name: "facebookresearch/map-anything",
      url: "https://github.com/facebookresearch/map-anything",
      owner: "facebookresearch",
      stars: 1064,
      watchers: 1064,
      isFavorite: false
    },
    {
      category: "trending_javascript",
      created_at: "2025-09-03T10:20:00Z",
      description: "A fast and lightweight JavaScript framework.",
      full_name: "vuejs/vue",
      url: "https://github.com/vuejs/vue",
      owner: "vuejs",
      stars: 350000,
      watchers: 350000,
      isFavorite: false
    },
    {
      category: "trending_java",
      created_at: "2025-09-02T08:00:00Z",
      description: "An open-source Java framework for building robust applications.",
      full_name: "spring-projects/spring-boot",
      url: "https://github.com/spring-projects/spring-boot",
      owner: "spring-projects",
      stars: 65000,
      watchers: 65000,
      isFavorite: false
    },
    {
      category: "trending_typescript",
      created_at: "2025-09-01T12:45:00Z",
      description: "TypeORM is a powerful ORM for TypeScript and JavaScript.",
      full_name: "typeorm/typeorm",
      url: "https://github.com/typeorm/typeorm",
      owner: "typeorm",
      stars: 30000,
      watchers: 30000,
      isFavorite: false
    }
  ];

  filteredTopics: TrendingTopic[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedTopic: TrendingTopic | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.allTopics.forEach(topic => {
      topic.isFavorite = this.favoriteService.isFavorite(topic.full_name);
    });
    this.filteredTopics = this.allTopics;
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
