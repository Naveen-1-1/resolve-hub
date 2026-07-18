import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";

import { isAuthenticated, requireRole } from "../middleware/auth.js";

import { findUserByEmail, createUser } from "../db/users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (
      typeof email !== "string" ||
      !email.includes("@") ||
      typeof password !== "string" ||
      password.length < 8 ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        message: "Enter a name, valid email, and password of 8+ characters",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await createUser({
      email: email.trim(),
      passwordHash: hashedPassword,
      name: name.trim().slice(0, 100),
      role: "customer",
    });

    const safeUser = { ...createdUser };
    delete safeUser.passwordHash;

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return res.status(500).json({ message: "Unable to register" });
  }
});

router.post(
  "/users",
  isAuthenticated,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      if (
        typeof email !== "string" ||
        !email.includes("@") ||
        typeof password !== "string" ||
        password.length < 8 ||
        typeof name !== "string" ||
        !name.trim() ||
        !["customer", "agent", "admin"].includes(role)
      ) {
        return res.status(400).json({
          message: "Enter valid user details and select a role",
        });
      }
      if (await findUserByEmail(email)) {
        return res.status(409).json({ message: "User already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const createdUser = await createUser({
        email: email.trim(),
        passwordHash,
        name: name.trim().slice(0, 100),
        role,
      });
      const safeUser = { ...createdUser };
      delete safeUser.passwordHash;
      return res.status(201).json({
        message: `${role} user created successfully`,
        user: safeUser,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: "User already exists" });
      }
      return res.status(500).json({ message: "Unable to create user" });
    }
  }
);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

router.get("/me", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
});

export default router;
