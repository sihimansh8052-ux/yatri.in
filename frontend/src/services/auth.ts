import api from "./api";
import { User } from "../types";

export interface AuthResponse extends User {
  token: string;
  refreshToken?: string;
  devOtp?: string;
  message?: string;
}

export const authService = {
  async login(payload: Record<string, unknown>): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async signup(payload: Record<string, unknown>): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/signup", payload);
    return data;
  },

  async verifyOtp(payload: Record<string, unknown>): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/auth/email-otp/verify", payload);
    return data;
  },

  async requestOtp(email: string): Promise<{ devOtp?: string; message: string }> {
    const { data } = await api.post<{ devOtp?: string; message: string }>("/auth/email-otp/request", { email });
    return data;
  },

  async googleSignIn(payload: Record<string, unknown>): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/google", payload);
    return data;
  }
};
