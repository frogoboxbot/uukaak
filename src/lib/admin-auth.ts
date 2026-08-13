import "server-only";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/crypto";

const ADMIN_SESSION_COOKIE = "uukaak_admin_session";
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === DEFAULT_ADMIN_PASS;
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionPayload = JSON.stringify({
    role: "admin",
    createdAt: Date.now(),
  });
  const encryptedSession = encrypt(sessionPayload);

  cookieStore.set(ADMIN_SESSION_COOKIE, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  try {
    const decrypted = decrypt(sessionCookie);
    if (!decrypted) return false;
    const payload = JSON.parse(decrypted);
    return Boolean(payload && payload.role === "admin");
  } catch {
    return false;
  }
}
