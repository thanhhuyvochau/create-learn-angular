import type { UserLogin, ApiFilters } from '../../models';

/**
 * Parse a JWT token and return its payload
 */
export function parseJwt(token: string): Record<string, unknown> {
  const base64Url = token.split('.')[1];
  if (!base64Url) throw new Error('Invalid JWT');
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + (c.codePointAt(0) ?? 0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

/**
 * Decode the access token and return the user payload
 */
export function decodeAccessTokenUser(token: string): UserLogin | null {
  try {
    const payload = parseJwt(token);
    const user: UserLogin = {
      id: Number(payload['sub'] ?? payload['userId'] ?? 0),
      sub: String(payload['sub'] ?? ''),
      email: String(payload['email'] ?? ''),
      role: payload['role'] as string | undefined,
      exp: payload['exp'] as number | undefined,
      iat: payload['iat'] as number | undefined,
    };
    return user;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired based on its exp claim
 */
export function isExpired(exp?: number): boolean {
  return typeof exp === 'number' && exp * 1000 < Date.now();
}

/**
 * Build a query string from an ApiFilters object
 */
export function buildQueryString(
  filters?: ApiFilters | Record<string, string | number | boolean | object | Date | undefined>
): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Storage keys for auth tokens
 */
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_SNAPSHOT_KEY = 'auth:snapshot';

/**
 * Get stored access token from localStorage
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Set access token in localStorage
 */
export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get stored refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Set refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Remove all auth tokens from localStorage
 */
export function removeTokens(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get auth headers with Bearer token
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
