import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface HistoriqueItem {
  id: number;
  title: string;
  source: 'github' | 'reddit' | 'news' | 'football';
  author: string;
  url: string;
}

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [Sidebar, FormsModule, CommonModule],
  templateUrl: './historique.html',
  styleUrls: ['./historique.css']
})
export class Historique {
  searchTerm = '';

  items: HistoriqueItem[] = [
    { id: 1, title: 'Angular Repo Updated', source: 'github', author: 'dev123', url: 'https://github.com/angular' },
    { id: 2, title: 'Trending Post on Reddit', source: 'reddit', author: 'user45', url: 'https://reddit.com/r/angular' },
    { id: 3, title: 'Breaking News Today', source: 'news', author: 'cnn', url: 'https://cnn.com' },
    { id: 4, title: 'Football Match Results', source: 'football', author: 'FIFA', url: 'https://fifa.com' },
  ];

  get filteredItems() {
    if (!this.searchTerm.trim()) return this.items;
    return this.items.filter(i =>
      i.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
