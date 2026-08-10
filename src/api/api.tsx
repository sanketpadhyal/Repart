/** Single source of truth for the Repart backend URL. */
export const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || 'https://repart-backend.vercel.app').replace(/\/$/, '');

export const backendUrl = (path = '') => `${BACKEND_URL}/${String(path).replace(/^\//, '')}`;

export const apiFetch = (path, options) => fetch(backendUrl(path), options);
