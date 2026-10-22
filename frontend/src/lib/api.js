const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  // If token expired or unauthorized, clear storage and redirect
  if (response.status === 401 && !endpoint.includes("/login") && !endpoint.includes("/signup") && !endpoint.includes("/register")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),


  getMe: () => request("/api/auth/me"),

  getUsers: () => request("/api/auth/users"),

  // Issues
  getStats: () => request("/api/issues/dashboard/stats"),

  getIssues: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.append("status", params.status);
    if (params.priority && params.priority !== "All") query.append("priority", params.priority);
    if (params.search && params.search.trim()) query.append("search", params.search.trim());

    const qs = query.toString();
    return request(`/api/issues${qs ? `?${qs}` : ""}`);
  },

  getIssueById: (id) => request(`/api/issues/${id}`),

  createIssue: (issueData) =>
    request("/api/issues", {
      method: "POST",
      body: JSON.stringify(issueData),
    }),

  updateIssue: (id, issueData) =>
    request(`/api/issues/${id}`, {
      method: "PUT",
      body: JSON.stringify(issueData),
    }),

  deleteIssue: (id) =>
    request(`/api/issues/${id}`, {
      method: "DELETE",
    }),

  assignIssue: (id, assignedTo) =>
    request(`/api/issues/assign/${id}`, {
      method: "POST",
      body: JSON.stringify({ assignedTo }),
    }),

  addComment: (id, text) =>
    request(`/api/issues/comment/${id}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Admin Endpoints
  getAdminStats: () => request("/api/admin/stats"),

  getAdminUsers: () => request("/api/admin/users"),

  updateUserRole: (id, role) =>
    request(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id) =>
    request(`/api/admin/users/${id}`, {
      method: "DELETE",
    }),

  getAdminIssues: () => request("/api/admin/issues"),

  adminUpdateIssue: (id, issueData) =>
    request(`/api/admin/issues/${id}`, {
      method: "PUT",
      body: JSON.stringify(issueData),
    }),

  adminDeleteIssue: (id) =>
    request(`/api/admin/issues/${id}`, {
      method: "DELETE",
    }),
};

export default api;
