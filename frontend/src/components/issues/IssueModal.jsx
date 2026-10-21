import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function IssueModal({
  isOpen,
  onClose,
  onSubmit,
  issue = null,
  users = [],
  loading = false,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");

  const isEdit = Boolean(issue);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || "");
      setDescription(issue.description || "");
      setStatus(issue.status || "Open");
      setPriority(issue.priority || "Medium");
      setAssignedTo(issue.assignedTo?._id || issue.assignedTo || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("Open");
      setPriority("Medium");
      setAssignedTo("");
    }
    setError("");
  }, [issue, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo: assignedTo || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-black">
            {isEdit ? "Edit Issue" : "Create New Issue"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-black/20 bg-neutral-100 p-2.5 text-xs text-neutral-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-black">
              Title <span className="text-neutral-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              disabled={loading}
              required
              className="h-9 border-neutral-300 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-medium text-black">
              Description <span className="text-neutral-400">*</span>
            </Label>
            <textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description or steps to reproduce"
              disabled={loading}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm text-black outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium text-black">
                Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2.5 text-sm text-black outline-none focus:border-black"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-xs font-medium text-black">
                Priority
              </Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2.5 text-sm text-black outline-none focus:border-black"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignedTo" className="text-xs font-medium text-black">
              Assign To
            </Label>
            <select
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={loading}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2.5 text-sm text-black outline-none focus:border-black"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-9 bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create issue"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
