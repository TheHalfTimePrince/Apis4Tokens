"use server";
import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  users,
  tokenTransactions,
  apiKeys,
  ApiKey,
  User,
  TokenTransaction,
} from "./schema";
import { cookies } from "next/headers";

import { createHmac, randomBytes } from "crypto";
import { sql } from "drizzle-orm";
import { getAuth } from "@/auth";
// Function to generate a unique API key
function generateApiKey(): string {
  const prefix = "easyapis_secret_key";

  // Get the current timestamp
  const timestamp = Date.now().toString();

  // Generate a 256-bit (32-byte) random value
  const randomValue = randomBytes(32).toString("hex");

  // Concatenate timestamp and random value
  const data = `${timestamp}${randomValue}`;

  // Create an HMAC using SHA-256 and a secret key
  const secretKey = process.env.API_KEY_SECRET || "default_secret";
  const hmac = createHmac("sha256", secretKey).update(data).digest("hex");

  // Combine the prefix and the HMAC to form the API key
  const apiKey = `${prefix}_${hmac}`;

  return apiKey;
}

export async function getUserTransactions(
  userId: string
): Promise<TokenTransaction[]> {
  const transactions = await db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(tokenTransactions.createdAt);

  return transactions;
}

// Get the authenticated user from session cookies
export async function getUser() {
  const auth = await getAuth();
  const session = await auth();
  console.log("session", session);
  if (!session || !session.user?.id) {
    return null;
  }

  // Get the user from the database using the session user ID
  const user = await getUserById(session.user.id);
  return user;
}

// Get user's token balance
export async function getUserTokenBalance(userId: string) {
  const result = await db
    .select({ tokenBalance: users.tokenBalance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0].tokenBalance : 0;
}

export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  return user || null;
}
export async function deductTokens(
  userId: string,
  tokensRequired: number,
  description: string = "API request"
) {
  await db.transaction(async (tx) => {
    // Attempt to deduct tokens atomically
    const result = await tx
      .update(users)
      .set({
        tokenBalance: sql`token_balance - ${tokensRequired}`,
      })
      .where(and(eq(users.id, userId), sql`token_balance >= ${tokensRequired}`))
      .returning({ tokenBalance: users.tokenBalance });

    if (result.length === 0) {
      throw new Error("Insufficient tokens or user not found");
    }

    // Record the transaction
    await tx.insert(tokenTransactions).values({
      userId,
      amount: -tokensRequired,
      type: "deduction",
      description,
      createdAt: new Date(),
    });
  });
}

// Add tokens to the user's balance
export async function addTokens(
  userId: string,
  tokensToAdd: number,
  description: string = "Token purchase"
) {
  await db.transaction(async (tx) => {
    // Atomically add tokens
    const result = await tx
      .update(users)
      .set({
        tokenBalance: sql`token_balance + ${tokensToAdd}`,
      })
      .where(eq(users.id, userId))
      .returning({ tokenBalance: users.tokenBalance });

    if (result.length === 0) {
      throw new Error("User not found");
    }

    // Record the transaction
    await tx.insert(tokenTransactions).values({
      userId,
      amount: tokensToAdd,
      type: "purchase",
      description,
      createdAt: new Date(),
    });
  });
}

// Get token transaction history for a user
export async function getTokenTransactions(userId: string) {
  return await db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(desc(tokenTransactions.createdAt));
}

// Get all active API keys for a user
export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  const keys = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId, // Include userId
      key: apiKeys.key,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      status: apiKeys.status,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.status, "active")));

  return keys;
}

// Create a new API key for a user
export async function createApiKey(userId: string): Promise<ApiKey> {
  const newKey = generateApiKey();

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      userId,
      key: newKey,
      status: "active",
      createdAt: new Date(),
    })
    .returning({
      id: apiKeys.id,
      userId: apiKeys.userId,
      key: apiKeys.key,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      status: apiKeys.status,
    });

  return apiKey;
}

// Revoke an API key
export async function revokeApiKey(userId: string, apiKeyId: string) {
  await db
    .update(apiKeys)
    .set({ status: "revoked" })
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, apiKeyId)));
}
