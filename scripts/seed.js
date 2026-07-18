import "dotenv/config";
import { readFile } from "node:fs/promises";
import bcrypt from "bcrypt";
import { closeDb, connectToDb } from "../db/connection.js";

const dataUrl = new URL("../data/import/faqs.json", import.meta.url);
const categories = new Set([
  "Account",
  "Billing",
  "Technical",
  "Security",
  "Orders",
  "Policies",
]);

const demoUsers = [
  {
    name: "Demo Customer",
    email: "customer@resolvehub.demo",
    role: "customer",
    password: "Customer123!",
  },
  {
    name: "Demo Agent",
    email: "agent@resolvehub.demo",
    role: "agent",
    password: "Agent123!",
  },
  {
    name: "Demo Admin",
    email: "admin@resolvehub.demo",
    role: "admin",
    password: "Admin123!",
  },
];

const normalizeFaq = (faq, index) => {
  const fields = [
    "title",
    "question",
    "answer",
    "category",
    "tags",
    "createdAt",
  ];
  if (fields.some((field) => faq[field] === undefined)) {
    throw new Error(`FAQ row ${index + 1} is missing a required field`);
  }
  if (
    !categories.has(faq.category) ||
    !Array.isArray(faq.tags) ||
    faq.tags.length === 0
  ) {
    throw new Error(`FAQ row ${index + 1} has an invalid category or tags`);
  }
  const createdAt = new Date(faq.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    throw new Error(`FAQ row ${index + 1} has an invalid date`);
  }
  return {
    title: String(faq.title).trim(),
    question: String(faq.question).trim(),
    answer: String(faq.answer).trim(),
    category: faq.category,
    tags: faq.tags.map((tag) => String(tag).trim().toLowerCase()),
    createdAt,
    updatedAt: createdAt,
    seedSource: "mockaroo",
  };
};

async function seed() {
  const rawData = await readFile(dataUrl, "utf8");
  const sourceFaqs = JSON.parse(rawData);
  if (!Array.isArray(sourceFaqs) || sourceFaqs.length !== 1000) {
    throw new Error("faqs.json must contain exactly 1,000 records");
  }
  const faqs = sourceFaqs.map(normalizeFaq);
  const db = await connectToDb();

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("faqs").createIndex({ title: 1 }),
    db.collection("supportSessions").createIndex({
      customerId: 1,
      startedAt: -1,
    }),
    db.collection("tickets").createIndex({ status: 1, priority: 1 }),
    db.collection("tickets").createIndex({ assignedAgentId: 1 }),
    db.collection("notifications").createIndex({
      recipientId: 1,
      isRead: 1,
      createdAt: -1,
    }),
  ]);

  await db.collection("faqs").deleteMany({ seedSource: "mockaroo" });
  await db.collection("faqs").insertMany(faqs);

  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await db.collection("users").updateOne(
      { email: user.email },
      {
        $set: {
          name: user.name,
          role: user.role,
          passwordHash,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }

  const [faqCount, userCount] = await Promise.all([
    db.collection("faqs").countDocuments(),
    db.collection("users").countDocuments(),
  ]);
  console.log(`Seed complete: ${faqCount} FAQs and ${userCount} users`);
  demoUsers.forEach((user) => {
    console.log(`${user.role}: ${user.email} / ${user.password}`);
  });
}

try {
  await seed();
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
