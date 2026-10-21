import { useState } from "react";
import { X, MessageSquare, Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssueDetailModal({
  isOpen,
  onClose,
  issue,
  users = [],
  onUpdateStatus,
  onUpdateAssignee,
  onAddComment,
  onEdit,
  onDelete,
}) {
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  if (!isOpen || !issue) return null;

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    setCommentError("");

    try {
      await onAddComment(issue._id, commentText.trim());
      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Failed to add comment.");
    } finally {
      setCommentLoading(false);
    }
  }

  const comments = issue.comments || [];
  const assignedUserId = issue.assignedTo?._id || issue.assignedTo || "";
  const createdDate = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "";

  // Helper to resolve real user name from ID or object
  function getUserName(userOrId) {
    if (!userOrId) return "Unknown";

    if (typeof userOrId === "object" && userOrId.name) {
      return userOrId.name;
    }

    const id = typeof userOrId === "object" ? userOrId._id : userOrId;

    const found = users.find((u) => u._id === id);
    if (found && found.name) {
      return found.name;
    }

    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if ((parsed._id === id || parsed.id === id) && parsed.name) {
          return parsed.name;
        }
      }
    } catch {}

    return "Unknown";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl border border-neutral-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block rounded border border-black px-2 py-0.5 text-xs font-semibold text-black">
                {issue.status}
              </span>
              <span className="inline-block rounded border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                {issue.priority} Priority
              </span>
            </div>
            <h2 className="text-lg font-semibold text-black">{issue.title}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(issue)}
              title="Edit issue"
              className="p-1.5 text-neutral-500 hover:text-black rounded hover:bg-neutral-100"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(issue)}
              title="Delete issue"
              className="p-1.5 text-neutral-500 hover:text-black rounded hover:bg-neutral-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-black rounded hover:bg-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata quick controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
            <div>
              <span className="block text-neutral-500 mb-1 font-medium">Status</span>
              <select
                value={issue.status}
                onChange={(e) => onUpdateStatus(issue._id, e.target.value)}
                className="w-full rounded border border-neutral-300 bg-white p-1 text-xs text-black"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <span className="block text-neutral-500 mb-1 font-medium">Assignee</span>
              <select
                value={assignedUserId}
                onChange={(e) => onUpdateAssignee(issue._id, e.target.value)}
                className="w-full rounded border border-neutral-300 bg-white p-1 text-xs text-black"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-neutral-500 mb-1 font-medium">Reported by</span>
              <span className="font-semibold text-black truncate block">
                {getUserName(issue.createdBy)}
              </span>
              <span className="text-neutral-400 text-[11px]">{createdDate}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Description
            </h3>
            <p className="rounded-lg border border-neutral-100 bg-white p-3 text-sm text-neutral-800 whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {/* Comments */}
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <MessageSquare className="h-3.5 w-3.5" /> Comments ({comments.length})
            </h3>

            {comments.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No comments yet.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <div
                    key={comment._id || index}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-black">
                        {getUserName(comment.author)}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-neutral-800 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 pt-2">
              {commentError && (
                <div className="rounded border border-black/20 bg-neutral-100 p-2 text-xs text-neutral-900">
                  {commentError}
                </div>
              )}
              <textarea
                rows={2}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={commentLoading}
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-black outline-none focus:border-black"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="h-8 bg-black px-3 text-xs text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {commentLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Add comment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
