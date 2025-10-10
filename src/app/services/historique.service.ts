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
  private apiUrl = 'http://localhost:5000/api/history';

  constructor(private http: HttpClient) {}

  getTrends(): Observable<HistoriqueItem[]> {
    return this.http.get<HistoriqueItem[]>(this.apiUrl, {
      withCredentials: true  // ← AJOUTÉ ICI !
    });
  }

  addToHistory(item: HistoriqueItem): Observable<any> {
    return this.http.post(this.apiUrl, item, {
      withCredentials: true  // ← AJOUTÉ ICI AUSSI !
    });
  }

  clearHistory(): Observable<any> {
    return this.http.delete(this.apiUrl, {
      withCredentials: true  // ← AJOUTÉ ICI AUSSI !
    });
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true  // ← AJOUTÉ ICI AUSSI !
    });
  }
}