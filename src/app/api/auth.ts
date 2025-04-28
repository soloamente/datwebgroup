import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with the specified base URL
const api = axios.create({
  baseURL: "https://sviluppo.datasystemgroup.it/api",
  withCredentials: true, // Important for handling sessions/cookies
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
  isLoading: boolean; // To track loading states
  setAuth: (user: Partial<User>) => void;
  clearAuth: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  isAuthenticated: () => boolean;
  prelogin: (
    email: string,
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (
    email: string,
    otp: string,
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  loginAdmin: (
    username: string,
    password: string,
    otp: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      isLoading: false,
      setAuth: (user) => set({ user, error: null, isLoading: false }),
      clearAuth: () => set({ user: null, error: null, isLoading: false }),
      setError: (error) => set({ error, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      isAuthenticated: () => get().user !== null,

      prelogin: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/prelogin", {
            email: email.trim(),
            username: username.trim(),
            password: password.trim(),
          });
          console.log("Prelogin response:", response.data);
          set({ isLoading: false });
          // Assuming the API returns a success status or message
          // eslint-disable-next-line
          return { success: true, message: response.data?.message };
        } catch (error) {
          let message = "Errore durante la pre-autenticazione.";
          if (axios.isAxiosError(error)) {
            // eslint-disable-next-line
            message = error.response?.data?.message || message;
          }
          console.error("Prelogin error:", error);
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      verifyOtp: async (email, otp, username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/verify-otp", {
            email: email.trim(),
            otp: otp.trim(),
            username: username.trim(),
            password: password.trim(),
          });

          console.log("Verify OTP response:", response.data);

          // Assuming the user data is in response.data or response.data.user
          // eslint-disable-next-line
          const userData = response.data?.user || response.data;

          // eslint-disable-next-line
          if (userData && typeof userData === "object" && userData.id) {
            // eslint-disable-next-line
            set({ user: userData, error: null, isLoading: false });
            return { success: true };
          } else {
            // If login is successful but no user data, treat as error for frontend
            console.error(
              "Verify OTP: User data missing in response",
              response.data,
            );
            const message = "Dati utente non ricevuti dopo la verifica OTP.";
            set({ user: null, error: message, isLoading: false });
            return { success: false, message };
          }
        } catch (error) {
          let message = "Errore durante la verifica OTP.";
          if (axios.isAxiosError(error)) {
            // eslint-disable-next-line
            message = error.response?.data?.message || message;
          }
          console.error("Verify OTP error:", error);
          set({ user: null, error: message, isLoading: false });
          return { success: false, message };
        }
      },

      loginAdmin: async (username, password, otp) => {
        set({ isLoading: true, error: null });
        try {
          // First, start the authentication process with prelogin
          const preloginResponse = await api.post("/prelogin", {
            email: username.trim(),
            username: username.trim(),
            password: password.trim(),
          });
          // eslint-disable-next-line
          if (!preloginResponse.data.success) {
            // eslint-disable-next-line
            throw new Error(preloginResponse.data.message || "Prelogin failed");
          }

          // Then verify with OTP
          const verifyResponse = await api.post("/verify-otp", {
            username: username.trim(),
            email: username.trim(),
            password: password.trim(),
            otp: otp, // Using password as OTP
          });

          console.log("Admin Login response:", verifyResponse.data);

          // eslint-disable-next-line
          const userData = verifyResponse.data?.user || verifyResponse.data;

          // eslint-disable-next-line
          if (userData && typeof userData === "object" && userData.id) {
            // Check if the logged-in user is actually an admin
            // eslint-disable-next-line
            if (userData.role !== "admin") {
              const message =
                "Accesso negato. L'utente non è un amministratore.";
              set({ user: null, error: message, isLoading: false });
              return { success: false, message };
            }
            // Set auth state if login is successful and user is admin
            // eslint-disable-next-line
            set({ user: userData, error: null, isLoading: false });
            return { success: true };
          } else {
            console.error(
              "Admin Login: User data missing in response",
              verifyResponse.data,
            );
            const message = "Dati utente non ricevuti dopo il login.";
            set({ user: null, error: message, isLoading: false });
            return { success: false, message };
          }
        } catch (error) {
          let message = "Errore durante il login amministratore.";
          if (axios.isAxiosError(error)) {
            // eslint-disable-next-line
            message = error.response?.data?.message || message;
          }
          console.error("Admin Login error:", error);
          set({ user: null, error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/logout");
          // Clear user state regardless of API success/failure on logout
          set({ user: null, error: null, isLoading: false });
          // Also clear the cookie explicitly
          Cookies.remove("auth-storage", { path: "/" });
        } catch (error) {
          console.error("Logout error:", error);
          // Still clear user state even if API fails
          set({
            user: null,
            error: "Errore durante il logout.",
            isLoading: false,
          });
          Cookies.remove("auth-storage", { path: "/" });
          // Optionally re-throw or handle differently if needed
          // throw new Error("Logout failed");
        }
      },

      // Keep helper functions
      isAdmin: () => get().user?.role === "admin",
      hasRole: (role: string) => get().user?.role === role,
    }),
    {
      name: "auth-storage", // name of the item in storage (must be unique)
      storage: createJSONStorage(() => ({
        // Use js-cookie for storage
        getItem: (name) => Cookies.get(name) ?? null,
        setItem: (name, value) =>
          Cookies.set(name, value, { path: "/", expires: 7 }), // Example: cookie expires in 7 days
        removeItem: (name) => Cookies.remove(name, { path: "/" }),
      })),
      // Only persist specific parts of the state
      partialize: (state) => ({
        user: state.user
          ? {
              // Only store essential, non-sensitive user fields
              id: state.user.id,
              username: state.user.username,
              nominativo: state.user.nominativo,
              email: state.user.email,
              role: state.user.role,
              avatar: state.user.avatar,
            }
          : null,
        // Do not persist error or loading states
      }),
    },
  ),
);

export default useAuthStore;
