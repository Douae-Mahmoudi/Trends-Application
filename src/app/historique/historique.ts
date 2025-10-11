import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import HistoriqueService, { HistoriqueItem } from '../services/historique.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [Sidebar, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './historique.html',
  styleUrls: ['./historique.css']
})
export class Historique implements OnInit {
  searchTerm = '';
  items: HistoriqueItem[] = [];
  loading = true;
  errorMessage = '';
  debugInfo = ''; // 🔹 Nouveau pour afficher ce qu’on reçoit

  constructor(private historiqueService: HistoriqueService) {}

  ngOnInit(): void {
    console.log('🟢 HistoriqueComponent initialisé');
    this.loadHistory();
  }

  /** 🔹 Charger l’historique depuis le backend Flask */
  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.debugInfo = '';

    console.log('📡 Appel à getHistory()...');

    this.historiqueService.getHistory().subscribe({
      next: (data) => {
        console.log('✅ Réponse reçue depuis Flask :', data);

        if (!data || data.length === 0) {
          console.warn('⚠️ Données vides ou non trouvées.');
          this.debugInfo = 'Réponse vide du backend.';
        }

        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de l’historique:', err);
        this.errorMessage = err.error?.message || 'Impossible de charger l’historique.';
        this.loading = false;
        this.debugInfo = `Erreur HTTP ${err.status}: ${this.errorMessage}`;
      },
      complete: () => {
        console.log('📭 Fin de la requête vers Flask.');
      }
    });
  }

  /** 🔹 Filtrage local des éléments */
  get filteredItems(): HistoriqueItem[] {
    if (!this.searchTerm.trim()) return this.items;
    return this.items.filter(i =>
      i.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /** 🔹 Supprimer un élément spécifique */
  deleteItem(id: number): void {
    console.log('🗑️ Suppression de l’élément ID:', id);
    this.historiqueService.deleteItem(id).subscribe({
      next: (res) => {
        console.log('✅ Résultat suppression:', res);
        if (res.success) {
          this.items = this.items.filter(item => item.id !== id);
        } else {
          console.warn('⚠️ Échec suppression:', res);
        }
      },
      error: (err) => {
        console.error('❌ Erreur de suppression:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression.';
      }
    });
  }

  /** 🔹 Effacer tout l’historique */
  clearHistory(): void {
    if (!confirm('Voulez-vous vraiment effacer tout l’historique ?')) return;

    console.log('🧹 Nettoyage complet de l’historique...');
    this.historiqueService.clearHistory().subscribe({
      next: (res) => {
        console.log('✅ Réponse du backend pour clearHistory:', res);
        if (res.success) {
          this.items = [];
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors du nettoyage:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression de l’historique.';
      }
    });
  }
}

