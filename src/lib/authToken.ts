const TOKEN_KEY = 'superior_auth_token';

export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === 'none') return null;
  return token;
}

export function setAuthToken(token: string | null | undefined): void {
  if (token && token !== 'none') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
