import express from "express";
import { ObjectId } from "mongodb";
import { connectToDb } from "../db/connection.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const router = express.Router();

const toObjectId = (value) =>
  ObjectId.isValid(value) ? new ObjectId(value) : null;

const enrichSessions = async (db, sessions) => {
  const sessionIds = sessions.map((session) => session._id);
  const faqIds = [
    ...new Map(
      sessions
        .flatMap((session) => session.viewedFaqIds || [])
        .map((id) => [id.toString(), id])
    ).values(),
  ];
  const [faqs, tickets] = await Promise.all([
    faqIds.length
      ? db
          .collection("faqs")
          .find(
            { _id: { $in: faqIds } },
            { projection: { title: 1, question: 1, category: 1 } }
          )
          .toArray()
      : [],
    sessionIds.length
      ? db
          .collection("tickets")
          .find(
            { sessionId: { $in: sessionIds } },
            {
              projection: {
                sessionId: 1,
                subject: 1,
                description: 1,
                priority: 1,
                status: 1,
              },
            }
          )
          .toArray()
      : [],
  ]);
  const faqsById = new Map(faqs.map((faq) => [faq._id.toString(), faq]));
  const ticketsBySession = new Map(
    tickets.map((ticket) => [ticket.sessionId.toString(), ticket])
  );

  return sessions.map((session) => ({
    ...session,
    viewedFaqs: (session.viewedFaqIds || [])
      .map((id) => faqsById.get(id.toString()))
      .filter(Boolean),
    ticket: ticketsBySession.get(session._id.toString()) || null,
  }));
};

router.use(isAuthenticated);

router.get("/", async (req, res) => {
  try {
    const db = await connectToDb();
    const query =
      req.user.role === "customer" ? { customerId: req.user._id } : {};
    const sessions = await db
      .collection("supportSessions")
      .find(query)
      .sort({ startedAt: -1 })
      .limit(50)
      .toArray();
    res.json({ sessions: await enrichSessions(db, sessions) });
  } catch (error) {
    console.error("Failed to list sessions:", error);
    res.status(500).json({ message: "Unable to load sessions" });
  }
});

router.post("/", requireRole("customer"), async (req, res) => {
  try {
    const topic =
      typeof req.body.topic === "string" ? req.body.topic.trim() : "";
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const db = await connectToDb();
    const existing = await db.collection("supportSessions").findOne({
      customerId: req.user._id,
      status: "active",
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Finish your active session first" });
    }

    const session = {
      customerId: req.user._id,
      topic: topic.slice(0, 120),
      viewedFaqIds: [],
      status: "active",
      startedAt: new Date(),
      endedAt: null,
    };
    const result = await db.collection("supportSessions").insertOne(session);
    return res
      .status(201)
      .json({ session: { ...session, _id: result.insertedId } });
  } catch (error) {
    console.error("Failed to start session:", error);
    return res.status(500).json({ message: "Unable to start session" });
  }
});

router.patch("/:id/view-faq", requireRole("customer"), async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    const faqId = toObjectId(req.body.faqId);
    if (!id || !faqId) {
      return res.status(400).json({ message: "Invalid session or FAQ id" });
    }
    const db = await connectToDb();
    const result = await db
      .collection("supportSessions")
      .findOneAndUpdate(
        { _id: id, customerId: req.user._id, status: "active" },
        { $addToSet: { viewedFaqIds: faqId } },
        { returnDocument: "after" }
      );
    if (!result) {
      return res.status(404).json({ message: "Active session not found" });
    }
    return res.json({ session: result });
  } catch (error) {
    console.error("Failed to record FAQ view:", error);
    return res.status(500).json({ message: "Unable to record FAQ view" });
  }
});

router.patch("/:id/resolve", requireRole("customer"), async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid session id" });
    const db = await connectToDb();
    const result = await db
      .collection("supportSessions")
      .findOneAndUpdate(
        { _id: id, customerId: req.user._id, status: "active" },
        { $set: { status: "resolved", endedAt: new Date() } },
        { returnDocument: "after" }
      );
    if (!result) {
      return res.status(404).json({ message: "Active session not found" });
    }
    return res.json({ session: result });
  } catch (error) {
    console.error("Failed to resolve session:", error);
    return res.status(500).json({ message: "Unable to resolve session" });
  }
});

router.post("/:id/escalate", requireRole("customer"), async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    const subject =
      typeof req.body.subject === "string" ? req.body.subject.trim() : "";
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";
    const priorities = ["low", "medium", "high"];
    if (
      !id ||
      !subject ||
      !description ||
      !priorities.includes(req.body.priority)
    ) {
      return res.status(400).json({ message: "Complete all ticket fields" });
    }

    const db = await connectToDb();
    const session = await db.collection("supportSessions").findOne({
      _id: id,
      customerId: req.user._id,
      status: "active",
    });
    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }
    if (await db.collection("tickets").findOne({ sessionId: id })) {
      return res.status(409).json({ message: "Session already escalated" });
    }

    const now = new Date();
    const ticket = {
      sessionId: id,
      customerId: req.user._id,
      assignedAgentId: null,
      subject: subject.slice(0, 120),
      description: description.slice(0, 1500),
      priority: req.body.priority,
      status: "open",
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };
    const ticketResult = await db.collection("tickets").insertOne(ticket);
    await Promise.all([
      db
        .collection("supportSessions")
        .updateOne(
          { _id: id },
          { $set: { status: "escalated", endedAt: now } }
        ),
      db.collection("notifications").insertOne({
        recipientId: req.user._id,
        ticketId: ticketResult.insertedId,
        message: "Your support ticket was created.",
        isRead: false,
        createdAt: now,
      }),
    ]);

    return res.status(201).json({
      ticket: { ...ticket, _id: ticketResult.insertedId },
    });
  } catch (error) {
    console.error("Failed to escalate session:", error);
    return res.status(500).json({ message: "Unable to create ticket" });
  }
});

export default router;
