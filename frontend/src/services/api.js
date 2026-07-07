const API_BASE = 'http://localhost:4001/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer demo-token',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchDashboardSummary() {
  return request('/dashboard/summary');
}

export async function fetchCollection(collection) {
  return request(`/${collection}`);
}

export async function createItem(collection, payload) {
  return request(`/${collection}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateItem(collection, id, payload) {
  return request(`/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteItem(collection, id) {
  return request(`/${collection}/${id}`, {
    method: 'DELETE',
  });
}
