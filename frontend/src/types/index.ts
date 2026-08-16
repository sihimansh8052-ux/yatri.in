export type UserRole = "traveler" | "tour_guide" | "hotel_owner" | "admin";

export interface UserPreferences {
  darkMode?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  country: string;
  state: string;
  city: string;
  profilePhoto?: string;
  provider: "local" | "google" | "facebook" | "github";
  isEmailVerified: boolean;
  language: string;
  preferences: UserPreferences;
  walletBalance: number;
  rewardPoints: number;
  referralCode: string;
  rating?: number;
  pricePerDay?: number;
  experience?: number;
  bio?: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Hotel {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  pricePerNight: number;
  rating: number;
  images: string[];
  amenities: string[];
  reviews?: Review[];
}

export interface Booking {
  _id: string;
  user: string | User;
  bookingType: "hotel" | "flight" | "train" | "bus" | "package" | "guide";
  hotel?: string | Hotel;
  guide?: string | User;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  durationDays?: number;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "success" | "failed";
  paymentId?: string;
  totalPrice: number;
  createdAt: string;
}
