import { hash, verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "sona_session";
const SESSION_TTL_DAYS = parseInt(process.env.SESSION_TTL_DAYS || "30");

const argon2Options = {
  memoryCost: 19456, // 19 MB
  timeCost: 2,
  parallelism: 1,
  algorithm: 2, // Argon2id
};

/**
 * Hashes a password using Argon2id.
 * @param password - The plain text password to hash.
 * @returns The Argon2id hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, argon2Options);
}

/**
 * Verifies a password against an Argon2id hash.
 * @param password - The plain text password to verify.
 * @param hash - The Argon2id hash string to verify against.
 * @returns true if the password matches the hash, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verify(hash, password);
}

/**
 * Generates a cryptographically secure random token.
 * @param bytes - The number of bytes of entropy (default: 32).
 * @returns A hex-encoded token string.
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * Creates a new session for a customer in the database.
 * @param customerId - The ID of the customer.
 * @param ip - Optional IP address of the client.
 * @param ua - Optional User-Agent string.
 * @returns An object containing the token and expiration date.
 */
export async function createSession(customerId: string, ip?: string, ua?: string) {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000);
  await db.session.create({
    data: { token, customerId, expiresAt, ipAddress: ip, userAgent: ua },
  });
  return { token, expiresAt };
}

/**
 * Sets the session cookie on the response.
 * @param token - The session token to store in the cookie.
 * @param expiresAt - The expiration date of the cookie.
 */
export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Clears the session cookie from the response.
 */
export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Retrieves the currently authenticated customer from the session cookie.
 * @returns The customer object if authenticated, null otherwise.
 */
export async function getCurrentCustomer() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { customer: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.customer;
}

/**
 * Requires an authenticated customer. Throws a Response with 401 if not authenticated.
 * @returns The authenticated customer object.
 */
export async function requireCustomer() {
  const c = await getCurrentCustomer();
  if (!c) throw new Response("Unauthorized", { status: 401 });
  return c;
}

/**
 * Requires an authenticated admin customer. Throws a Response with 403 if not admin.
 * @returns The authenticated admin customer object.
 */
export async function requireAdmin() {
  const c = await getCurrentCustomer();
  if (!c || c.role !== "ADMIN") throw new Response("Forbidden", { status: 403 });
  return c;
}
