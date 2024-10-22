import { db } from "@/lib/db/drizzle";
import { apiKeys, users, tokenTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/lib/db/schema";
type AuthenticatedRequest = NextRequest & { user?: User };

const authenticateApiKey = async (req: AuthenticatedRequest) => {
  console.log("Authenticating API key...");

  const authHeader = req.headers.get("Authorization");
  console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Bearer token is missing");
    return new NextResponse(
      JSON.stringify({ error: "Bearer token is missing" }),
      { status: 401 }
    );
  }

  const apiKey = authHeader.split(" ")[1];
  console.log("Extracted API key:", apiKey);

  if (!apiKey) {
    console.log("Invalid Bearer token");
    return new NextResponse(JSON.stringify({ error: "Invalid Bearer token" }), {
      status: 401,
    });
  }

  try {
    console.log("Querying database for API key...");
    const apiKeyRecord = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        user: true,
      },
    });
    console.log("API key record:", JSON.stringify(apiKeyRecord, null, 2));

    if (!apiKeyRecord) {
      console.log("Invalid API key");
      return new NextResponse(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
      });
    }

    if (apiKeyRecord.status !== "active") {
      console.log("API key is not active");
      return new NextResponse(
        JSON.stringify({ error: "API key is not active" }),
        { status: 401 }
      );
    }

    console.log("Updating last used timestamp...");
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKeyRecord.id));

    console.log("Authentication successful");
    req.user = apiKeyRecord.user;
    return null;
  } catch (error) {
    console.error("Error during authentication:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

export function apiTemplate(options: {
  tokenCost: number;
  logic: (req: AuthenticatedRequest) => Promise<NextResponse>;
}) {
  return async (req: NextRequest) => {
    const authenticatedReq = req as AuthenticatedRequest;

    // Authenticate the request
    const authResponse = await authenticateApiKey(authenticatedReq);
    if (authResponse) {
      return authResponse;
    }

    if (!authenticatedReq.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has enough tokens
    if (authenticatedReq.user.tokenBalance < options.tokenCost) {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 403 }
      );
    }

    try {
      // Start a transaction
      await db.transaction(async (tx) => {
        // Deduct tokens
        const updateResult = await tx
          .update(users)
          .set({
            tokenBalance:
              Number(authenticatedReq.user!.tokenBalance) - options.tokenCost,
          })
          .where(eq(users.id, authenticatedReq.user!.id));

        // Record token transaction
        const insertResult = await tx.insert(tokenTransactions).values({
          userId: authenticatedReq.user!.id,
          amount: -options.tokenCost,
          type: "deduction",
          description: "API call",
        });
      });

      // Execute the custom logic
      return await options.logic(authenticatedReq);
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred while processing your request" },
        { status: 500 }
      );
    }
  };
}
