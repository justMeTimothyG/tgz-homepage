"use client";

import { createAuthClient } from "better-auth/react";
import type { Session, User } from "./auth";

const baseURL = typeof window !== "undefined" 
  ? window.location.origin 
  : process.env.BETTER_AUTH_URL || "http://localhost:3001";

export const { useSession, signIn, signOut, signUp } = createAuthClient({
  baseURL
});

export type { Session, User };