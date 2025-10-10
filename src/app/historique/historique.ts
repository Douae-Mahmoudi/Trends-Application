import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HistoriqueService, HistoriqueItem } from '../services/historique.service';
import { HttpClientModule } from '@angular/common/http';

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

  constructor(private historiqueService: HistoriqueService) {}

  ngOnInit() {
    this.historiqueService.getTrends().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tendances:', err);
        this.loading = false;
      }
    });
  }

  get filteredItems() {
    if (!this.searchTerm.trim()) return this.items;
    return this.items.filter(i =>
      i.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
