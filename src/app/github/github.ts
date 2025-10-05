import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { Modal } from '../modal/modal';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
import { HttpClientModule } from '@angular/common/http';
// NOUVEAUX IMPORTS POUR L'AUTHENTIFICATION
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface TrendingTopic {
  category: string;
  created_at: string;
  description: string;
  full_name: string; // Utilisé comme identifiant unique
  url: string;
  owner: string;
  stars: number;
  watchers: number;
  isFavorite: boolean;
  favoriteId: number | null; // ID du favori dans la base de données (pour suppression)
}

@Component({
  selector: 'app-github',
  standalone: true,
  // Ajoutez HttpClientModule aux imports
  imports: [CommonModule, FormsModule, Sidebar, Modal, HttpClientModule],
  templateUrl: './github.html',
  styleUrls: ['./github.css']
})
export class Github implements OnInit, OnDestroy { // Ajout de OnDestroy
  allTopics: TrendingTopic[] = [];
  filteredTopics: TrendingTopic[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedTopic: TrendingTopic | null = null;
  private currentFavorites: FavoriteItem[] = [];

  private authSubscription!: Subscription; // Abonnement pour le nettoyage

  // Injection de AuthService en plus de FavoriteService
  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Charger les tendances GitHub immédiatement (elles ne nécessitent pas de connexion)
    this.fetchGithubTrends();

    // 2. S'abonner à l'état d'authentification pour charger les favoris
    this.authSubscription = this.authService.isAuthenticated$
      .pipe(
        // N'exécuter que si l'utilisateur est TRUE (connecté)
        filter(isAuthenticated => isAuthenticated === true)
      )
      .subscribe(() => {
        console.log("Utilisateur connecté : Chargement des favoris pour GitHub...");
        // Une fois connecté, on charge les favoris
        this.loadCurrentFavorites();
      });
  }

  // Nettoyage de l'abonnement
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // 1. Chargement asynchrone des favoris depuis le backend
  loadCurrentFavorites(): Promise<void> {
    return new Promise((resolve) => {
      this.favoriteService.getFavorites().subscribe({
        next: (data) => {
          this.currentFavorites = data.filter(fav => fav.category === 'github' || fav.source === 'github');
          // Mettre à jour l'état des topics existants
          this.syncFavoritesWithTopics();
          resolve();
        },
        error: (err) => {
          console.error("Erreur de chargement des favoris:", err);
          // L'erreur est gérée, mais on continue
          resolve();
        }
      });
    });
  }

  // Nouvelle fonction pour mettre à jour l'état visuel des tendances
  private syncFavoritesWithTopics(): void {
    this.allTopics = this.allTopics.map(topic => {
      const { isFavorite, favoriteId } = this.checkIfFavorite(topic);
      return {
        ...topic,
        isFavorite: isFavorite,
        favoriteId: favoriteId
      };
    });
    this.filterTopics(); // Rafraîchir l'affichage
  }

  // 2. Vérification de l'état "Favori" pour chaque tendance
  private checkIfFavorite(topic: any): { isFavorite: boolean, favoriteId: number | null } {
    const favorite = this.currentFavorites.find(fav => fav.title === topic.full_name);

    return {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null
    };
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
          // Nous n'appelons plus checkIfFavorite ici, on le fera après la connexion.
          isFavorite: false,
          favoriteId: null
        }));
        this.filteredTopics = this.allTopics;
        // Si l'utilisateur est déjà connecté au chargement de la page, on charge les favoris
        if (this.authService.isLoggedIn()) {
          this.loadCurrentFavorites();
        }
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

  // ⭐ Logique de favori mise à jour (asynchrone)
  toggleFavorite(topic: TrendingTopic): void {
    // ... (La logique ici est correcte car elle est déclenchée par un clic,
    // ce qui se produit après que l'utilisateur est déjà connecté)
    topic.isFavorite = !topic.isFavorite; // Mise à jour optimiste

    if (!topic.isFavorite) {
      // Suppression du favori
      if (topic.favoriteId !== null) {
        this.favoriteService.removeFavorite(topic.favoriteId).subscribe({
          next: () => {
            topic.favoriteId = null; // Supprime l'ID local
            // Retirer de la liste de cache locale pour la synchro
            this.currentFavorites = this.currentFavorites.filter(fav => fav.id !== topic.favoriteId);
          },
          error: (err) => {
            console.error('Erreur de suppression:', err);
            topic.isFavorite = true; // Rollback
            alert(`Erreur de suppression: ${err.message}`);
          }
        });
      } else {
        console.warn("Impossible de supprimer le favori car l'ID BDD est manquant.");
      }

    } else {
      // Ajout du favori
      const title = topic.full_name;
      const url = topic.url;
      const category = 'github'; // Définir la catégorie/source
      const source = 'github';

      this.favoriteService.addFavorite(title, url, category, source).subscribe({
        next: (response) => {
          // L'ajout a réussi, il faut maintenant récupérer l'ID généré par la BDD
          this.loadCurrentFavorites(); // Recharger pour obtenir le nouvel ID
        },
        error: (err) => {
          console.error('Erreur d\'ajout:', err);
          topic.isFavorite = false; // Rollback
          alert(`Erreur d'ajout aux favoris: ${err.message}`);
        }
      });
    }
  }
}
