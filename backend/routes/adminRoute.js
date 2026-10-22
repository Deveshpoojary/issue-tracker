const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Issue = require("../models/Issue");

// All admin routes require both authentication and verified admin role
router.use(authMiddleware, adminMiddleware);

// 1. Admin Dashboard Stats
router.get("/stats", async (req, res) => {
    try {
        const [
            totalUsers,
            totalIssues,
            openIssues,
            inProgressIssues,
            closedIssues,
            recentUsers,
            recentIssues
        ] = await Promise.all([
            User.countDocuments(),
            Issue.countDocuments(),
            Issue.countDocuments({ status: "Open" }),
            Issue.countDocuments({ status: "In Progress" }),
            Issue.countDocuments({ status: "Closed" }),
            User.find().select("-password").sort({ createdAt: -1 }).limit(5),
            Issue.find()
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        res.status(200).json({
            totalUsers,
            totalIssues,
            openIssues,
            inProgressIssues,
            closedIssues,
            recentUsers,
            recentIssues
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Get all registered users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Update user role (Promote / Demote)
router.patch("/users/:id/role", async (req, res) => {
    try {
        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified. Must be 'user' or 'admin'." });
        }

        // Prevent self-demotion
        if (req.params.id === req.user.id && role !== "admin") {
            return res.status(400).json({ message: "You cannot demote your own admin account." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Delete user (Admin only)
router.delete("/users/:id", async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Unassign any issues previously assigned to this user
        await Issue.updateMany(
            { assignedTo: req.params.id },
            { assignedTo: null }
        );

        res.status(200).json({ message: "User deleted successfully", userId: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Get all issues across all users
router.get("/issues", async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .populate("comments.author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Admin Update any issue
router.put("/issues/:id", async (req, res) => {
    try {
        const { title, description, status, priority, assignedTo } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .populate("comments.author", "name email");

        if (!issue) {
            return res.status(404).json({ message: "Issue not found." });
        }

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. Admin Delete any issue
router.delete("/issues/:id", async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found." });
        }
        res.status(200).json({ message: "Issue deleted successfully", issueId: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
