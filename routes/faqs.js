import express from "express";
import { ObjectId } from "mongodb";
import { connectToDb } from "../db/connection.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const router = express.Router();
const categories = [
  "Account",
  "Billing",
  "Technical",
  "Security",
  "Orders",
  "Policies",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateFaq = (body, partial = false) => {
  const required = ["title", "question", "answer", "category", "tags"];
  if (!partial && required.some((field) => body[field] === undefined)) {
    return "All FAQ fields are required";
  }
  if (body.category !== undefined && !categories.includes(body.category)) {
    return "Choose a valid category";
  }
  if (
    body.tags !== undefined &&
    (!Array.isArray(body.tags) || body.tags.length === 0)
  ) {
    return "Add at least one tag";
  }
  for (const field of ["title", "question", "answer"]) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" || !body[field].trim())
    ) {
      return `${field} cannot be empty`;
    }
  }
  return null;
};

const cleanFaq = (body) => {
  const faq = {};
  for (const field of ["title", "question", "answer", "category"]) {
    if (body[field] !== undefined) faq[field] = body[field].trim();
  }
  if (body.tags !== undefined) {
    faq.tags = body.tags
      .filter((tag) => typeof tag === "string" && tag.trim())
      .map((tag) => tag.trim().toLowerCase())
      .slice(0, 5);
  }
  return faq;
};

router.get("/", async (req, res) => {
  try {
    const db = await connectToDb();
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = 20;
    const query = {};

    if (req.query.search) {
      query.title = {
        $regex: escapeRegex(String(req.query.search).slice(0, 80)),
        $options: "i",
      };
    }
    if (categories.includes(req.query.category)) {
      query.category = req.query.category;
    }
    if (req.query.tag) query.tags = String(req.query.tag).toLowerCase();

    const [items, total] = await Promise.all([
      db
        .collection("faqs")
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("faqs").countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Failed to list FAQs:", error);
    res.status(500).json({ message: "Unable to load FAQs" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid FAQ id" });
    }
    const db = await connectToDb();
    const faq = await db
      .collection("faqs")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    return res.json({ faq });
  } catch (error) {
    console.error("Failed to load FAQ:", error);
    return res.status(500).json({ message: "Unable to load FAQ" });
  }
});

router.post("/", isAuthenticated, requireRole("admin"), async (req, res) => {
  try {
    const validationError = validateFaq(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    const db = await connectToDb();
    const now = new Date();
    const faq = { ...cleanFaq(req.body), createdAt: now, updatedAt: now };
    const result = await db.collection("faqs").insertOne(faq);
    return res.status(201).json({ faq: { ...faq, _id: result.insertedId } });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return res.status(500).json({ message: "Unable to create FAQ" });
  }
});

router.patch(
  "/:id",
  isAuthenticated,
  requireRole("admin"),
  async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid FAQ id" });
      }
      const validationError = validateFaq(req.body, true);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
      const updates = cleanFaq(req.body);
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No FAQ changes supplied" });
      }
      updates.updatedAt = new Date();
      const db = await connectToDb();
      const result = await db
        .collection("faqs")
        .findOneAndUpdate(
          { _id: new ObjectId(req.params.id) },
          { $set: updates },
          { returnDocument: "after" }
        );
      if (!result) return res.status(404).json({ message: "FAQ not found" });
      return res.json({ faq: result });
    } catch (error) {
      console.error("Failed to update FAQ:", error);
      return res.status(500).json({ message: "Unable to update FAQ" });
    }
  }
);

router.delete(
  "/:id",
  isAuthenticated,
  requireRole("admin"),
  async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid FAQ id" });
      }
      const db = await connectToDb();
      const result = await db
        .collection("faqs")
        .deleteOne({ _id: new ObjectId(req.params.id) });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
      return res.status(500).json({ message: "Unable to delete FAQ" });
    }
  }
);

export default router;
