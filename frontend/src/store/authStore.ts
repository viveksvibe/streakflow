import { create } from "zustand";
import toast from "react-hot-toast";
import {
  getCurrentUserApi,
  logoutApi,
  signInApi,
  signUpApi,
} from "../api/auth";

interface User {
  id: string;
  fullName: string;
  email: string;
  streakFreezeCredits: number;
  createdAt: string;
  timezone: string;
  avatarUrl?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  hydrateAuth: () => void;
  updateProfile: (data: FormData) => Promise<boolean>;
  googleLogin: (accessToken: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: localStorage.getItem("accessToken") || "",
  error: null,

  /* ================= LOGIN ================= */
  login: async (payload) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await signInApi(payload);
      const { user, tokens } = data.data;

      localStorage.setItem("accessToken", tokens.accessToken);

      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Login failed";
      toast.error(errorMsg);
      set({
        error: errorMsg,
        isLoading: false,
      });
      return false;
    }
  },

  /* ================= REGISTER ================= */
  register: async (payload) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await signUpApi(payload);
      const { user, tokens } = data.data;

      localStorage.setItem("accessToken", tokens.accessToken);

      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Registration successful!");
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      toast.error(errorMsg);
      set({
        error: errorMsg,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await logoutApi();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      localStorage.removeItem("accessToken");

      set({
        user: null,
        isAuthenticated: false,
        accessToken: "",
        error: null,
        isLoading: false,
      });
    }
  },

getCurrentUser: async () => {
  try {
    set({ isLoading: true });

    const latestToken = localStorage.getItem("accessToken") || "";
    if (!latestToken) {
      set({
        user: null,
        isAuthenticated: false,
        accessToken: "",
        isLoading: false,
      });
      return;
    }

    const { data } = await getCurrentUserApi();

    set({
      user: data.data,
      isAuthenticated: true,
      accessToken: latestToken,
      isLoading: false,
    });
  } catch (error) {
    localStorage.removeItem("accessToken");

    set({
      user: null,
      isAuthenticated: false,
      accessToken: "",
      isLoading: false,
    });
  }
  },

  hydrateAuth: () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      set({
        accessToken: token,
        isAuthenticated: true,
      });
    }
  },

  updateProfile: async (data: FormData) => {
    try {
      set({ isLoading: true });
      const { updateProfileApi } = await import("../api/auth");
      const res = await updateProfileApi(data);
      set({ user: res.data.data, isLoading: false });
      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Profile update failed";
      toast.error(errorMsg);
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  googleLogin: async (accessToken: string) => {
    try {
      set({ isLoading: true, error: null });
      const { googleLoginApi } = await import("../api/auth");
      const { data } = await googleLoginApi(accessToken);
      const { user, tokens } = data.data;

      localStorage.setItem("accessToken", tokens.accessToken);

      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Successfully logged in with Google!");
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Google Login failed";
      toast.error(errorMsg);
      set({
        error: errorMsg,
        isLoading: false,
      });
      return false;
    }
  }
}));