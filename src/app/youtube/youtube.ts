import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
import { HttpClientModule } from '@angular/common/http'; // 👈 Import nécessaire pour le service HTTP

interface YoutubeVideo {
  category: string;
  channel: string;
  title: string;
  url: string; // Utilisé comme identifiant unique
  views: string;
  isFavorite: boolean;
  favoriteId: number | null; // 👈 ID du favori dans la base de données (pour suppression)
}

@Component({
  selector: 'app-youtube',
  standalone: true,
  // 👈 Ajout de HttpClientModule aux imports
  imports: [CommonModule, FormsModule, Sidebar, HttpClientModule],
  templateUrl: './youtube.html',
  styleUrls: ['./youtube.css']
})
export class Youtube implements OnInit {
  allVideos: YoutubeVideo[] = [];
  filteredVideos: YoutubeVideo[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedVideo: YoutubeVideo | null = null;
  private currentFavorites: FavoriteItem[] = []; // Cache local des favoris du backend

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    // 1. Charger les favoris actuels avant de charger les vidéos
    this.loadCurrentFavorites().then(() => {
      this.fetchYoutubeTrends("morocco");
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

  // 2. Vérification de l'état "Favori" pour une vidéo
  private checkIfFavorite(video: any): { isFavorite: boolean, favoriteId: number | null } {
    // On utilise l'URL, qui est le champ 'url' dans la table 'favorites' du backend
    const favorite = this.currentFavorites.find(fav => fav.url === video.url);

    return {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null
    };
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
          // 👈 Utiliser la fonction de vérification
          ...this.checkIfFavorite(video)
        }));
        this.filteredVideos = this.allVideos;
      })
      .catch(error => {
        console.error('❌ Erreur lors du chargement des tendances YouTube:', error);
      });
  }

  // 🔍 Filtrer localement les vidéos par titre ou chaîne (inchangé)
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

  // 📌 Recherche via backend (inchangé)
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
          // 👈 Utiliser la fonction de vérification
          ...this.checkIfFavorite(video)
        }));
      })
      .catch(error => {
        console.error('❌ Erreur lors de la recherche YouTube:', error);
      });
  }

  // 📌 Gestion de la fenêtre modale (inchangé)
  openModal(video: YoutubeVideo): void {
    this.selectedVideo = video;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVideo = null;
  }

  // ⭐ Logique de favori mise à jour (asynchrone)
  toggleFavorite(video: YoutubeVideo): void {
    video.isFavorite = !video.isFavorite; // Mise à jour optimiste

    if (!video.isFavorite) {
      // Suppression du favori
      if (video.favoriteId !== null) {
        this.favoriteService.removeFavorite(video.favoriteId).subscribe({
          next: () => {
            video.favoriteId = null; // Supprime l'ID local
          },
          error: (err) => {
            console.error('Erreur de suppression:', err);
            video.isFavorite = true; // Rollback
            alert(`Erreur de suppression: ${err.message}`);
          }
        });
      } else {
        console.warn("Impossible de supprimer le favori car l'ID BDD est manquant.");
      }

    } else {
      // Ajout du favori
      const title = video.title;
      const url = video.url;
      const category = video.category || 'youtube';
      const source = video.channel;

      this.favoriteService.addFavorite(title, url, category, source).subscribe({
        next: (response) => {
          // L'ajout a réussi, on recharge les favoris pour récupérer l'ID généré
          this.loadCurrentFavorites().then(() => {
            // Mettre à jour l'état de la vidéo pour obtenir le nouvel ID
            const updatedState = this.checkIfFavorite(video);
            video.favoriteId = updatedState.favoriteId;
          });
        },
        error: (err) => {
          console.error('Erreur d\'ajout:', err);
          video.isFavorite = false; // Rollback
          alert(`Erreur d'ajout aux favoris: ${err.message}`);
        }
      });
    }
  }
}
