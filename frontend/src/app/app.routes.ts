import { Routes } from '@angular/router';
import { DictionaryComponent } from './components/dictionary/dictionary.component';

export const routes: Routes = [
  {
    path: '',
    component: DictionaryComponent,
    title: 'Dictionary'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
