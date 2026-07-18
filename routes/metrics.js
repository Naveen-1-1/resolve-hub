import express from "express";
import { connectToDb } from "../db/connection.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, requireRole("admin"), async (req, res) => {
  try {
    const db = await connectToDb();
    const [sessionCount, ticketStatusRows, notificationCount, resolutionRows] =
      await Promise.all([
        db.collection("supportSessions").countDocuments(),
        db
          .collection("tickets")
          .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
          .toArray(),
        db.collection("notifications").countDocuments(),
        db
          .collection("tickets")
          .aggregate([
            { $match: { resolvedAt: { $ne: null } } },
            {
              $group: {
                _id: null,
                averageMilliseconds: {
                  $avg: { $subtract: ["$resolvedAt", "$createdAt"] },
                },
              },
            },
          ])
          .toArray(),
      ]);

    const ticketsByStatus = { open: 0, in_progress: 0, resolved: 0 };
    ticketStatusRows.forEach((row) => {
      ticketsByStatus[row._id] = row.count;
    });
    const averageResolutionSeconds = resolutionRows[0]?.averageMilliseconds
      ? Number((resolutionRows[0].averageMilliseconds / 1000).toFixed(1))
      : 0;
    res.json({
      metrics: {
        sessionCount,
        ticketsByStatus,
        notificationCount,
        averageResolutionSeconds,
      },
    });
  } catch (error) {
    console.error("Failed to load metrics:", error);
    res.status(500).json({ message: "Unable to load metrics" });
  }
});

export default router;
