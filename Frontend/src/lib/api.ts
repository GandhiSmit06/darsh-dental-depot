// ─── User-specific API calls ──────────────────────────────────────────────

export interface UserListResponse {
  success: true;
  message: string;
  data: {
    users: User[];
    meta: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "shop_owner" | "doctor";
  phone: string;
  clinicName?: string;
  address?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  getAllUsers: () =>
    apiFetch<UserListResponse>("/users", {
      method: "GET",
    }),

  getUserById: (id: string) =>
    apiFetch<{ success: true; message: string; data: User }>(`/users/${id}`, {
      method: "GET",
    }),

  updateUser: (id: string, data: Partial<User>) =>
    apiFetch<{ success: true; message: string; data: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    apiFetch<{ success: true; message: string }>(`/users/${id}`, {
      method: "DELETE",
    }),

  exportUsers: () =>
    apiFetch<{ success: true; message: string }>("/users/export", {
      method: "GET",
    }),
};