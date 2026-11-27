import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('resumeiq_user') || 'null'));

  const save = (data) => {
    // If the API URL is wrong, the server returns HTML instead of JSON – catch that clearly
    if (!data || typeof data !== 'object' || !data.token) {
      throw new Error('Cannot reach the backend API. Check VITE_API_URL on the frontend.');
    }
    localStorage.setItem('resumeiq_user', JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (name, email, password) =>
    save((await api.post('/auth/register', { name, email, password })).data);
  const logout = () => {
    localStorage.removeItem('resumeiq_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
