import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios, { AxiosResponse } from "axios";
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

// Create a separate axios instance for authentication that doesn't use withCredentials
// This prevents server session cookies from interfering with our client-side auth
const authApi = axios.create({
  baseURL: "https://sviluppo.datasystemgroup.it/api",
  withCredentials: false, // Don't send/receive server session cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

interface ApiResponse<T> {
  data: T;
  headers: {
    "set-cookie"?: string[];
  };
}

interface ApiErrorResponse {
  message: string;
}

interface AuthState {
  state: {
    user: User | null;
  };
}

interface CookieStorage {
  state: {
    user: User | null;
  };
}

interface VerifyOtpResponse {
  user: User;
  success: boolean;
  message?: string;
}

// Helper function to get max-age from Set-Cookie header
const getMaxAgeFromResponse = (response: ApiResponse<unknown>): number => {
  const setCookieHeader = response.headers?.["set-cookie"]?.[0];
  if (!setCookieHeader) return 30; // Default to 30 days if no header found

  const maxAgeMatch = /Max-Age=(\d+)/.exec(setCookieHeader);
  if (maxAgeMatch?.[1]) {
    // Convert seconds to days
    const maxAgeInDays = Math.floor(
      parseInt(maxAgeMatch[1], 10) / (24 * 60 * 60),
    );
    // Ensure minimum of 7 days and maximum of 30 days
    return Math.max(7, Math.min(30, maxAgeInDays));
  }
  return 30; // Default to 30 days if no max-age found
};

// Helper function to set cookie with consistent settings
const setAuthCookie = (cookieData: CookieStorage, expiresInDays = 30) => {
  console.log(`Setting auth cookie with expiration: ${expiresInDays} days`);
  console.log("Cookie data:", JSON.stringify(cookieData, null, 2));

  Cookies.set("auth-storage", JSON.stringify(cookieData), {
    path: "/",
    expires: expiresInDays,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "lax", // Protect against CSRF
  });

  // Verify the cookie was set
  const savedCookie = Cookies.get("auth-storage");
  console.log("Saved cookie:", savedCookie);
};

// Helper function to check all cookies
const logAllCookies = () => {
  console.log("=== All Cookies ===");
  const allCookies = document.cookie;
  console.log("Document cookies:", allCookies);

  // Check our specific cookie
  const authCookie = Cookies.get("auth-storage");
  console.log("Auth storage cookie:", authCookie);

  // Check if there are any other session-related cookies
  const allCookieNames = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0]);
  console.log("All cookie names:", allCookieNames);
};

// Helper function to validate cookie persistence
const validateCookiePersistence = () => {
  console.log("=== Cookie Persistence Validation ===");

  // Check if our cookie exists
  const authCookie = Cookies.get("auth-storage");
  console.log("Auth cookie exists:", !!authCookie);

  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie) as CookieStorage;
      console.log("Cookie data valid:", !!parsed.state?.user);
      console.log("User in cookie:", parsed.state?.user?.username);

      // Check cookie expiration
      const cookieExpiry = Cookies.get("auth-storage");
      console.log("Cookie value:", cookieExpiry);
    } catch (e) {
      console.error("Error parsing cookie:", e);
    }
  }

  // Check all cookies
  const allCookies = document.cookie;
  console.log("All cookies:", allCookies);
};

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
  ) => Promise<{ success: boolean; message?: string; userEmail?: string }>;
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
      setAuth: (user) => {
        const cookieData: CookieStorage = {
          state: {
            user: user as User,
          },
        };
        setAuthCookie(cookieData, 30); // Set to 30 days
        logAllCookies(); // Log all cookies after setting
        validateCookiePersistence(); // Validate cookie persistence
        set({ user, error: null, isLoading: false });
      },
      clearAuth: () => {
        Cookies.remove("auth-storage", { path: "/" });
        set({ user: null, error: null, isLoading: false });
      },
      setError: (error) => set({ error, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      isAuthenticated: () => {
        const cookie = Cookies.get("auth-storage");
        console.log("Checking authentication, cookie:", cookie);
        if (!cookie) return false;
        try {
          const data = JSON.parse(cookie) as CookieStorage;
          const isAuth = !!data.state?.user;
          console.log("Authentication result:", isAuth);
          return isAuth;
        } catch (e) {
          console.error("Error parsing auth cookie:", e);
          return false;
        }
      },

      prelogin: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.post("/prelogin", {
            email: email.trim(),
            username: username.trim(),
            password: password.trim(),
          });
          console.log("Prelogin response:", response.data);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          console.log("Prelogin email from response:", response.data?.email);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          console.log("Prelogin user from response:", response.data?.user);

          set({ isLoading: false });
          // Check if the API response indicates success
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (response.data?.success === false) {
            set({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
              error: response.data?.message || "Login failed",
              isLoading: false,
            });

            return {
              success: false,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
              message: response.data?.message || "Login failed",
              userEmail: email.trim(), // Provide email in error case too
            };
          }
          // Otherwise consider it successful
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          return {
            success: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            message: response.data?.message,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            userEmail: response.data?.email || email.trim(), // Return email from response or fallback to input
          };
        } catch (error) {
          let message = "Errore durante la pre-autenticazione.";
          if (axios.isAxiosError(error)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
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
          const response = await authApi.post<VerifyOtpResponse>(
            "/verify-otp",
            {
              email: email.trim(),
              otp: otp.trim(),
              username: username.trim(),
              password: password.trim(),
            },
          );

          console.log("Verify OTP response:", response.data);
          console.log("Response headers:", response.headers);
          console.log("Set-Cookie headers:", response.headers["set-cookie"]);

          // Get max-age from response headers
          const maxAge = getMaxAgeFromResponse(response);
          console.log("Calculated max age from response:", maxAge, "days");

          // Update cookie expiration based on API response
          const userData = response.data.user;
          if (userData && typeof userData === "object" && "id" in userData) {
            // Set auth cookie with max-age from API
            const cookieData: CookieStorage = {
              state: {
                user: userData,
              },
            };
            setAuthCookie(cookieData, maxAge);
            logAllCookies(); // Log all cookies after setting
            validateCookiePersistence(); // Validate cookie persistence
            set({ user: userData, error: null, isLoading: false });
            return { success: true };
          } else {
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
          if (axios.isAxiosError(error) && error.response?.data) {
            const errorData = error.response.data as ApiErrorResponse;
            message = errorData.message || message;
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
          const preloginResponse = await authApi.post("/prelogin", {
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
          const verifyResponse = await authApi.post("/verify-otp", {
            username: username.trim(),
            email: username.trim(),
            password: password.trim(),
            otp: otp, // Using password as OTP
          });

          console.log("Admin Login response:", verifyResponse.data);

          // eslint-disable-next-line
          const userData = (verifyResponse.data?.user ||
            verifyResponse.data) as User;

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

            // Set auth cookie for admin login
            const cookieData: CookieStorage = {
              state: {
                user: userData,
              },
            };
            setAuthCookie(cookieData, 30);
            logAllCookies(); // Log all cookies after setting
            validateCookiePersistence(); // Validate cookie persistence

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
          await authApi.post("/logout");
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
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => Cookies.get(name) ?? null,
        setItem: (name, value) => {
          // Always use consistent cookie settings
          try {
            const parsedValue = JSON.parse(value) as CookieStorage;
            setAuthCookie(parsedValue, 30);
          } catch (e) {
            console.error("Error parsing cookie value:", e);
          }
        },
        removeItem: (name) => Cookies.remove(name, { path: "/" }),
      })),
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              username: state.user.username,
              nominativo: state.user.nominativo,
              email: state.user.email,
              role: state.user.role,
              avatar: state.user.avatar,
              must_change_password: state.user.must_change_password,
            }
          : null,
      }),
    },
  ),
);

export default useAuthStore;
