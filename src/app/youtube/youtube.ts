// src/app/youtube/youtube.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
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
  allVideos: YoutubeVideo[] = [];
  filteredVideos: YoutubeVideo[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedVideo: YoutubeVideo | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {

    this.fetchYoutubeTrends("morocco");
  }

  // 🔥 Récupère les vidéos tendances pour un pays donné
  fetchYoutubeTrends(country: string): void {
    fetch(`http://127.0.0.1:5000/api/youtube/${country}`)
      .then(response => response.json())
      .then((data: any[]) => {
        this.allVideos = data.map(video => ({
          category: video.category,
          channel: video.channel,
          title: video.title,
          url: video.url,
          views: video.views,
          isFavorite: this.favoriteService.isFavorite(video.url)
        }));
        this.filteredVideos = this.allVideos;
      })
      .catch(error => {
        console.error('❌ Erreur lors du chargement des tendances YouTube:', error);
      });
  }

  // 🔍 Filtrer localement les vidéos par titre ou chaîne
  filterVideos(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredVideos = this.allVideos;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredVideos = this.allVideos.filter(video =>
        video.title.toLowerCase().includes(term) ||
        video.channel.toLowerCase().includes(term)
      );
    }
  }

  // 📌 Recherche via backend (optionnel)
  searchVideosBackend(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredVideos = this.allVideos;
      return;
    }

    fetch(`http://127.0.0.1:5000/api/search/${this.searchTerm}`)
      .then(response => response.json())
      .then((data: any[]) => {
        this.filteredVideos = data.map(video => ({
          category: video.category,
          channel: video.channel,
          title: video.title,
          url: video.url,
          views: video.views,
          isFavorite: this.favoriteService.isFavorite(video.url)
        }));
      })
      .catch(error => {
        console.error('❌ Erreur lors de la recherche YouTube:', error);
      });
  }

  // 📌 Gestion de la fenêtre modale
  openModal(video: YoutubeVideo): void {
    this.selectedVideo = video;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVideo = null;
  }

  // ⭐ Gestion des favoris
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
    video.isFavorite = this.favoriteService.isFavorite(id);
  }
}
