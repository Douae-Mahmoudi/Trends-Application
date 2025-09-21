import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChartDataset } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {
  getPopularTopics(): Observable<{ labels: string[], datasets: ChartDataset<'bar'>[] }> {
    const mockData = {
      labels: ['IA générative', 'Cybersécurité', 'Développement Web', 'Voiture électrique'],
      datasets: [
        {
          label: 'Score de Tendance',
          data: [95, 78, 85, 90],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1
        } as ChartDataset<'bar'>
      ]
    };
    return of(mockData);
  }
}
