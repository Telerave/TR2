const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  createSession: `${API_BASE_URL}/api/session`,
  getCurrentTrack: (sessionId) => `${API_BASE_URL}/api/track/${sessionId}`,
  getNextTrack: (sessionId) => `${API_BASE_URL}/api/track/${sessionId}/next`,
  getPrevTrack: (sessionId) => `${API_BASE_URL}/api/track/${sessionId}/prev`,
};

export const AUDIO_BASE_URL = API_BASE_URL; 