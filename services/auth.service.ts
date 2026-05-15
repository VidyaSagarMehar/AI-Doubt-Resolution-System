import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import type { AuthUser, UserRole } from "@/types";

function toPublicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: UserRole;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  } satisfies AuthUser;
}

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  await connectToDatabase();

  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: input.role,
  });

  return toPublicUser(user);
}

export async function loginUser(input: { email: string; password: string }) {
  await connectToDatabase();

  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return toPublicUser(user);
}

export async function getUserById(id: string) {
  await connectToDatabase();

  const user = await User.findById(id);
  if (!user) {
    return null;
  }

  return toPublicUser(user);
}
