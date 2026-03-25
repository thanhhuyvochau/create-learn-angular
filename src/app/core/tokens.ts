import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

/**
 * Optional path suffix appended to API_BASE_URL to reach the resource (MinIO) server.
 * Empty string  → resource server is on the same root as the API (HTTP / dev).
 * Non-empty     → resource server is under a sub-path, e.g. "resources" (HTTPS / prod).
 */
export const RESOURCE_URL_SUFFIX = new InjectionToken<string>('RESOURCE_URL_SUFFIX');
