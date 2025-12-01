import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

/**
 * Public API response types for dictionaryapi.dev
 */
export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface DictionaryEntry {
  word: string;
  phonetics?: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
}

/**
 * Error payload from dictionaryapi.dev when word not found
 * { "title": "No Definitions Found", "message": "...", "resolution": "..." }
 */
export interface DictionaryApiError {
  title?: string;
  message?: string;
  resolution?: string;
}

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class DictionaryService {
  /** This is a public function. */
  private http = inject(HttpClient);

  /**
   * Get the API base URL from environment or window runtime injection.
   * Uses process.env-like replacement if available during build or window['NG_APP_API_BASE'] at runtime.
   */
  private get apiBase(): string | undefined {
    // Angular doesn't expose process.env by default. We rely on global window injection or build-time replacements.
    const win = globalThis as unknown as { NG_APP_API_BASE?: string };
    const fromWindow = (win && win.NG_APP_API_BASE) || undefined;
    return fromWindow;
  }

  private buildUrl(word: string): string {
    const trimmed = word.trim();
    if (!trimmed) return '';
    if (this.apiBase) {
      const base = this.apiBase.replace(/\/+$/, '');
      return `${base}/entries/en/${encodeURIComponent(trimmed)}`;
    }
    // Fallback to public API
    return `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`;
  }

  /**
   * Fetch definitions for a word.
   * Gracefully handles 404 "No Definitions Found" by returning an empty array.
   */
// PUBLIC_INTERFACE
  search(word: string): Observable<DictionaryEntry[]> {
    const url = this.buildUrl(word);
    if (!url) return of([]);

    return this.http.get<DictionaryEntry[] | DictionaryApiError>(url).pipe(
      map((data: DictionaryEntry[] | DictionaryApiError) => {
        if (Array.isArray(data)) return data;
        // Some proxies may wrap, treat non-array as not found.
        return [];
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          // Word not found; return empty results to allow UI to show friendly message.
          return of([]);
        }
        return throwError(() => err);
      })
    );
  }
}
