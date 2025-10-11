import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService, TrendResult, ChartData } from '../services/api-data.service';
import { Sidebar } from '../sidebar/sidebar';
import { Chart, registerables, ChartDataset } from 'chart.js';

Chart.register(...registerables);

// Les couleurs à utiliser pour chaque catégorie de graphique
const CHART_COLORS: { [key: string]: string } = {
  'Technologie': 'rgba(75, 192, 192, 0.6)',
  'Finance': 'rgba(255, 99, 132, 0.6)',
  'Sport': 'rgba(54, 162, 235, 0.6)',
  'Santé': 'rgba(255, 159, 64, 0.6)',
  'Autre': 'rgba(153, 102, 255, 0.6)',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | undefined;

  public data: ChartData | null = null;
  public isLoading: boolean = true;
  public error: string | null = null;

  private _chartData: ChartData | null = null;

  constructor(
    private apiDataService: ApiDataService,
    private cdr: ChangeDetectorRef // Injection du ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Si les données sont déjà chargées lorsque la vue est initialisée, on rend le graphique
    if (this._chartData) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.apiDataService.getGlobalTrends().subscribe({
      next: (apiResponse) => {
        console.log("1. Réponse API brute reçue:", apiResponse);

        if (apiResponse && apiResponse.success && apiResponse.data) {
          this._chartData = this.transformDataForChart(apiResponse.data);
          this.data = this._chartData; // Affecte 'data' pour rendre le *ngIf dans le HTML

          // CRUCIAL : Forcer Angular à détecter le changement (le *ngIf="data" passe à true)
          this.cdr.detectChanges();

          console.log("2. Données transformées (ChartData):", this.data);

          if (this.data.labels.length > 0) {
            // Après le forçage du changement de détection, le ViewChild devrait être prêt.
            // On conserve le setTimeout(0) par mesure de sécurité ultime.
            setTimeout(() => {
              if (this.barChartRef) {
                this.renderChart();
              } else {
                console.error("3.1. Échec critique du rendu: Le @ViewChild('barChart') est toujours undefined après le ChangeDetectorRef et setTimeout. Vérifiez la structure HTML.");
              }
            }, 0);
          } else {
            this.error = 'Aucune donnée de tendance trouvée pour les 7 derniers jours.';
            console.warn("2.1. Erreur de données: La liste des jours (labels) est vide.");
          }
        } else {
          this.error = 'Les données reçues sont invalides ou non réussies.';
          console.error("2.2. Erreur de données: API response invalide ou success=false.");
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données des tendances globales.';
        this.isLoading = false;
        console.error('3. Erreur API (HTTP):', err);
      }
    });
  }

  private transformDataForChart(results: TrendResult[]): ChartData {
    // Logique de transformation inchangée
    const allDates = [...new Set(results.map(item => item.date))].sort();
    const allCategories = [...new Set(results.map(item => item.category))];

    const categoryDataMap = new Map<string, { [date: string]: number }>();
    allCategories.forEach(category => {
      categoryDataMap.set(category, {});
    });

    results.forEach(item => {
      const count = Number(item.count);
      if (!isNaN(count)) {
        categoryDataMap.get(item.category)![item.date] = count;
      }
    });

    const datasets: ChartDataset<'bar'>[] = [];
    categoryDataMap.forEach((dataByDate, category) => {
      const dataSet: number[] = allDates.map(date => dataByDate[date] || 0);

      datasets.push({
        label: category,
        data: dataSet,
        backgroundColor: CHART_COLORS[category] || 'rgba(150, 150, 150, 0.6)',
      });
    });

    return {
      labels: allDates.map(date => this.formatDateLabel(date)),
      datasets: datasets,
    };
  }

  private formatDateLabel(dateString: string): string {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  }

  renderChart(): void {
    if (!this.barChartRef || !this.data) {
      return;
    }
    console.log("4. Canevas trouvé. Démarrage du rendu de Chart.js...");

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
            x: {
              stacked: true,
              title: { display: true, text: 'Jour' }
            },
            y: {
              beginAtZero: true,
              stacked: true,
              title: { display: true, text: 'Nombre de consultations' }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Tendances de consultation par catégorie (7 derniers jours)'
            }
          }
        }
      });
    }
  }
}
