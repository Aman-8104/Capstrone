/**
 * SmartSurplus API Client
 * Handles all backend API calls with JWT token management.
 */

const API_BASE = 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smartsurplus_token');
}

export function setToken(token: string) {
  localStorage.setItem('smartsurplus_token', token);
}

export function clearToken() {
  localStorage.removeItem('smartsurplus_token');
  localStorage.removeItem('smartsurplus_user');
}

export function setUser(user: any) {
  localStorage.setItem('smartsurplus_user', JSON.stringify(user));
}

export function getUser(): any {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('smartsurplus_user');
  return u ? JSON.parse(u) : null;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    let errorMsg = err.detail || 'Request failed';
    if (Array.isArray(err.detail)) {
      errorMsg = err.detail.map((e: any) => `${e.loc?.join('.')} ${e.msg}`).join(', ');
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// Auth
export const api = {
  register: (data: any) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request('/login', { method: 'POST', body: JSON.stringify(data) }),

  // Provider
  uploadFoodData: (data: any) => {
    const payload = {
      food_type: data.food_type,
      quantity_kg: Number(data.quantity_prepared || data.quantity_kg || 0),
      expiry_hours: Number(data.shelf_life_hours || data.expiry_hours || 6),
      meal_type: data.meal_type,
      event_type: data.event_nearby ? 'local_event' : null,
      notes: `Weather: ${data.weather || 'unknown'}`
    };
    return request('/food-data', { method: 'POST', body: JSON.stringify(payload) });
  },
  getFoodData: () => request('/food-data'),
  getPredictions: () => request('/predictions'),
  runPrediction: () => request('/predict', { method: 'POST' }),

  // NGO
  getNgoMatches: () => request('/ngo/matches'),
  acceptMatch: (matchId: string, action: string) =>
    request('/ngo/accept', { method: 'POST', body: JSON.stringify({ match_id: matchId, action }) }),
  confirmDelivery: (matchId: string, qty: number, notes?: string) =>
    request('/ngo/confirm', { method: 'POST', body: JSON.stringify({ match_id: matchId, quantity_received_kg: qty, notes }) }),

  // Admin
  getStats: () => request('/admin/stats'),
  getAllUsers: () => request('/admin/users'),
  getLogs: () => request('/admin/logs'),
  getAllPredictions: () => request('/admin/predictions'),
  getAllMatches: () => request('/admin/matches'),
  getAllFoodData: () => request('/admin/food-data'),

  // Map
  getProviderMarkers: () => request('/map/providers'),
  getNgoMarkers: () => request('/map/ngos'),
  getHotspots: () => request('/map/hotspots'),

  // Distance & Matching (no auth required)
  getDemoMatch: () => request('/matching/demo'),
  matchWithDb: (data: { provider_id: string; food_type?: string; food_quantity: number; expiry_hours?: number; max_distance_km?: number; top_n?: number; prediction_id?: string }) => 
    request('/matching/match', { method: 'POST', body: JSON.stringify(data) }),
  runMatchRaw: (data: {
    provider: { provider_id: string; latitude: number; longitude: number; food_quantity: number; expiry_hours: number };
    ngos: { ngo_id: string; latitude: number; longitude: number; capacity: number; name?: string }[];
    max_distance_km?: number;
    top_n?: number;
  }) => request('/matching/match-raw', { method: 'POST', body: JSON.stringify(data) }),
  getDistanceMatrix: (data: {
    provider: { provider_id: string; latitude: number; longitude: number; food_quantity: number; expiry_hours: number };
    ngos: { ngo_id: string; latitude: number; longitude: number; capacity: number; name?: string }[];
    max_distance_km?: number;
    top_n?: number;
  }) => request('/matching/distance-matrix', { method: 'POST', body: JSON.stringify(data) }),
  getPointDistance: (lat1: number, lon1: number, lat2: number, lon2: number) =>
    request(`/matching/distance?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`),
};
