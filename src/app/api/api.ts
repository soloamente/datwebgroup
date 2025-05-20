import axios, { AxiosError } from "axios";
import useAuthStore from "./auth";

const api = axios.create({
  baseURL: "https://sviluppo.datasystemgroup.it/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore.getState();
  if (authStore.isAuthenticated()) {
    // The token is automatically included in cookies due to withCredentials: true
    return config;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const authStore = useAuthStore.getState();
      // Clear auth state and redirect to login
      authStore.clearAuth();
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

export interface CreateViewerData {
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
}

export interface CreateSharerData {
  username: string;
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
}

export interface ChangePasswordData {
  password: string;
  password_confirmation: string;
}

export interface Sharer {
  id: number;
  username: string;
  nominativo: string;
  email: string;
  role: string;
  active: boolean;
  codice_fiscale?: string;
  partita_iva?: string;
  created_at: string;
  updated_at: string;
}

export interface Viewer {
  id: number;
  username: string;
  nominativo: string;
  email: string;
  role: string;
  active: boolean;
  sharer_id: number;
  codice_fiscale?: string;
  partita_iva?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSharerData {
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
}

export interface UpdateViewerData {
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
}

export interface UpdateViewerResponse {
  success: boolean;
  message: string;
  viewer: Viewer;
}

export interface SendUsernameByIdData {
  sharer_id: number;
}

const getSharers = async (): Promise<Sharer[]> => {
  const response = await api.get<Sharer[]>("/sharers");
  return response.data;
};

const toggleSharerStatus = async (id: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/sharers/${id}/toggle-status`,
  );
  return response.data;
};

const updateSharer = async (
  id: number,
  data: UpdateSharerData,
): Promise<{ message: string; sharer: Sharer }> => {
  const response = await api.put<{ message: string; sharer: Sharer }>(
    `/sharers/${id}`,
    data,
  );
  return response.data;
};

const getViewers = async (): Promise<Viewer[]> => {
  const response = await api.get<Viewer[]>("/viewers");
  return response.data;
};

const updateViewer = async (
  id: number,
  data: UpdateViewerData,
): Promise<UpdateViewerResponse> => {
  // TODO: Add authentication header if needed
  const response = await api.put<UpdateViewerResponse>(`/viewers/${id}`, data);
  return response.data;
};

const sendUsernameToSharerById = async (
  data: SendUsernameByIdData,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    "/send-username-to-sharer-by-id",
    data,
  );
  return response.data;
};

const toggleViewerStatus = async (id: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/viewers/${id}/toggle-status`,
  );
  return response.data;
};

export const userService = {
  createViewer: (data: CreateViewerData) => api.post("/create-viewer", data),
  createSharer: (data: CreateSharerData) => api.post("/create-sharer", data),
  changePassword: (data: ChangePasswordData) =>
    api.post("/change-password", data),
  getSharers,
  toggleSharerStatus,
  updateSharer,
  getViewers,
  updateViewer,
  sendUsernameToSharerById,
  toggleViewerStatus,
};
