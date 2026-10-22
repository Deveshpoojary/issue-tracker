import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  LogOut,
  MessageSquare,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  X,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IssueModal from "@/components/issues/IssueModal";
import IssueDetailModal from "@/components/issues/IssueDetailModal";

export default function Dashboard() {
  const navigate = useNavigate();

  // Current logged in user
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const currentUserId = currentUser?._id || currentUser?.id;

  // Data state
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all issues from backend
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users for assignment
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Create or Edit submit
  async function handleSaveIssue(issueData) {
    setModalLoading(true);
    try {
      let targetId = null;

      if (editingIssue) {
        await api.updateIssue(editingIssue._id, {
          title: issueData.title,
          description: issueData.description,
          status: issueData.status,
          priority: issueData.priority,
        });
        targetId = editingIssue._id;
      } else {
        const created = await api.createIssue({
          title: issueData.title,
          description: issueData.description,
          status: issueData.status,
          priority: issueData.priority,
        });
        targetId = created._id;
      }

      // Explicitly assign issue via backend assign endpoint so assignee is saved
      if (targetId && issueData.assignedTo !== undefined) {
        await api.assignIssue(targetId, issueData.assignedTo || null);
      }

      setIsCreateOpen(false);
      setEditingIssue(null);
      await fetchIssues();
    } catch (err) {
      alert(err.message || "Failed to save issue.");
    } finally {
      setModalLoading(false);
    }
  }

  // Delete issue
  async function handleDeleteIssue(issue) {
    if (!window.confirm(`Are you sure you want to delete "${issue.title}"?`)) {
      return;
    }

    setDeletingId(issue._id);
    try {
      await api.deleteIssue(issue._id);
      setIssues((prev) => prev.filter((item) => item._id !== issue._id));
      if (selectedIssue?._id === issue._id) {
        setSelectedIssue(null);
      }
    } catch (err) {
      alert(err.message || "Failed to delete issue.");
    } finally {
      setDeletingId(null);
    }
  }

  // Quick status update
  async function handleUpdateStatus(id, newStatus) {
    try {
      await api.updateIssue(id, { status: newStatus });
      await fetchIssues();
      if (selectedIssue?._id === id) {
        setSelectedIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  }

  // Quick assignee update
  async function handleUpdateAssignee(id, newAssigneeId) {
    try {
      await api.assignIssue(id, newAssigneeId || null);
      await fetchIssues();
      if (selectedIssue?._id === id) {
        const found = users.find((u) => u._id === newAssigneeId);
        setSelectedIssue((prev) => (prev ? { ...prev, assignedTo: found || null } : null));
      }
    } catch (err) {
      alert(err.message || "Failed to update assignee.");
    }
  }

  // Add comment
  async function handleAddComment(id, text) {
    const updated = await api.addComment(id, text);
    await fetchIssues();
    if (selectedIssue?._id === id) {
      setSelectedIssue((prev) => {
        if (!prev || prev._id !== id) return prev;
        return {
          ...prev,
          comments: updated.comments || [
            ...(prev.comments || []),
            { text, author: currentUser, createdAt: new Date().toISOString() },
          ],
        };
      });
    }
    return updated;
  }

  // Helper to get formatted name of assignee
  function getAssigneeName(assignedTo) {
    if (!assignedTo) return "Unassigned";

    if (typeof assignedTo === "object" && assignedTo.name) {
      return assignedTo.name;
    }

    const assigneeId = typeof assignedTo === "object" ? assignedTo._id : assignedTo;
    const found = users.find((u) => u._id === assigneeId);
    if (found && found.name) {
      return found.name;
    }

    if (currentUserId && assigneeId === currentUserId && currentUser?.name) {
      return currentUser.name;
    }

    return "Unassigned";
  }

  // Helper to get formatted name of creator
  function getCreatorName(createdBy) {
    if (!createdBy) return "Unknown";

    if (typeof createdBy === "object" && createdBy.name) {
      return createdBy.name;
    }

    const creatorId = typeof createdBy === "object" ? createdBy._id : createdBy;
    const found = users.find((u) => u._id === creatorId);
    if (found && found.name) {
      return found.name;
    }

    if (currentUserId && creatorId === currentUserId && currentUser?.name) {
      return currentUser.name;
    }

    return "Unknown";
  }

  // Filter issues so only "me" (creator) and "that person" (assignee) can see them
  const visibleIssues = issues.filter((issue) => {
    if (!currentUserId) return true;
    const creatorId = issue.createdBy?._id || issue.createdBy;
    const assigneeId = issue.assignedTo?._id || issue.assignedTo;
    return creatorId === currentUserId || assigneeId === currentUserId;
  });

  // Calculate stats based on visible issues
  const stats = {
    total: visibleIssues.length,
    open: visibleIssues.filter((i) => i.status === "Open").length,
    inProgress: visibleIssues.filter((i) => i.status === "In Progress").length,
    closed: visibleIssues.filter((i) => i.status === "Closed").length,
  };

  // Filter by search, status, and priority
  const displayedIssues = visibleIssues.filter((issue) => {
    if (statusFilter !== "All" && issue.status !== statusFilter) return false;
    if (priorityFilter !== "All" && issue.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = issue.title?.toLowerCase().includes(q);
      const matchDesc = issue.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Clear filters
  function handleClearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "All" || priorityFilter !== "All";

  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* Top Navigation - Full Width */}
      <header className="w-full border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white shadow-xs">
              IT
            </span>
            <span className="font-bold tracking-tight text-lg sm:text-xl text-black">
              Issue Tracker
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <span className="text-xs sm:text-sm text-neutral-600 hidden sm:inline">
                Signed in as <strong className="text-black font-semibold">{currentUser.name || currentUser.email}</strong>
              </span>
            )}
            {currentUser?.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="h-8 gap-1.5 border-black bg-black text-white hover:bg-neutral-800 text-xs font-medium shadow-xs"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1.5 border-neutral-300 text-xs font-medium text-black hover:bg-neutral-100 hover:text-black"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width & Responsive */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Title and New Issue */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Manage and track issues assigned to you or created by you.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingIssue(null);
              setIsCreateOpen(true);
            }}
            className="h-9 gap-1.5 bg-black px-4 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Issue
          </Button>
        </div>

        {/* Stats Cards - Responsive 2 to 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`rounded-xl border p-4 sm:p-5 text-left transition ${
              statusFilter === "All"
                ? "border-black bg-neutral-100 ring-1 ring-black"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <span className="text-xs sm:text-sm font-medium text-neutral-600">Total Issues</span>
            <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "Open" ? "All" : "Open"))}
            className={`rounded-xl border p-4 sm:p-5 text-left transition ${
              statusFilter === "Open"
                ? "border-black bg-neutral-100 ring-1 ring-black"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-black" />
              <span className="text-xs sm:text-sm font-medium text-neutral-600">Open</span>
            </div>
            <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              {stats.open}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "In Progress" ? "All" : "In Progress"))}
            className={`rounded-xl border p-4 sm:p-5 text-left transition ${
              statusFilter === "In Progress"
                ? "border-black bg-neutral-100 ring-1 ring-black"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              <span className="text-xs sm:text-sm font-medium text-neutral-600">In Progress</span>
            </div>
            <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              {stats.inProgress}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "Closed" ? "All" : "Closed"))}
            className={`rounded-xl border p-4 sm:p-5 text-left transition ${
              statusFilter === "Closed"
                ? "border-black bg-neutral-100 ring-1 ring-black"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-400" />
              <span className="text-xs sm:text-sm font-medium text-neutral-600">Closed</span>
            </div>
            <span className="block mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              {stats.closed}
            </span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search issues by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 border-neutral-300 text-xs sm:text-sm bg-white text-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-xs sm:text-sm text-black font-medium outline-none focus:border-black"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-xs sm:text-sm text-black font-medium outline-none focus:border-black"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-10 gap-1 px-3 text-xs sm:text-sm text-neutral-600 hover:text-black"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-black/20 bg-neutral-100 p-3 text-xs sm:text-sm text-black">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-black" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIssues}
              className="h-7 border-black text-xs text-black"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Issues List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center">
            <p className="text-base font-semibold text-black">
              {hasActiveFilters ? "No matching issues found" : "No issues yet"}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600">
              {hasActiveFilters
                ? "Try clearing or adjusting your search filters."
                : "Create an issue to start tracking tasks."}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4 h-9 text-xs sm:text-sm font-medium"
              >
                Clear filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setEditingIssue(null);
                  setIsCreateOpen(true);
                }}
                className="mt-4 h-9 bg-black text-xs sm:text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create Issue
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedIssues.map((issue) => {
              const commentsCount = issue.comments?.length || 0;
              const isDeleting = deletingId === issue._id;
              const creator = getCreatorName(issue.createdBy);
              const assignee = getAssigneeName(issue.assignedTo);

              return (
                <div
                  key={issue._id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 transition hover:border-neutral-400 hover:shadow-xs text-left"
                >
                  <div
                    className="space-y-1.5 flex-1 cursor-pointer text-left"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-black px-2 py-0.5 text-xs font-semibold text-black bg-white">
                        {issue.status}
                      </span>
                      <span className="rounded border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 font-medium">
                        {issue.priority}
                      </span>
                      <span className="text-xs text-neutral-600">
                        Created by: <strong className="text-black font-semibold">{creator}</strong>
                      </span>
                      <span className="text-xs text-neutral-300">•</span>
                      <span className="text-xs text-neutral-600">
                        Assigned to: <strong className="text-black font-semibold">{assignee}</strong>
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-black hover:underline tracking-tight text-left">
                      {issue.title}
                    </h3>

                    {issue.description && (
                      <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed text-left">
                        {issue.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 justify-end">
                    <span className="flex items-center gap-1 text-xs text-neutral-500 mr-2">
                      <MessageSquare className="h-4 w-4" />
                      {commentsCount}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIssue(issue)}
                      className="h-8 px-3 text-xs text-neutral-800 hover:text-black font-medium border-neutral-300 hover:bg-neutral-100"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingIssue(issue);
                        setIsCreateOpen(true);
                      }}
                      className="h-8 px-3 text-xs text-neutral-800 hover:text-black font-medium border-neutral-300 hover:bg-neutral-100"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => handleDeleteIssue(issue)}
                      className="h-8 px-2.5 text-xs text-neutral-800 hover:bg-black hover:text-white border-neutral-300"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Issue Modal */}
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

      {/* Issue Details & Comments Modal */}
      <IssueDetailModal
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue}
        users={users}
        onUpdateStatus={handleUpdateStatus}
        onUpdateAssignee={handleUpdateAssignee}
        onAddComment={handleAddComment}
        onEdit={(issue) => {
          setSelectedIssue(null);
          setEditingIssue(issue);
          setIsCreateOpen(true);
        }}
        onDelete={(issue) => {
          setSelectedIssue(null);
          handleDeleteIssue(issue);
        }}
      />
    </div>
  );
}
