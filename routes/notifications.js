import express from "express";
import { ObjectId } from "mongodb";
import { connectToDb } from "../db/connection.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", async (req, res) => {
  try {
    const db = await connectToDb();
    const notifications = await db
      .collection("notifications")
      .find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json({ notifications });
  } catch (error) {
    console.error("Failed to list notifications:", error);
    res.status(500).json({ message: "Unable to load notifications" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const db = await connectToDb();
    await db
      .collection("notifications")
      .updateMany(
        { recipientId: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    res.status(500).json({ message: "Unable to update notifications" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }
    const db = await connectToDb();
    const result = await db
      .collection("notifications")
      .updateOne(
        { _id: new ObjectId(req.params.id), recipientId: req.user._id },
        { $set: { isRead: true } }
      );
    if (!result.matchedCount) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return res.status(500).json({ message: "Unable to update notification" });
  }
});

export default router;
