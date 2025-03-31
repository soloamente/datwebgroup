import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://sviluppo.datasystemgroup.it/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

interface User {
  id: number;
  username: string;
  nominativo: string;
  email: string;
  codice_fiscale: string | null;
  partita_iva: string | null;
  role: string;
  active: number;
  sharer_id: number | null;
  created_at: string;
  updated_at: string;
  must_change_password: number;
  avatar?: string;
}

interface AuthStore {
  user: Partial<User> | null;
  error: string | null;
  otpRequired: boolean;
  setAuth: (user: Partial<User>) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setOtpRequired: (required: boolean) => void;
  login: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ requiresOtp: boolean }>;
  verifyOtp: (
    username: string,
    email: string,
    password: string,
    otp: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      otpRequired: false,
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null, error: null }),
      isAuthenticated: () => get().user !== null,
      setOtpRequired: (required) => set({ otpRequired: required }),
      login: async (username: string, email: string, password: string) => {
        try {
          const response = await api.post("/prelogin", {
            username: username.trim(),
            email: email.trim(),
            password: password,
          });

          console.log("Login response:", response.data);

          if (response.data.message === "OTP inviato via email") {
            set({ otpRequired: true, error: null });
            return { requiresOtp: true };
          }

          if (response.data.user) {
            set({ user: response.data.user, error: null, otpRequired: false });
            return { requiresOtp: false };
          }

          throw new Error("Risposta non valida dal server");
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const message =
              error.response?.data?.message || "Errore durante il login";
            set({ user: null, error: message, otpRequired: false });
            throw new Error(message);
          }
          throw error;
        }
      },
      verifyOtp: async (username, email, password, otp) => {
        try {
          const response = await api.post("/verify-otp", {
            username,
            email,
            password,
            otp,
          });

          if (response.data.user) {
            set({ user: response.data.user, error: null });
          } else {
            throw new Error("Risposta non valida dal server");
          }
        } catch (error) {
          const errorMessage = "Errore durante la verifica OTP";
          set({ user: null, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      logout: async () => {
        try {
          await api.post("/logout");
          set({ user: null, error: null });
        } catch (error) {
          const errorMessage = "Errore durante il logout";
          set({ user: null, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      isAdmin: () => get().user?.role === "admin",
      hasRole: (role: string) => get().user?.role === role,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              username: state.user.username,
              nominativo: state.user.nominativo,
              email: state.user.email,
              role: state.user.role,
              avatar: state.user.avatar,
            }
          : null,
        error: state.error,
        otpRequired: state.otpRequired,
      }),
    },
  ),
);

export default useAuthStore;
