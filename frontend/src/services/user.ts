import api from "./api";
import { User, Booking } from "../types";

export interface DashboardResponse {
  role: string;
  welcome: string;
  stats: {
    upcomingTrips: number;
    wishlist: number;
    rewardPoints: number;
    walletBalance: number;
    notifications: number;
    hotelBookings: number;
  };
  bookings: {
    hotels: Booking[];
    guides: Booking[];
  };
  messages: Array<{ from: string; text: string }>;
  payments: Array<{ label: string; status: string; amount: number }>;
  template: {
    shortcuts: string[];
  };
  user: User;
}

export const userService = {
  async loadProfile(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async updateProfile(profile: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>("/users/profile", profile);
    return data;
  },

  async getDashboard(): Promise<DashboardResponse> {
    const { data } = await api.get<DashboardResponse>("/users/dashboard");
    return data;
  },

  async changePassword(payload: Record<string, string>): Promise<{ message: string }> {
    const { data } = await api.patch<{ message: string }>("/users/change-password", payload);
    return data;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>("/users/account");
    return data;
  }
};
