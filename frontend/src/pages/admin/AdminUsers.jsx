import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Shield,
  Trash2,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle user role between 'user' and 'admin'
  async function handleToggleRole(user) {
    const isPromoting = user.role !== "admin";
    const newRole = isPromoting ? "admin" : "user";
    const confirmMsg = isPromoting
      ? `Promote "${user.name}" (${user.email}) to Administrator?`
      : `Demote "${user.name}" (${user.email}) to regular User?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(user._id);
    setError("");
    setSuccessMsg("");
    try {
      const updated = await api.updateUserRole(user._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: updated.role } : u))
      );
      setSuccessMsg(`Updated ${user.name}'s role to ${newRole.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update role.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Delete user
  async function handleDeleteUser(user) {
    if (user._id === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete user "${user.name}" (${user.email})? Any assigned issues will be unassigned.`
      )
    ) {
      return;
    }

    setActionLoadingId(user._id);
    setError("");
    setSuccessMsg("");
    try {
      await api.deleteUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setSuccessMsg(`User "${user.name}" has been deleted.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = u.name?.toLowerCase().includes(q);
    const matchEmail = u.email?.toLowerCase().includes(q);
    const matchRole = u.role?.toLowerCase().includes(q);
    return matchName || matchEmail || matchRole;
  });

  return (
    <AdminLayout title="Users">
      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-black/20 bg-neutral-100 p-4 text-xs sm:text-sm text-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-black" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUsers}
            className="h-7 text-xs border-neutral-300"
          >
            Retry
          </Button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-black bg-black p-3.5 text-xs sm:text-sm text-white flex items-center justify-between">
          <span>{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-neutral-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 pl-9 text-xs sm:text-sm border-neutral-300"
          />
        </div>

        <span className="text-xs text-neutral-500 self-end sm:self-auto">
          {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Users Table / List */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="h-6 w-6 animate-spin mb-2 text-black" />
            <p className="text-xs sm:text-sm">Loading registered users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            {search ? "No users matching your search." : "No registered users found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold text-2xs uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">User</th>
                  <th className="py-3 px-4 sm:px-6">Email</th>
                  <th className="py-3 px-4 sm:px-6">Role</th>
                  <th className="py-3 px-4 sm:px-6">Joined Date</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((user) => {
                  const isCurrent = user._id === currentUserId;
                  const isBusy = actionLoadingId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Name & Initial */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-black truncate flex items-center gap-1.5">
                              {user.name}
                              {isCurrent && (
                                <span className="rounded bg-neutral-100 border border-neutral-300 px-1.5 py-0.2 text-2xs font-semibold text-neutral-700">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 sm:px-6 text-neutral-600 font-mono text-xs">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-semibold ${
                            user.role === "admin"
                              ? "bg-black text-white"
                              : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td className="py-3.5 px-4 sm:px-6 text-neutral-500 text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCurrent ? (
                            <span className="text-2xs text-neutral-400 italic">
                              Current session
                            </span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => handleToggleRole(user)}
                                className="h-7 px-2.5 text-2xs border-neutral-300 text-neutral-800 hover:bg-neutral-100 gap-1"
                              >
                                {isBusy ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : user.role === "admin" ? (
                                  <>
                                    <UserX className="h-3 w-3" />
                                    Demote
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3" />
                                    Promote to Admin
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => handleDeleteUser(user)}
                                className="h-7 w-7 p-0 border-neutral-300 text-neutral-600 hover:text-black hover:border-black"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
