export const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

export const backendUrl = (path = '') => {
  const cleanPath = String(path).replace(/^\//, '');
  return BACKEND_URL ? `${BACKEND_URL}/${cleanPath}` : `/${cleanPath}`;
};

export const apiFetch = (path: string, options?: RequestInit) => fetch(backendUrl(path), options);
