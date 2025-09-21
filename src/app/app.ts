import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Dashboard} from './dashboard/dashboard';
import { Sidebar } from './sidebar/sidebar';
import { ApiDataService } from './services/api-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BaseChartDirective,
    Dashboard,
    Sidebar
  ],
  providers: [ApiDataService],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // ...
}
