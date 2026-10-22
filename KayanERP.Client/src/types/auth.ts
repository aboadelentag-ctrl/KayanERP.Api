export interface LoginRequest {
  companyId: number;
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  tokenString?: string;
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
  message?: string;
}
