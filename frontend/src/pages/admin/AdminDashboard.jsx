import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load admin stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalUsers = stats?.totalUsers ?? 0;
  const totalIssues = stats?.totalIssues ?? 0;
  const openIssues = stats?.openIssues ?? 0;
  const closedIssues = stats?.closedIssues ?? 0;

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-black/20 bg-neutral-100 p-4 text-xs sm:text-sm text-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-black" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchStats}
            className="h-7 text-xs border-neutral-300"
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-black" />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 text-left transition hover:border-neutral-400"
            >
              <span className="text-xs sm:text-sm font-medium text-neutral-600">Total Users</span>
              <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {totalUsers}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/issues")}
              className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 text-left transition hover:border-neutral-400"
            >
              <span className="text-xs sm:text-sm font-medium text-neutral-600">Total Issues</span>
              <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {totalIssues}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/issues?status=Open")}
              className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 text-left transition hover:border-neutral-400"
            >
              <span className="text-xs sm:text-sm font-medium text-neutral-600">Open Issues</span>
              <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {openIssues}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/issues?status=Closed")}
              className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 text-left transition hover:border-neutral-400"
            >
              <span className="text-xs sm:text-sm font-medium text-neutral-600">Closed Issues</span>
              <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {closedIssues}
              </span>
            </button>
          </div>

          {/* Recent Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-black">
                  Recent Users
                </h3>
                <Link
                  to="/admin/users"
                  className="text-xs text-neutral-600 hover:text-black font-medium"
                >
                  View all
                </Link>
              </div>

              {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">No users registered yet.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {stats.recentUsers.map((user) => (
                    <div key={user._id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-black truncate">{user.name}</p>
                        <p className="text-neutral-500 text-2xs truncate">{user.email}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-2xs font-semibold shrink-0 ${
                          user.role === "admin"
                            ? "bg-black text-white"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Issues */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-black">
                  Recent Issues
                </h3>
                <Link
                  to="/admin/issues"
                  className="text-xs text-neutral-600 hover:text-black font-medium"
                >
                  View all
                </Link>
              </div>

              {!stats?.recentIssues || stats.recentIssues.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">No issues created yet.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {stats.recentIssues.map((issue) => (
                    <div key={issue._id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-black truncate">{issue.title}</p>
                        <p className="text-neutral-500 text-2xs">
                          {issue.createdBy?.name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded text-2xs font-medium border border-neutral-300 bg-neutral-50 text-neutral-800">
                          {issue.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-2xs font-medium ${
                            issue.priority === "High"
                              ? "bg-black text-white"
                              : "border border-neutral-200 bg-white text-neutral-700"
                          }`}
                        >
                          {issue.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
