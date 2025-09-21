import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../services/api-data.service';
import { Sidebar } from '../sidebar/sidebar';
import { Chart, registerables } from 'chart.js';
import { ChartDataset } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | undefined;

  public data: { labels: string[], datasets: ChartDataset<'bar'>[] } | null = null;
  public isLoading: boolean = true;
  public error: string | null = null;

  constructor(private apiDataService: ApiDataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;
    this.apiDataService.getPopularTopics().subscribe({
      next: (response) => {
        if (response && response.datasets && response.labels) {
          this.data = response;
          // Un petit délai pour s'assurer que le DOM est mis à jour avant de rendre le graphique
          setTimeout(() => this.renderChart(), 0);
        } else {
          this.error = 'Les données reçues sont invalides.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données.';
        this.isLoading = false;
        console.error('Erreur API:', err);
      }
    });
  }

  renderChart(): void {
    if (!this.barChartRef || !this.data) {
      console.warn('Impossible de rendre le graphique: référence au canvas ou données manquantes.');
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.data.labels,
          datasets: this.data.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {},
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
    }
  }
}
