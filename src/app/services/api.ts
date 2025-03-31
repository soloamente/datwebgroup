import axios from "axios";

const api = axios.create({
  baseURL: "https://sviluppo.datasystemgroup.it/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export interface CreateViewerData {
  username: string;
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

export const userService = {
  createViewer: (data: CreateViewerData) => api.post("/create-viewer", data),
  createSharer: (data: CreateSharerData) => api.post("/create-sharer", data),
  changePassword: (data: ChangePasswordData) =>
    api.post("/change-password", data),
};
