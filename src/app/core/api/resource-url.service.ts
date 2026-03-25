import { inject, Injectable } from '@angular/core';

import { API_BASE_URL, RESOURCE_URL_SUFFIX } from '../tokens';

/**
 * Service that resolves the base URL for the resource server (MinIO).
 *
 * Protocol detection strategy (build-time):
 *   - HTTP  (dev build)  → environment.resourceUrl is '' → base URL = apiBaseUrl
 *   - HTTPS (prod build) → environment.resourceUrl is 'resources' → base URL = apiBaseUrl/resources
 *
 * At runtime, window.location.protocol is checked as an additional safety guard
 * and a console warning is emitted when a mismatch is detected.
 */
@Injectable({ providedIn: 'root' })
export class ResourceUrlService {
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly resourceUrlSuffix = inject(RESOURCE_URL_SUFFIX);

  /**
   * Returns the base URL of the resource (MinIO) server for the current environment.
   *
   * HTTP  → `http://localhost:8080`         (dev, suffix = '')
   * HTTPS → `https://<host>/resources`      (prod, suffix = 'resources')
   */
  getResourceBaseUrl(): string {
    const isHttps = window.location.protocol === 'https:';
    const base = this.apiBaseUrl.replace(/\/$/, '');

    // Warn when the runtime protocol does not match the compiled environment
    if (isHttps && base.startsWith('http://')) {
      console.warn(
        '[ResourceUrlService] Page is served over HTTPS but the resource base URL uses HTTP. ' +
        'Ensure the production build is deployed for HTTPS environments.',
      );
    }

    if (!isHttps && base.startsWith('https://')) {
      console.warn(
        '[ResourceUrlService] Page is served over HTTP but the resource base URL uses HTTPS.',
      );
    }

    const suffix = this.resourceUrlSuffix ? this.resourceUrlSuffix.replace(/^\/|\/$/g, '') : '';
    return suffix ? `${base}/${suffix}` : base;
  }

  /**
   * Builds a full URL for the given resource path.
   *
   * @param path - Relative path of the resource, e.g. `'images/photo.jpg'` or `'/images/photo.jpg'`
   * @returns Full URL, e.g. `'http://localhost:8080/images/photo.jpg'`
   */
  buildUrl(path: string): string {
    if (!path) {
      return '';
    }

    // Return as-is if path is already an absolute URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const base = this.getResourceBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
}
