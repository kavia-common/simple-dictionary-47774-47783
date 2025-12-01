import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DictionaryEntry, DictionaryService } from '../../services/dictionary.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.css'
})
export class DictionaryComponent {
  /** This is a public component for the main dictionary search UI. */
  private dict = inject(DictionaryService);
  private destroyRef = inject(DestroyRef);

  query = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  results = signal<DictionaryEntry[] | null>(null);
  searchedOnce = signal<boolean>(false);

  private input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          const trimmed = (q ?? '').trim();
          if (!trimmed) {
            this.results.set(null);
            this.error.set(null);
            this.loading.set(false);
            return of(null);
          }
          this.loading.set(true);
          this.error.set(null);
          return this.dict.search(trimmed);
        })
      )
      .subscribe({
        next: (res) => {
          if (res === null) return;
          this.results.set(res);
          this.searchedOnce.set(true);
          this.loading.set(false);
          if (Array.isArray(res) && res.length === 0) {
            this.error.set('No definitions found for the entered word.');
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.searchedOnce.set(true);
          this.error.set('An unexpected error occurred. Please try again.');
          console.error(err);
        }
      });

    this.destroyRef.onDestroy(() => {
      this.input$.complete();
    });
  }

  onInput(value: string) {
    this.query.set(value);
    this.input$.next(value);
  }

  onSearch() {
    const q = this.query();
    this.input$.next(q);
  }

  trackByIndex(idx: number) {
    return idx;
  }
}
