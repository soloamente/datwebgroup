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
  logo?: File;
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
  logo_url: string;
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
  logo_url: string;
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

export interface ExtractedInfo {
  nominativo: string | null;
  codice_fiscale: string | null;
}

// Define response types for the new functions
export interface CheckUsernameResponse {
  exists: boolean;
  role: string | null;
  message?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// New interfaces for Document Classes
export interface DocumentClassField {
  id: number;
  nome: string;
  label: string;
  tipo: string; // e.g., 'text', 'number', 'date'
  obbligatorio: boolean;
  is_primary_key: boolean;
  sort_order: number;
  options?: { id?: number; value: string; label: string }[] | null;
}

export interface DocumentClass {
  id: number;
  nome: string;
  descrizione: string;
  logo_url: string | null;
  campi: DocumentClassField[];
  sharers: Sharer[] | null; // Changed to allow null
  created_at: string;
  updated_at: string;
}

// --- Copied & adapted types for single document class API response ---
interface ApiDocumentClassField {
  id: number;
  name: string;
  label: string;
  data_type: string;
  required: number;
  is_primary_key: number;
  sort_order: number;
  options?: { id?: number; value: string; label: string }[] | null;
}

interface ApiDocumentClass {
  id: number;
  name: string;
  description: string;
  created_by: string;
  sharers_count: number;
  sharers: Sharer[]; // Using existing Sharer type
  fields: ApiDocumentClassField[];
  created_at?: string;
  updated_at?: string;
}

interface ApiResponseSingle {
  message: string;
  data: ApiDocumentClass; // Single ApiDocumentClass object
}
// --- End of copied types ---

// --- Inizio Tipi per Shared Batches ---

export interface SharerInfo {
  id: number;
  nominativo: string;
  email: string;
  logo_url: string;
}

export interface ViewerInfo {
  id: number;
  nominativo: string;
  email: string;
  codice_fiscale?: string;
  partita_iva?: string;
}

export interface AttachedFile {
  id: number;
  original_filename: string;
  mime_type: string;
  size: number;
}

export interface SharedDocument {
  id: number;
  metadata: Record<string, string | number | boolean | null>;
  files: AttachedFile[];
}

export interface SharedBatch {
  id: number;
  title: string;
  status: string;
  sent_at: string;
  viewers: ViewerInfo[];
  documents: SharedDocument[];
}

export interface BatchDocumentClassField {
  id: number;
  name: string;
  label: string;
  data_type: string;
  required: number;
  is_primary_key: number;
  options: { value: string; label: string }[];
}

export interface DocumentClassDetails {
  id: number;
  name: string;
  logo_url: string;
  fields: BatchDocumentClassField[];
}

export interface GetSharedBatchesResponse {
  message: string;
  data: SharedBatch[];
  document_class: DocumentClassDetails;
  sharer: SharerInfo;
}

export interface AvailableViewersResponse {
  viewers: ViewerInfo[];
}

export interface SharedBatchDetails extends SharedBatch {
  document_class: DocumentClassDetails;
}

// --- Fine Tipi per Shared Batches ---

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

// New function to check username
const checkUsername = async (
  username: string,
): Promise<CheckUsernameResponse> => {
  const response = await api.post<CheckUsernameResponse>("/check-username", {
    username,
  });
  return response.data;
};

// New function to reset password by username
const resetPasswordByUsername = async (
  username: string,
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>(
    "/reset-password-by-username",
    { username },
  );
  return response.data;
};

// New function to get document classes
export const getDocumentClasses = async (): Promise<DocumentClass[]> => {
  const response = await api.get<DocumentClass[]>("/document-classes");
  return response.data;
};

export const getDocumentClassById = async (
  id: number,
): Promise<ApiResponseSingle> => {
  const response = await api.get<ApiResponseSingle>(`/document-classes/${id}`);
  return response.data;
};

// Interface for delete enum option response
export interface DeleteEnumOptionResponse {
  message: string;
  requires_confirmation?: boolean;
}

// New function to delete an enum option from a document class field
const deleteEnumOption = async (
  fieldId: number,
  optionId: number,
  force?: boolean,
): Promise<DeleteEnumOptionResponse> => {
  const response = await api.delete<DeleteEnumOptionResponse>(
    `/document-class-fields/${fieldId}/options/${optionId}`,
    {
      params: { force },
    },
  );
  return response.data;
};

// Interface for add enum option response
export interface AddEnumOptionResponse {
  message: string;
  data: {
    id: number;
    value: string;
    label: string;
  };
}

// New function to add an enum option to a document class field
const addEnumOption = async (
  fieldId: number,
  label: string,
): Promise<AddEnumOptionResponse> => {
  const response = await api.post<AddEnumOptionResponse>(
    `/document-class-fields/${fieldId}/options`,
    { label },
  );
  return response.data;
};

// --- Inizio Funzione per Recupero Documenti Condivisi ---

export const getSharedBatchesByDocumentClass = async (
  document_class_id: number,
): Promise<GetSharedBatchesResponse> => {
  const response = await api.get<GetSharedBatchesResponse>(
    `/document-classes/${document_class_id}/shared-batches`,
  );
  return response.data;
};

// --- Fine Funzione per Recupero Documenti Condivisi ---

// Interface for add field request
export interface AddDocumentClassFieldRequest {
  name: string;
  label: string;
  data_type:
    | "boolean"
    | "integer"
    | "decimal"
    | "string"
    | "date"
    | "datetime"
    | "enum";
  required?: boolean;
  is_primary?: boolean;
  sort_order?: number;
  options?: Array<{
    value: string;
    label: string;
  }>;
}

// Interface for add field response
export interface AddDocumentClassFieldResponse {
  message: string;
  data: DocumentClassField;
}

// Interface for delete field response
export interface DeleteFieldResponse {
  message: string;
  requires_confirmation?: boolean;
}

// Interface for user response
export interface UserResponse {
  user: {
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
    must_change_password: number;
  };
}

// Function to get authenticated user
const getUser = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>("/user");
  return response.data;
};

// Interface for update field request
export interface UpdateDocumentClassFieldRequest {
  label?: string;
  required?: boolean;
  is_primary?: boolean;
  sort_order?: number;
}

// Interface for update field response
export interface UpdateDocumentClassFieldResponse {
  message: string;
  data: DocumentClassField;
}

// Interface for update field error responses
export interface UpdateFieldConflictResponse {
  message: string; // e.g., "Esiste già una primary key per questa classe documentale." or "Non puoi rendere obbligatorio questo campo: esistono documenti senza valore per questo campo."
}

export interface UpdateFieldNotFoundResponse {
  message: string; // e.g., "Campo o classe documentale non trovata."
}

export interface UpdateFieldValidationResponse {
  message: string; // e.g., "The given data was invalid."
  errors: Record<string, string[]>;
}

// Interface for assign sharer request
export interface AssignSharerRequest {
  sharer_id: number;
}

// Interface for assign sharer response
export interface AssignSharerResponse {
  message: string;
  data?: {
    document_class: DocumentClass;
    sharers: Sharer[];
  };
}

// Interface for remove sharer response
export interface RemoveSharerResponse {
  message: string;
}

// Interface for available sharers response
export interface AvailableSharersResponse {
  message: string;
  data: Sharer[];
}

export interface RecoverUsernameResponse {
  success: boolean;
  message?: string;
}

// New function to recover username by email
const recoverUsername = async (
  email: string,
): Promise<RecoverUsernameResponse> => {
  const response = await api.post<RecoverUsernameResponse>(
    "/recover-username-by-email",
    {
      email,
    },
  );
  return response.data;
};

// --- Add interface for update document class request/response ---
export interface UpdateDocumentClassRequest {
  nome: string;
  descrizione: string;
}

export interface UpdateDocumentClassResponse {
  message: string;
  data: DocumentClass;
}

// Interfaces for my-document-classes endpoint (for sharers)
export interface MyDocumentClassFieldOption {
  id: number;
  value: string;
  label: string;
}

export interface MyDocumentClassField {
  id: number;
  name: string;
  label: string;
  data_type:
    | "string"
    | "integer"
    | "boolean"
    | "decimal"
    | "date"
    | "datetime"
    | "enum";
  required: 0 | 1;
  is_primary_key: 0 | 1;
  sort_order: number;
  options: MyDocumentClassFieldOption[] | null;
}

export interface MyDocumentClass {
  id: number;
  name: string;
  description: string | null;
  fields: MyDocumentClassField[];
}

export interface GetMyDocumentClassesResponse {
  message: string;
  data: MyDocumentClass[];
}

// --- Nuove interfacce per recovery-username-request ---
export interface RecoveryUsernameRequestData {
  ragione_sociale: string;
  email: string;
}

export interface RecoveryUsernameRequestResponse {
  success: boolean;
  message?: string;
}

// --- Funzione per recovery-username-request ---
const recoveryUsernameRequest = async (
  data: RecoveryUsernameRequestData,
): Promise<RecoveryUsernameRequestResponse> => {
  const response = await api.post<RecoveryUsernameRequestResponse>(
    "/recovery-username-request",
    data,
  );
  return response.data;
};

// Function to update a document class by ID
export interface UpdateDocumentClassApiRequest {
  name: string;
  description: string;
}

const updateDocumentClass = async (
  id: number,
  data: UpdateDocumentClassApiRequest,
): Promise<UpdateDocumentClassResponse> => {
  const response = await api.put<UpdateDocumentClassResponse>(
    `/document-classes/${id}`,
    data,
  );
  return response.data;
};

/**
 * Request type for creating a document class
 * - name: required
 * - description: optional
 * - logo: optional
 */
export interface CreateDocumentClassRequest {
  name: string; // obbligatorio
  description?: string; // facoltativo
  logo?: File | null; // facoltativo
}

/**
 * Response type for creating a document class
 */
export interface CreateDocumentClassResponse {
  message: string;
  data?: DocumentClass;
  errors?: Record<string, string[]>; // For validation errors
}

/**
 * Creates a new document class via POST /document-classes
 * @param data - The document class data (name required, description optional, logo optional)
 * @returns Promise<CreateDocumentClassResponse>
 * @throws {AxiosError} - Surfaces API error messages for validation
 */
const createDocumentClass = async (
  data: CreateDocumentClassRequest,
): Promise<CreateDocumentClassResponse> => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.description) {
    formData.append("description", data.description);
  }
  if (data.logo) {
    formData.append("logo", data.logo);
  }

  try {
    const response = await api.post<CreateDocumentClassResponse>(
      "/document-classes",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      type ErrorData = {
        message?: string;
        error?: string;
        errors?: Record<string, string[]>;
      };

      function isErrorData(obj: unknown): obj is ErrorData {
        return (
          typeof obj === "object" &&
          obj !== null &&
          ("message" in obj || "error" in obj || "errors" in obj)
        );
      }

      if (isErrorData(error.response?.data)) {
        const responseData = error.response.data;
        return {
          message:
            responseData.message ??
            responseData.error ??
            "Errore di validazione.",
          errors: responseData.errors,
        };
      }
    }
    // Fallback per altri tipi di errori
    return {
      message: "An unexpected error occurred.",
    };
  }
};

const createViewer = async (
  data: CreateViewerData,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<Blob>("/create-viewer", data, {
    responseType: "blob",
    validateStatus: (status) => status < 500,
  });

  if (response.status === 200 && response.data.type === "application/pdf") {
    const contentDisposition = response.headers["content-disposition"] as
      | string
      | undefined;
    let filename = `credenziali_${data.nominativo.replace(/\s+/g, "_").toLowerCase()}.pdf`;
    if (contentDisposition) {
      const filenameMatch = /filename="?(.+)"?/i.exec(contentDisposition);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Credenziali viewer generate e download avviato.",
    };
  } else {
    const errorText = await response.data.text();
    const errorJson = JSON.parse(errorText) as {
      message?: string;
      error?: string;
    };

    const error = new AxiosError(
      errorJson.message ?? "Errore nella creazione del viewer.",
      String(response.status), // code
    );
    error.response = {
      ...response,
      data: errorJson,
      config: response.config,
      headers: response.headers,
    };
    throw error;
  }
};

const resetViewerPassword = async (
  viewerId: number,
  viewerName: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<Blob>(
    `/viewers/${viewerId}/reset-password`,
    null,
    {
      responseType: "blob",
      validateStatus: (status) => status < 500,
    },
  );

  if (response.status === 200 && response.data.type === "application/pdf") {
    const contentDisposition = response.headers["content-disposition"] as
      | string
      | undefined;
    let filename = `credenziali_aggiornate_${viewerName
      .replace(/\s+/g, "_")
      .toLowerCase()}.pdf`;
    if (contentDisposition) {
      const filenameMatch = /filename="?(.+)"?/i.exec(contentDisposition);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Password resettata e credenziali scaricate con successo.",
    };
  } else {
    const errorText = await response.data.text();
    const errorJson = JSON.parse(errorText) as {
      message?: string;
      error?: string;
    };

    const error = new AxiosError(
      errorJson.message ?? "Errore nel reset della password del viewer.",
      String(response.status), // code
    );
    error.response = {
      ...response,
      data: errorJson,
      config: response.config,
      headers: response.headers,
    };
    throw error;
  }
};

const downloadViewerCredentials = async (
  viewerId: number,
  viewerName: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.get<Blob>(`/viewers/${viewerId}/print-pdf`, {
    responseType: "blob",
    validateStatus: (status) => status < 500,
  });

  if (response.status === 200 && response.data.type === "application/pdf") {
    const contentDisposition = response.headers["content-disposition"] as
      | string
      | undefined;
    let filename = `credenziali_${viewerName
      .replace(/\s+/g, "_")
      .toLowerCase()}.pdf`;
    if (contentDisposition) {
      const filenameMatch = /filename="?(.+)"?/i.exec(contentDisposition);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Credenziali viewer scaricate con successo.",
    };
  } else {
    const errorText = await response.data.text();
    const errorJson = JSON.parse(errorText) as {
      message?: string;
      error?: string;
    };

    const error = new AxiosError(
      errorJson.message ?? "Errore nello scaricare le credenziali del viewer.",
      String(response.status), // code
    );
    error.response = {
      ...response,
      data: errorJson,
      config: response.config,
      headers: response.headers,
    };
    throw error;
  }
};

const sendViewerCredentialsByEmail = async (
  viewerId: number,
): Promise<{ message: string }> => {
  const response = await api.get<{ message: string }>(
    `/viewers/send-pdf-email/${viewerId}`,
  );
  return response.data;
};

const extractInfoFromDocument = async (
  documento_1: File,
  documento_2?: File,
): Promise<ExtractedInfo> => {
  const formData = new FormData();
  formData.append("documento_1", documento_1);
  if (documento_2) {
    formData.append("documento_2", documento_2);
  }

  const response = await api.post<ExtractedInfo>(
    "/viewers/extract-info-from-document",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

/**
 * Recupera le classi documentali per lo sharer autenticato.
 * Endpoint: GET /my-document-classes
 * @returns {Promise<GetMyDocumentClassesResponse>}
 */
export const getMyDocumentClasses =
  async (): Promise<GetMyDocumentClassesResponse> => {
    const response = await api.get<GetMyDocumentClassesResponse>(
      "/my-document-classes",
    );
    return response.data;
  };

export const getAvailableViewersForBatch = async (
  batchId: number,
): Promise<AvailableViewersResponse> => {
  const response = await api.get<AvailableViewersResponse>(
    `/share-batches/${batchId}/available-viewers`,
  );
  return response.data;
};

export const attachViewerToBatch = async (
  batchId: number,
  viewerId: number,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/share-batches/${batchId}/attach-viewer`,
    {
      viewer_id: viewerId,
    },
  );
  return response.data;
};

export const getSharedBatchById = async (
  batchId: number,
): Promise<SharedBatchDetails> => {
  const response = await api.get<SharedBatchDetails>(
    `/share-batches/${batchId}`,
  );
  return response.data;
};

/**
 * Removes a document from a shared batch.
 * @param batchId The ID of the batch.
 * @param fileId The ID of the document to remove.
 * @returns A promise with a success message.
 */
export const removeDocumentFromBatch = async (
  batchId: number,
  fileId: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/share-batches/${batchId}/documents/${fileId}`,
  );
  return response.data;
};

/**
 * Downloads a shared file by its ID.
 * Triggers a file download in the browser.
 * @param fileId - The ID of the file to download.
 * @param originalFilename - A fallback filename if Content-Disposition is not available.
 * @returns Promise<{ success: boolean; message: string }>
 * @throws {AxiosError} - Throws on API errors (e.g., 403, 404).
 */
export const downloadSharedFile = async (
  fileId: number,
  originalFilename: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.get<Blob>(`/files/${fileId}/download`, {
    responseType: "blob",
    validateStatus: (status) => status < 500,
  });

  if (response.status === 200) {
    const contentDisposition = response.headers["content-disposition"] as
      | string
      | undefined;
    let filename = originalFilename;
    if (contentDisposition) {
      const filenameMatch = /filename="?(.+)"?/i.exec(contentDisposition);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Download del file avviato.",
    };
  } else {
    const errorText = await response.data.text();
    const errorJson = (() => {
      try {
        // Attempt to parse as JSON
        return JSON.parse(errorText) as { message?: string; error?: string };
      } catch {
        // If parsing fails, return an empty object
        return {};
      }
    })();

    let errorMessage = "Errore durante il download del file.";
    if (response.status === 404) {
      errorMessage = "File non trovato o non più disponibile.";
    } else if (response.status === 403) {
      errorMessage = "Non hai i permessi per scaricare questo file.";
    } else if (errorJson.message || errorJson.error) {
      errorMessage =
        errorJson.message ?? errorJson.error ?? "Errore sconosciuto.";
    }

    const error = new AxiosError(
      errorMessage,
      String(response.status), // code
    );
    error.response = {
      ...response,
      data: errorJson,
      config: response.config,
      headers: response.headers,
    };
    throw error;
  }
};

/**
 * Response for adding files to a document.
 */
export interface AddFilesToDocumentResponse {
  message: string;
  files: AttachedFile[];
}

/**
 * Adds one or more files to an existing document within a shared batch.
 * @param batchId The ID of the batch.
 * @param documentId The ID of the document.
 * @param files The files to upload.
 * @returns A promise with a success message and the details of the uploaded files.
 */
export const addFilesToDocument = async (
  batchId: number,
  documentId: number,
  files: File[],
): Promise<AddFilesToDocumentResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files[]", file);
  });

  const response = await api.post<AddFilesToDocumentResponse>(
    `/share-batches/${batchId}/documents/${documentId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

/**
 * Response for updating document metadata.
 */
export interface UpdateDocumentMetadataResponse {
  message: string;
  document: SharedDocument;
}

/**
 * Updates the metadata for a specific document in a batch.
 * @param batchId The ID of the batch.
 * @param documentId The ID of the document to update.
 * @param metadata The new metadata object.
 * @returns Promise<UpdateDocumentMetadataResponse>
 */
export const updateDocumentMetadata = async (
  batchId: number,
  documentId: number,
  metadata: Record<string, string | number | boolean | null>,
): Promise<UpdateDocumentMetadataResponse> => {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(metadata));

  const response = await api.put<UpdateDocumentMetadataResponse>(
    `/share-batches/${batchId}/documents/${documentId}/metadata`,
    formData,
  );
  return response.data;
};

const createSharer = async (
  data: FormData,
): Promise<{ message: string; sharer: Sharer }> => {
  const response = await api.post<{ message: string; sharer: Sharer }>(
    "/create-sharer",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

const updateSharerLogo = async (
  id: number,
  logo: File,
): Promise<{ message: string; sharer: Sharer }> => {
  const formData = new FormData();
  formData.append("logo", logo);

  const response = await api.post<{ message: string; sharer: Sharer }>(
    `/sharers/${id}/logo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export interface ShareDocumentsRequest {
  document_class_id: number;
  viewer_ids: number[];
  metadata: Record<string, string | number | boolean>;
  files: File[];
}

export interface ShareDocumentsResponse {
  message: string;
  batch_id?: number;
  errors?: Record<string, string[]>;
}

const shareDocuments = async (
  data: ShareDocumentsRequest,
): Promise<ShareDocumentsResponse> => {
  const formData = new FormData();
  formData.append("document_class_id", data.document_class_id.toString());
  data.viewer_ids.forEach((id) =>
    formData.append("viewer_ids[]", id.toString()),
  );
  formData.append("metadata", JSON.stringify(data.metadata));
  data.files.forEach((file) => formData.append("files[]", file));

  try {
    const response = await api.post<ShareDocumentsResponse>(
      "/share-documents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Return the validation errors from the API
      return error.response.data as ShareDocumentsResponse;
    }
    throw error;
  }
};

export const userService = {
  getSharers,
  toggleSharerStatus,
  updateSharer,
  updateSharerLogo,
  createSharer,
  getViewers,
  updateViewer,
  toggleViewerStatus,
  sendUsernameToSharerById,
  checkUsername,
  resetPasswordByUsername,
  getDocumentClasses,
  getDocumentClassById,
  deleteEnumOption,
  addEnumOption,
  createViewer,
  resetViewerPassword,
  downloadViewerCredentials,
  sendViewerCredentialsByEmail,
  extractInfoFromDocument,
  getUser,
  getMyDocumentClasses,
  recoverUsername,
  recoveryUsernameRequest,
  updateDocumentClass,
  createDocumentClass,
  changePassword: (data: ChangePasswordData) =>
    api.post("/change-password", data),
  shareDocuments,
};

export const batchService = {
  getSharedBatchesByDocumentClass,
  getAvailableViewersForBatch,
  attachViewerToBatch,
  getSharedBatchById,
  removeDocumentFromBatch,
  downloadSharedFile,
  addFilesToDocument,
  shareDocuments,
  updateDocumentMetadata,
};

export const docClassService = {
  getMyDocumentClasses,
  getDocumentClassById,
  deleteEnumOption,
  addEnumOption,
  addField: async (
    documentClassId: number,
    data: AddDocumentClassFieldRequest,
  ): Promise<AddDocumentClassFieldResponse> => {
    const response = await api.post<AddDocumentClassFieldResponse>(
      `/document-classes/${documentClassId}/fields`,
      data,
    );
    return response.data;
  },
  /**
   * Gets available sharers that can be assigned to a document class
   *
   * @param documentClassId - The ID of the document class
   * @returns Promise<AvailableSharersResponse> - Response with list of available sharers
   */
  getAvailableSharers: async (
    documentClassId: number,
  ): Promise<AvailableSharersResponse> => {
    try {
      const response = await api.get<AvailableSharersResponse>(
        `/document-classes/${documentClassId}/available-sharers`,
      );

      console.log("getAvailableSharers response:", response);

      // Check if response.data exists
      if (!response.data) {
        console.error("Response data is undefined:", response);
        throw new Error("API response data is undefined");
      }

      return response.data;
    } catch (error) {
      console.error("Error in getAvailableSharers:", error);
      throw error;
    }
  },
  /**
   * Updates a document class field
   *
   * @param classId - The ID of the document class
   * @param fieldId - The ID of the field to update
   * @param data - The field data to update
   * @returns Promise<UpdateDocumentClassFieldResponse>
   *
   * @throws {AxiosError} with response status:
   * - 200: Campo aggiornato con successo
   * - 409: Esiste già una primary key per questa classe documentale
   * - 409: Non puoi rendere obbligatorio questo campo: esistono documenti senza valore per questo campo
   * - 404: Campo o classe documentale non trovata
   * - 422: The given data was invalid
   */
  updateField: async (
    classId: number,
    fieldId: number,
    data: UpdateDocumentClassFieldRequest,
  ): Promise<UpdateDocumentClassFieldResponse> => {
    const response = await api.put<UpdateDocumentClassFieldResponse>(
      `/document-classes/${classId}/fields/${fieldId}`,
      data,
    );
    return response.data;
  },
  deleteField: async (
    classId: number,
    fieldId: number,
    force?: boolean,
  ): Promise<DeleteFieldResponse> => {
    const response = await api.delete<DeleteFieldResponse>(
      `/document-classes/${classId}/fields/${fieldId}`,
      {
        params: { force },
      },
    );
    return response.data;
  },
  /**
   * Assigns a sharer to a document class
   *
   * @param documentClassId - The ID of the document class
   * @param data - The sharer assignment data
   * @returns Promise<AssignSharerResponse>
   */
  assignSharer: async (
    documentClassId: number,
    data: AssignSharerRequest,
  ): Promise<AssignSharerResponse> => {
    try {
      const response = await api.post<AssignSharerResponse>(
        `/document-classes/${documentClassId}/assign-to-sharer`,
        data,
      );

      console.log("assignSharer response:", response);

      // Check if response.data exists
      if (!response.data) {
        console.error("Response data is undefined:", response);
        throw new Error("API response data is undefined");
      }

      return response.data;
    } catch (error) {
      console.error("Error in assignSharer:", error);
      throw error;
    }
  },
  /**
   * Removes a document class from a sharer
   *
   * @param documentClassId - The ID of the document class
   * @param sharerId - The ID of the sharer to remove from
   * @returns Promise<RemoveSharerResponse>
   *
   * @throws {AxiosError} with response status:
   * - 200: Classe rimossa dallo sharer con successo
   * - 404: Classe non assegnata a quello sharer
   */
  removeFromSharer: async (
    documentClassId: number,
    sharerId: number,
  ): Promise<RemoveSharerResponse> => {
    try {
      const response = await api.delete<RemoveSharerResponse>(
        `/document-classes/${documentClassId}/sharers/${sharerId}`,
      );

      console.log("removeFromSharer response:", response);

      // Check if response.data exists
      if (!response.data) {
        console.error("Response data is undefined:", response);
        throw new Error("API response data is undefined");
      }

      return response.data;
    } catch (error) {
      console.error("Error in removeFromSharer:", error);
      throw error;
    }
  },
  // Add the new updateDocumentClass function
  updateDocumentClass,
  /**
   * Creates a new document class (POST /document-classes)
   * @param data - { name: string (required), description?: string, logo?: File | null }
   * @returns Promise<CreateDocumentClassResponse>
   */
  createDocumentClass,
  updateDocumentClassLogo: async (
    id: number,
    logo: File,
  ): Promise<{ message: string; data: DocumentClass }> => {
    const formData = new FormData();
    formData.append("logo", logo);

    const response = await api.post<{ message: string; data: DocumentClass }>(
      `/document-classes/${id}/logo`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  shareDocuments,
};
