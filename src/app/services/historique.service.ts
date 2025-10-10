import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistoriqueItem {
  id?: number;
  title: string;
  source: 'github' | 'reddit' | 'news' | 'football';
  author: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class HistoriqueService {
  private apiUrl = 'http://localhost:5000/api/history'; // ton Flask tourne sur ce port

  constructor(private http: HttpClient) {}

  getTrends(): Observable<HistoriqueItem[]> {
    return this.http.get<HistoriqueItem[]>(this.apiUrl);
  }
}
