import apiClient from '../../api/client';
import type { LoginRequest, LoginResponse } from '../../types/auth';

export const loginUser = async (credentials: LoginRequest): Promise<string> => {
  const response = await apiClient.post<any>('/Auth/login-user', credentials);
  const data = response.data;
  
  // استخراج التوكن سواء كان الـ API يعيده كـ token أو accessToken أو نص مباشر
  const token = data?.token || data?.accessToken || data?.tokenString || (typeof data === 'string' ? data : null);
  
  if (!token) {
    throw new Error('لم يتم استلام رمز التحقق (Token) من الخادم');
  }

  localStorage.setItem('kayan_token', token);
  return token;
};

export const logoutUser = (): void => {
  localStorage.removeItem('kayan_token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('kayan_token');
};
