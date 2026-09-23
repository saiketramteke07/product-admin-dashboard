import axiosInstance from "./axios";
import { AuthResponse, LoginCredentials } from "@/types/auth";

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    axiosInstance
      .post<AuthResponse>("/auth/login", credentials)
      .then((res) => res.data),
};
