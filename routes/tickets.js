import express from "express";
import { ObjectId } from "mongodb";
import { connectToDb } from "../db/connection.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const router = express.Router();
const transitions = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: [],
};

const toObjectId = (value) =>
  ObjectId.isValid(value) ? new ObjectId(value) : null;

const canViewTicket = (user, ticket) =>
  user.role !== "customer" ||
  ticket.customerId.toString() === user._id.toString();

const notifyCustomer = async (db, ticket, message) => {
  await db.collection("notifications").insertOne({
    recipientId: ticket.customerId,
    ticketId: ticket._id,
    message,
    isRead: false,
    createdAt: new Date(),
  });
};

router.use(isAuthenticated);

router.get("/", async (req, res) => {
  try {
    const db = await connectToDb();
    const query =
      req.user.role === "customer" ? { customerId: req.user._id } : {};
    if (["open", "in_progress", "resolved"].includes(req.query.status)) {
      query.status = req.query.status;
    }
    if (["low", "medium", "high"].includes(req.query.priority)) {
      query.priority = req.query.priority;
    }
    const tickets = await db
      .collection("tickets")
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();
    res.json({ tickets });
  } catch (error) {
    console.error("Failed to list tickets:", error);
    res.status(500).json({ message: "Unable to load tickets" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ticket id" });
    const db = await connectToDb();
    const ticket = await db.collection("tickets").findOne({ _id: id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: "You do not have access" });
    }
    const session = await db
      .collection("supportSessions")
      .findOne({ _id: ticket.sessionId });
    return res.json({ ticket, session });
  } catch (error) {
    console.error("Failed to load ticket:", error);
    return res.status(500).json({ message: "Unable to load ticket" });
  }
});

router.patch("/:id/assign", requireRole("agent"), async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ticket id" });
    const db = await connectToDb();
    const ticket = await db.collection("tickets").findOne({ _id: id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (
      ticket.assignedAgentId &&
      ticket.assignedAgentId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(409)
        .json({ message: "Ticket is assigned to another agent" });
    }
    const updated = await db
      .collection("tickets")
      .findOneAndUpdate(
        { _id: id },
        { $set: { assignedAgentId: req.user._id, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
    await notifyCustomer(db, updated, "A support agent accepted your ticket.");
    return res.json({ ticket: updated });
  } catch (error) {
    console.error("Failed to assign ticket:", error);
    return res.status(500).json({ message: "Unable to assign ticket" });
  }
});

router.patch("/:id/status", requireRole("agent"), async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ticket id" });
    const db = await connectToDb();
    const ticket = await db.collection("tickets").findOne({ _id: id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (
      !ticket.assignedAgentId ||
      ticket.assignedAgentId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Assign this ticket to yourself first" });
    }
    if (!transitions[ticket.status].includes(req.body.status)) {
      return res.status(409).json({ message: "Invalid status change" });
    }

    const now = new Date();
    const updates = {
      status: req.body.status,
      updatedAt: now,
      resolvedAt: req.body.status === "resolved" ? now : null,
    };
    const updated = await db
      .collection("tickets")
      .findOneAndUpdate(
        { _id: id },
        { $set: updates },
        { returnDocument: "after" }
      );
    await notifyCustomer(
      db,
      updated,
      `Your ticket is now ${req.body.status.replace("_", " ")}.`
    );
    await db.collection("notifications").insertOne({
      recipientId: req.user._id,
      ticketId: updated._id,
      message: `Ticket updated to ${req.body.status.replace("_", " ")}.`,
      isRead: false,
      createdAt: new Date(),
    });
    return res.json({ ticket: updated });
  } catch (error) {
    console.error("Failed to update ticket status:", error);
    return res.status(500).json({ message: "Unable to update ticket" });
  }
});

export default router;
