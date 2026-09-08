import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser as apiLogin, registerUser as apiRegister } from '../api/ApiClient';

const AuthContext = createContext(null);

const STORAGE_KEY = '@sipnbite_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setUser(JSON.parse(json));
      } catch (_) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveUser = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.data?.success && res.data?.data) {
      await saveUser(res.data.data);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (name, email, password, phone, address) => {
    const res = await apiRegister(name, email, password, phone, address);
    if (res.data?.success && res.data?.data) {
      await saveUser(res.data.data);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
