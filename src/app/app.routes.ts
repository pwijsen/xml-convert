import { Routes } from '@angular/router';
import { FeteComponent } from './pages/fete/fete.component';
import { AccueilComponent } from './pages/accueil/accueil.component';



export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'fete', component: FeteComponent },

];
