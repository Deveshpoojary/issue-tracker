const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Issue = require("../models/Issue");

// Get all issues
router.get("/", authMiddleware, async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard issue counts (must be before /:id)
router.get("/dashboard/stats", authMiddleware, async (req, res) => {
    try {
        const total = await Issue.countDocuments();
        const open = await Issue.countDocuments({ status: "Open" });
        const inProgress = await Issue.countDocuments({ status: "In Progress" });
        const closed = await Issue.countDocuments({ status: "Closed" });

        res.status(200).json({
            total,
            open,
            inProgress,
            closed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get issue by id
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//create issue
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, status, priority, assignedTo } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }
        const issue = await Issue.create({
            title,
            description,
            status,
            priority,
            assignedTo: assignedTo || null,
            createdBy: req.user.id
        });
        const populated = await Issue.findById(issue._id)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//update issue
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description, status, priority, assignedTo } = req.body;
        const updateData = { title, description, status, priority };
        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo || null;
        }
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//delete issue
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//assign issue to user
router.post("/assign/:id", authMiddleware, async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { assignedTo: assignedTo || null },
            { new: true }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//comment to issues
router.post("/comment/:id", authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: { text: text.trim(), author: req.user.id } } },
            { new: true }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .populate("comments.author", "name email");
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
