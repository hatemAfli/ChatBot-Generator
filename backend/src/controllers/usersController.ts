import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../config/dbConn";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// Define types for request body
interface CreateUserBody {
  email: string;
  role: "admin" | "superadmin" | "analyste";
  motdepasse: string;
  nom: string;
  prenom: string;
  num: string;
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.select().from(users);
    console.log("result=", result);
    res.json(result);
  } catch (err: unknown) {
    console.error("Error fetching users", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, role, motdepasse, nom, prenom, num } = req.body;
    const hash: string = await bcrypt.hash(motdepasse, 10);

    await db.insert(users).values({
      email,
      role,
      motdepasse: hash,
      nom,
      prenom,
      num,
    });

    res.send("User registered");
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
     console.log("Error creating user:",  err );
  
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📌 DELETE user
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const deleted = await db
      .delete(users)
      .where(eq(users.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (err: unknown) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE a user

export const updateUser = async (
  req: Request<{ id: string }, {}, Partial<CreateUserBody>>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { email, role, nom, prenom, num } = req.body;

  try {
    const updated = await db
      .update(users)
      .set({ email, role, nom, prenom, num })
      .where(eq(users.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updated[0]);
  } catch (err: unknown) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
