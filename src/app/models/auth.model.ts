export interface UserLogin {
  id: number;
  sub: string;
  email: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserLogin | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  timestamp: string;
  data: {
    refreshToken: string;
    accessToken: string;
    userLogin: UserLogin;
  };
}
