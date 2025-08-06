/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

// Helper function to detect mobile devices
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

// Helper function to set cookie with consistent settings
const setAuthCookie = (cookieData: CookieStorage, expiresInDays = 30) => {
  const isMobile = isMobileDevice();
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  console.log("Setting cookie with settings:", {
    isMobile,
    isHttps,
    protocol:
      typeof window !== "undefined" ? window.location.protocol : "unknown",
  });

  Cookies.set("auth-storage", JSON.stringify(cookieData), {
    path: "/",
    expires: expiresInDays,
    secure: isHttps, // Only secure if HTTPS
    sameSite: isMobile ? "lax" : "strict", // Use "lax" for mobile to avoid issues
  });
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
  // Token-based authentication methods
  preloginByToken: (
    token: string,
  ) => Promise<{ success: boolean; message?: string; username?: string }>;
  verifyOtpByToken: (
    username: string,
    otp: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  verifyAndRestoreSession: () => boolean;
  checkSessionStatus: () => boolean;
  checkLaravelSession: () => {
    hasLaravelSession: boolean;
    hasXSRFToken: boolean;
    laravelSession: string | undefined;
    xsrfToken: string | undefined;
  };
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      isLoading: false,
      setAuth: (user) => {
        if (user?.id) {
          const cookieData: CookieStorage = {
            state: {
              user: user as User,
            },
          };
          setAuthCookie(cookieData, 30); // Set to 30 days
          set({ user, error: null, isLoading: false });
          console.log("Auth set successfully with user:", user);
        } else {
          console.log("setAuth called with invalid user data:", user);
          set({ user: null, error: null, isLoading: false });
        }
      },
      clearAuth: () => {
        Cookies.remove("auth-storage", { path: "/" });
        set({ user: null, error: null, isLoading: false });
      },
      setError: (error) => set({ error, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      isAuthenticated: () => {
        const cookie = Cookies.get("auth-storage");
        if (!cookie) return false;
        try {
          const data = JSON.parse(cookie) as CookieStorage;
          const hasUser = !!data.state?.user;

          // Also check for Laravel session cookies
          const laravelSession = document.cookie
            .split("; ")
            .find((row) => row.startsWith("laravel_session="));
          const xsrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="));

          console.log("Auth check - Has user:", hasUser);
          console.log("Auth check - Has Laravel session:", !!laravelSession);
          console.log("Auth check - Has XSRF token:", !!xsrfToken);

          return hasUser && !!laravelSession;
        } catch {
          return false;
        }
      },

      prelogin: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/prelogin", {
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
          const response = await api.post<VerifyOtpResponse>("/verify-otp", {
            email: email.trim(),
            otp: otp.trim(),
            username: username.trim(),
            password: password.trim(),
          });

          console.log("Verify OTP response:", response.data);
          console.log("Verify OTP response headers:", response.headers);

          // Check for Laravel session cookies in response headers
          const setCookieHeaders = response.headers["set-cookie"];
          if (setCookieHeaders) {
            console.log("Set-Cookie headers from response:", setCookieHeaders);

            // Parse and log Laravel session cookies
            setCookieHeaders.forEach((cookieHeader) => {
              if (cookieHeader.includes("laravel_session")) {
                console.log("Laravel session cookie found:", cookieHeader);
              }
              if (cookieHeader.includes("XSRF-TOKEN")) {
                console.log("XSRF token cookie found:", cookieHeader);
              }
            });
          }

          // Get max-age from response headers
          const maxAge = getMaxAgeFromResponse(response);
          console.log("Max age from response:", maxAge);

          // Update cookie expiration based on API response
          const userData = response.data.user;
          console.log("User data from response:", userData);

          if (userData && typeof userData === "object" && "id" in userData) {
            // Set auth cookie with max-age from API
            const cookieData: CookieStorage = {
              state: {
                user: userData,
              },
            };
            console.log("Setting auth cookie with data:", cookieData);
            setAuthCookie(cookieData, maxAge);

            // Verify cookie was set
            const verifyCookie = Cookies.get("auth-storage");
            console.log("Cookie after setting:", verifyCookie);

            // Check Laravel session cookies after login
            const laravelSession = document.cookie
              .split("; ")
              .find((row) => row.startsWith("laravel_session="));
            const xsrfToken = document.cookie
              .split("; ")
              .find((row) => row.startsWith("XSRF-TOKEN="));

            console.log("Laravel session after login:", !!laravelSession);
            console.log("XSRF token after login:", !!xsrfToken);

            set({ user: userData, error: null, isLoading: false });
            console.log("Auth state updated, user:", userData);

            // Double-check that the state was set correctly
            setTimeout(() => {
              const currentUser = get().user;
              console.log("Current user state after set:", currentUser);
              console.log(
                "Current cookie after set:",
                Cookies.get("auth-storage"),
              );
            }, 100);

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

      // Token-based authentication methods
      preloginByToken: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/prelogin-by-token", {
            params: { token },
          });

          console.log("Prelogin by token response:", response.data);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (response.data?.success === false) {
            set({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              error: response.data?.message || "Token non valido",
              isLoading: false,
            });
            return {
              success: false,
              message: response.data?.message || "Token non valido",
            };
          }

          set({ isLoading: false });
          return {
            success: true,
            message: response.data?.message,
            username: response.data?.username,
          };
        } catch (error) {
          let message = "Errore durante la validazione del token.";
          if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || message;
          }
          console.error("Prelogin by token error:", error);
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      verifyOtpByToken: async (username: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/verify-otp-by-token", {
            username: username.trim(),
            otp: otp.trim(),
          });

          console.log("Verify OTP by token response:", response.data);

          // Get max-age from response headers
          const maxAge = getMaxAgeFromResponse(response);

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
            set({ user: userData, error: null, isLoading: false });
            return { success: true };
          } else {
            console.error(
              "Verify OTP by token: User data missing in response",
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
          console.error("Verify OTP by token error:", error);
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

      // Method to verify and restore session from cookies
      verifyAndRestoreSession: () => {
        const cookie = Cookies.get("auth-storage");
        if (!cookie) return false;

        try {
          const data = JSON.parse(cookie) as CookieStorage;
          if (data.state?.user) {
            set({ user: data.state.user, error: null, isLoading: false });
            console.log("Session restored from cookie:", data.state.user);
            return true;
          }
        } catch (e) {
          console.error("Failed to restore session from cookie:", e);
        }
        return false;
      },

      // Method to check current session status
      checkSessionStatus: () => {
        const cookie = Cookies.get("auth-storage");
        console.log("Current auth-storage cookie:", cookie);

        if (cookie) {
          try {
            const data = JSON.parse(cookie) as CookieStorage;
            console.log("Parsed cookie data:", data);
            console.log("User in cookie:", data.state?.user);

            // Check Laravel session cookies
            const laravelSession = document.cookie
              .split("; ")
              .find((row) => row.startsWith("laravel_session="));
            const xsrfToken = document.cookie
              .split("; ")
              .find((row) => row.startsWith("XSRF-TOKEN="));

            console.log("Laravel session cookie:", !!laravelSession);
            console.log("XSRF token cookie:", !!xsrfToken);

            return !!data.state?.user && !!laravelSession;
          } catch (e) {
            console.error("Failed to parse current cookie:", e);
          }
        }
        return false;
      },

      // Method to check Laravel session cookies specifically
      checkLaravelSession: () => {
        const laravelSession = document.cookie
          .split("; ")
          .find((row) => row.startsWith("laravel_session="));
        const xsrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="));

        console.log("Laravel session check:", {
          hasLaravelSession: !!laravelSession,
          hasXSRFToken: !!xsrfToken,
          laravelSession: laravelSession,
          xsrfToken: xsrfToken,
        });

        return {
          hasLaravelSession: !!laravelSession,
          hasXSRFToken: !!xsrfToken,
          laravelSession,
          xsrfToken,
        };
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => Cookies.get(name) ?? null,
        setItem: (name, value) => {
          // Only set cookie if we have valid user data
          try {
            const parsedValue = JSON.parse(value);
            // Only persist if we have actual user data, not null
            if (parsedValue.user?.id) {
              const cookieData: CookieStorage = {
                state: {
                  user: parsedValue.user,
                },
              };
              setAuthCookie(cookieData, 30);
            }
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
