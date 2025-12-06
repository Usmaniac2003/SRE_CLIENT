/**
 * JWT utility functions for decoding tokens on the client side
 * Note: This only decodes the payload, it does NOT verify the signature
 * Signature verification is done by the backend
 */

interface JwtPayload {
  sub: string; // employee id
  username: string;
  role: 'ADMIN' | 'CASHIER';
  iat?: number;
  exp?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded) as JwtPayload;

    // Check if token is expired
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }
  return payload.exp * 1000 < Date.now();
}

