const apiBase = import.meta.env.VITE_API_URL || '';
const API_URL = `${apiBase}/api/v1`;

export async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An error occurred');
  }

  return response.json();
}

export async function loginRequestOTP(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
}

export async function verifyOTPRequest(username: string, otp_code: string) {
  return apiRequest('/auth/verify-otp', 'POST', {
    username,
    otp_code,
    purpose: 'LOGIN'
  });
}

export async function getLots(token: string) {
  return apiRequest('/lots', 'GET', undefined, token);
}

export async function createLot(data: any, token: string) {
  return apiRequest('/lots', 'POST', data, token);
}

export async function updateLotQC(lotId: string, data: any, token: string) {
  return apiRequest(`/lots/${lotId}/qc`, 'PATCH', data, token);
}

export async function updateLotWarehouse(lotId: string, data: any, token: string) {
  return apiRequest(`/lots/${lotId}/warehouse`, 'PATCH', data, token);
}
