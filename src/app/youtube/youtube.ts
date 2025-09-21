// src/app/youtube/youtube.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar} from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

interface YoutubeVideo {
  category: string;
  channel: string;
  title: string;
  url: string;
  views: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './youtube.html',
  styleUrls: ['./youtube.css']
})
export class Youtube implements OnInit {
  private allVideos: YoutubeVideo[] = [
    {
      "category": "youtube_trends",
      "channel": "Azahriah",
      "title": "Azahriah - vemzavr! (ft. Young Fly)",
      "url": "https://youtube.com/watch?v=OC8C4BsnizU",
      "views": "622346",
      "isFavorite": false
    },
    {
      "category": "youtube_trends",
      "channel": "IGN Hungary",
      "title": "Vaják: 4. évad - magyar feliratos kedvcsináló előzetes",
      "url": "https://youtube.com/watch?v=Rw6OQrnP1vE",
      "views": "37615",
      "isFavorite": false
    },
    {
      "category": "youtube_trends",
      "channel": "TheVR Gaming+",
      "title": "2025 EGYIK LEGJOBB JÁTÉKA (Szerintem)",
      "url": "https://youtube.com/watch?v=3_TrcISSn5A",
      "views": "89688",
      "isFavorite": false
    },
    {
      "category": "youtube_trends",
      "channel": "MrBeast",
      "title": "I Built 100 Wells In Africa!",
      "url": "https://youtube.com/watch?v=0e3GgV0kE00",
      "views": "250000000",
      "isFavorite": true
    },
    {
      "category": "youtube_music",
      "channel": "Taylor Swift",
      "title": "Taylor Swift - Blank Space",
      "url": "https://youtube.com/watch?v=e-ORhEE9IAY",
      "views": "3200000000",
      "isFavorite": false
    }
  ];

  filteredVideos: YoutubeVideo[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedVideo: YoutubeVideo | null = null;

  // Injection du service de favoris
  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    // Initialise l'état 'isFavorite' de chaque vidéo à partir du service
    this.allVideos.forEach(video => {
      video.isFavorite = this.favoriteService.isFavorite(video.url);
    });
    this.filteredVideos = this.allVideos;
  }

  filterVideos(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredVideos = this.allVideos;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredVideos = this.allVideos.filter(video =>
        video.title.toLowerCase().includes(searchTermLower) ||
        video.channel.toLowerCase().includes(searchTermLower)
      );
    }
  }

  openModal(video: YoutubeVideo): void {
    this.selectedVideo = video;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVideo = null;
  }

  toggleFavorite(video: YoutubeVideo): void {
    const id = video.url;
    if (this.favoriteService.isFavorite(id)) {
      this.favoriteService.removeFavorite(id);
    } else {
      const favoriteItem: FavoriteItem = {
        id: id,
        type: 'youtube',
        data: video
      };
      this.favoriteService.addFavorite(favoriteItem);
    }
    // Met à jour l'état 'isFavorite' local pour changer l'icône du cœur
    video.isFavorite = this.favoriteService.isFavorite(id);
    console.log(`Video "${video.title}" is now favorite: ${video.isFavorite}`);
  }
}
