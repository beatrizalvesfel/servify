'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, LoginData, RegisterData } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const profile = await apiClient.getProfile();
        setUser(profile);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await apiClient.login(data);
      localStorage.setItem('auth_token', response.access_token);
      setUser(response.user);
      router.push('/app');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.register(data);
      localStorage.setItem('auth_token', response.access_token);
      setUser(response.user);
      router.push('/app');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('auth_token');
      setUser(null);
      router.push('/');
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
