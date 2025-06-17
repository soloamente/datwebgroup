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
const getDocumentClasses = async (): Promise<DocumentClass[]> => {
  const response = await api.get<DocumentClass[]>("/document-classes");
  return response.data;
};

const getDocumentClassById = async (id: number): Promise<ApiResponseSingle> => {
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
 */
export interface CreateDocumentClassRequest {
  name: string; // obbligatorio
  description?: string; // facoltativo
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
 * @param data - The document class data (name required, description optional)
 * @returns Promise<CreateDocumentClassResponse>
 * @throws {AxiosError} - Surfaces API error messages for validation
 */
const createDocumentClass = async (
  data: CreateDocumentClassRequest,
): Promise<CreateDocumentClassResponse> => {
  try {
    const response = await api.post<CreateDocumentClassResponse>(
      "/document-classes",
      data,
    );
    return response.data;
  } catch (error) {
    // Surface API validation errors if present
    if (axios.isAxiosError(error) && error.response) {
      const data: unknown = error.response.data;
      let message = "Errore nella creazione della classe documentale.";
      let errors: Record<string, string[]> | undefined = undefined;
      // Type guard for error response
      type ErrorData = {
        message?: string;
        error?: string;
        errors?: Record<string, string[]>;
      };
      function isErrorData(obj: unknown): obj is ErrorData {
        return typeof obj === "object" && obj !== null;
      }
      if (isErrorData(data)) {
        if (typeof data.message === "string") {
          message = data.message;
        } else if (typeof data.error === "string") {
          message = data.error;
        }
        if (typeof data.errors === "object" && data.errors !== null) {
          errors = data.errors;
        }
      }
      return {
        message,
        errors,
      };
    }
    throw error;
  }
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
  checkUsername,
  resetPasswordByUsername,
  getDocumentClasses,
  getUser,
  recoverUsername,
  recoveryUsernameRequest,
};

export const docClassService = {
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
   * @param data - { name: string (required), description?: string }
   * @returns Promise<CreateDocumentClassResponse>
   */
  createDocumentClass,
};
