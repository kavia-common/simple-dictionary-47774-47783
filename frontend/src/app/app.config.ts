import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

// Bridge environment variable into a globally readable place without referencing window (SSR-safe).
try {
  const g: any = globalThis as any;
  if (g && typeof g === 'object') {
    // If the platform injects a processEnv-like object or direct value, mirror to NG_APP_API_BASE on globalThis.
    const envBase = g.NG_APP_API_BASE ?? (g.processEnv ? g.processEnv.NG_APP_API_BASE : undefined);
    if (envBase && !g.NG_APP_API_BASE) {
      g.NG_APP_API_BASE = envBase;
    }
  }
} catch {
  // ignore
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient()
  ]
};
