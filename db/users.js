import { ObjectId } from "mongodb";
import { connectToDb } from "./connection.js";

const safeProjection = { passwordHash: 0 };

export async function createUser(user) {
  const db = await connectToDb();
  const document = {
    ...user,
    email: user.email.toLowerCase(),
    createdAt: new Date(),
  };
  const result = await db.collection("users").insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function findUserByEmail(email, includePassword = false) {
  const db = await connectToDb();
  return db
    .collection("users")
    .findOne(
      { email: email.toLowerCase() },
      includePassword ? {} : { projection: safeProjection }
    );
}

export async function findUserById(id) {
  if (!ObjectId.isValid(id)) return null;
  const db = await connectToDb();
  return db
    .collection("users")
    .findOne({ _id: new ObjectId(id) }, { projection: safeProjection });
}
