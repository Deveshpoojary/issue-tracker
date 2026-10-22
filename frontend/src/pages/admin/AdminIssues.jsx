import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import IssueModal from "@/components/issues/IssueModal";
import IssueDetailModal from "@/components/issues/IssueDetailModal";

export default function AdminIssues() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "All";

  // Data state
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Sync status filter if URL search param changes
  useEffect(() => {
    const s = searchParams.get("status");
    if (s && s !== statusFilter) {
      setStatusFilter(s);
    }
  }, [searchParams, statusFilter]);

  // Fetch all issues across all users from admin endpoint
  const fetchAllIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users for assignment dropdown
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllIssues();
    fetchUsers();
  }, [fetchAllIssues, fetchUsers]);

  // Quick status update
  async function handleStatusChange(issueId, newStatus) {
    setActionLoadingId(issueId);
    try {
      await api.adminUpdateIssue(issueId, { status: newStatus });
      setIssues((prev) =>
        prev.map((item) => (item._id === issueId ? { ...item, status: newStatus } : item))
      );
      if (selectedIssue?._id === issueId) {
        setSelectedIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      alert(err.message || "Failed to update issue status.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Quick assignee update
  async function handleAssigneeChange(issueId, newAssigneeId) {
    setActionLoadingId(issueId);
    try {
      const updated = await api.adminUpdateIssue(issueId, {
        assignedTo: newAssigneeId || null,
      });
      setIssues((prev) =>
        prev.map((item) => (item._id === issueId ? updated : item))
      );
      if (selectedIssue?._id === issueId) {
        setSelectedIssue(updated);
      }
    } catch (err) {
      alert(err.message || "Failed to update assignee.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Admin delete issue
  async function handleDeleteIssue(issue) {
    if (!window.confirm(`Are you sure you want to permanently delete issue "${issue.title}"?`)) {
      return;
    }

    setActionLoadingId(issue._id);
    try {
      await api.adminDeleteIssue(issue._id);
      setIssues((prev) => prev.filter((i) => i._id !== issue._id));
      if (selectedIssue?._id === issue._id) {
        setSelectedIssue(null);
      }
      setSuccessMsg(`Issue "${issue.title}" deleted.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to delete issue.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Save (Create or Edit) issue submit
  async function handleSaveIssue(issueData) {
    setModalLoading(true);
    try {
      if (editingIssue) {
        const updated = await api.adminUpdateIssue(editingIssue._id, {
          title: issueData.title,
          description: issueData.description,
          status: issueData.status,
          priority: issueData.priority,
          assignedTo: issueData.assignedTo || null,
        });
        setIssues((prev) =>
          prev.map((i) => (i._id === editingIssue._id ? updated : i))
        );
        if (selectedIssue?._id === editingIssue._id) {
          setSelectedIssue(updated);
        }
      } else {
        const created = await api.createIssue({
          title: issueData.title,
          description: issueData.description,
          status: issueData.status,
          priority: issueData.priority,
          assignedTo: issueData.assignedTo || null,
        });
        setIssues((prev) => [created, ...prev]);
      }

      setIsCreateOpen(false);
      setEditingIssue(null);
    } catch (err) {
      alert(err.message || "Failed to save issue.");
    } finally {
      setModalLoading(false);
    }
  }

  // Add comment
  async function handleAddComment(id, text) {
    const updated = await api.addComment(id, text);
    setIssues((prev) => prev.map((item) => (item._id === id ? updated : item)));
    if (selectedIssue?._id === id) {
      setSelectedIssue(updated);
    }
    return updated;
  }

  // Filtered issues
  const displayedIssues = issues.filter((issue) => {
    if (statusFilter !== "All" && issue.status !== statusFilter) return false;
    if (priorityFilter !== "All" && issue.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = issue.title?.toLowerCase().includes(q);
      const matchDesc = issue.description?.toLowerCase().includes(q);
      const matchCreator = issue.createdBy?.name?.toLowerCase().includes(q);
      const matchAssignee = issue.assignedTo?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCreator && !matchAssignee) return false;
    }
    return true;
  });

  const counts = {
    all: issues.length,
    open: issues.filter((i) => i.status === "Open").length,
    inProgress: issues.filter((i) => i.status === "In Progress").length,
    closed: issues.filter((i) => i.status === "Closed").length,
  };

  return (
    <AdminLayout title="Issues">
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
            onClick={fetchAllIssues}
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

      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tab buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "All", label: "All Issues", count: counts.all },
            { key: "Open", label: "Open", count: counts.open },
            { key: "In Progress", label: "In Progress", count: counts.inProgress },
            { key: "Closed", label: "Closed", count: counts.closed },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                if (tab.key === "All") {
                  searchParams.delete("status");
                } else {
                  searchParams.set("status", tab.key);
                }
                setSearchParams(searchParams);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? "bg-black text-white font-semibold"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-black"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-2xs px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* New Issue Button */}
        <Button
          onClick={() => {
            setEditingIssue(null);
            setIsCreateOpen(true);
          }}
          className="h-8 gap-1.5 bg-black px-3.5 text-xs font-semibold text-white hover:bg-neutral-800 self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          New Issue
        </Button>
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, or user..."
            className="h-9 pl-9 text-xs sm:text-sm border-neutral-300"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 rounded-lg border border-neutral-300 bg-white px-2.5 text-xs font-medium text-black outline-none hover:border-neutral-400 focus:border-black"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table / List */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="h-6 w-6 animate-spin mb-2 text-black" />
            <p className="text-xs sm:text-sm">Loading issues across the system...</p>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            {search || statusFilter !== "All" || priorityFilter !== "All"
              ? "No issues match the selected filters."
              : "No issues exist yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold text-2xs uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Issue</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6">Priority</th>
                  <th className="py-3 px-4 sm:px-6">Created By</th>
                  <th className="py-3 px-4 sm:px-6">Assigned To</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {displayedIssues.map((issue) => {
                  const isBusy = actionLoadingId === issue._id;

                  return (
                    <tr
                      key={issue._id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Title & Description & Comments */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-xs">
                        <div
                          onClick={() => setSelectedIssue(issue)}
                          className="cursor-pointer group"
                        >
                          <p className="font-semibold text-black group-hover:underline underline-offset-2 truncate">
                            {issue.title}
                          </p>
                          <p className="text-neutral-500 text-2xs line-clamp-1 mt-0.5">
                            {issue.description}
                          </p>
                          {issue.comments?.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-3xs text-neutral-500 mt-1">
                              <MessageSquare className="h-3 w-3" />
                              {issue.comments.length} comment{issue.comments.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <select
                          value={issue.status}
                          disabled={isBusy}
                          onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                          className="h-7 rounded border border-neutral-300 bg-white px-2 text-2xs font-medium text-black outline-none focus:border-black"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-2xs font-semibold ${
                            issue.priority === "High"
                              ? "bg-black text-white"
                              : issue.priority === "Medium"
                              ? "bg-neutral-100 text-neutral-800 border border-neutral-200"
                              : "bg-white text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {issue.priority}
                        </span>
                      </td>

                      {/* Created By */}
                      <td className="py-3.5 px-4 sm:px-6 text-neutral-700 text-xs">
                        <div className="font-medium text-black">
                          {issue.createdBy?.name || "Unknown"}
                        </div>
                        <div className="text-2xs text-neutral-400 font-mono">
                          {issue.createdBy?.email || "—"}
                        </div>
                      </td>

                      {/* Assigned To Dropdown */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <select
                          value={issue.assignedTo?._id || issue.assignedTo || ""}
                          disabled={isBusy}
                          onChange={(e) => handleAssigneeChange(issue._id, e.target.value)}
                          className="h-7 max-w-[150px] rounded border border-neutral-300 bg-white px-2 text-2xs font-medium text-black outline-none focus:border-black truncate"
                        >
                          <option value="">Unassigned</option>
                          {users.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedIssue(issue)}
                            className="h-7 w-7 p-0 border-neutral-300 text-neutral-600 hover:text-black hover:border-black"
                            title="View details & comments"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingIssue(issue);
                              setIsCreateOpen(true);
                            }}
                            className="h-7 w-7 p-0 border-neutral-300 text-neutral-600 hover:text-black hover:border-black"
                            title="Edit issue"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => handleDeleteIssue(issue)}
                            className="h-7 w-7 p-0 border-neutral-300 text-neutral-600 hover:text-black hover:border-black"
                            title="Delete issue"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Create / Edit Modal */}
      <IssueModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingIssue(null);
        }}
        onSubmit={handleSaveIssue}
        issue={editingIssue}
        users={users}
        loading={modalLoading}
      />

      {/* Details & Comments Modal */}
      <IssueDetailModal
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue}
        users={users}
        onUpdateStatus={(id, st) => handleStatusChange(id, st)}
        onUpdateAssignee={(id, asId) => handleAssigneeChange(id, asId)}
        onAddComment={handleAddComment}
        onEdit={(issue) => {
          setSelectedIssue(null);
          setEditingIssue(issue);
          setIsCreateOpen(true);
        }}
        onDelete={(issue) => handleDeleteIssue(issue)}
      />
    </AdminLayout>
  );
}
