import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importez ChartDataset de Chart.js pour une compatibilité stricte
import { ChartDataset } from 'chart.js';

// L'URL de votre backend Flask
const API_URL = 'http://127.0.0.1:5000/api';

// Interface pour les données brutes reçues du backend Flask (INCHANGÉE)
export interface TrendResult {
  date: string;
  category: string;
  count: number;
}

/**
 * Interface pour le format Chart.js attendu.
 * Utilisez ChartDataset<'bar'> pour assurer la compatibilité avec le type Chart.js.
 */
export interface ChartData {
  labels: string[]; // Les jours
  datasets: ChartDataset<'bar'>[]; // Le type ChartDataset gère la propriété 'label: string | undefined'
}

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {

  constructor(private http: HttpClient) { }

  getGlobalTrends(): Observable<{ success: boolean, data: TrendResult[] }> {
    return this.http.get<{ success: boolean, data: TrendResult[] }>(`${API_URL}/trends/global`);
  }
}
