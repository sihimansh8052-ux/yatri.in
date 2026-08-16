import api from "./api";
import { Hotel } from "../types";

export const hotelService = {
  async fetchHotels(params?: Record<string, unknown>): Promise<Hotel[]> {
    const { data } = await api.get<Hotel[]>("/hotels", { params });
    return data;
  },

  async getHotelById(id: string): Promise<Hotel> {
    const { data } = await api.get<Hotel>(`/hotels/${id}`);
    return data;
  }
};
