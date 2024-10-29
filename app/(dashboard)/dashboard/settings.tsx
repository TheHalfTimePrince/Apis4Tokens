"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState } from "react";
import { User, ApiKey } from "@/lib/db/schema";
import {
  getUserTokenBalance,
  getApiKeys,
  createApiKey,
  revokeApiKey,
} from "@/lib/db/queries";
import { useRouter } from "next/navigation";

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ user }: { user: User }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionState, setActionState] = useState<ActionState>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const router = useRouter();
  // Fetch token balance and API keys on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [balance, keys] = await Promise.all([
          getUserTokenBalance(user.id),
          getApiKeys(user.id),
        ]);
        setTokenBalance(balance);
        setApiKeys(keys);
      } catch (error) {
        setActionState({ error: "Failed to load data" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user.id]);

  // Handle API key generation
  const handleGenerateApiKey = async () => {
    setIsGenerating(true);
    try {
      const newApiKey: ApiKey = await createApiKey(user.id);

      setApiKeys((prevKeys) => [...prevKeys, newApiKey]);
      setActionState({ success: "API key generated successfully" });
    } catch (error) {
      setActionState({ error: "Failed to generate API key" });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle API key revocation
  const handleRevokeApiKey = async (apiKeyId: string) => {
    try {
      await revokeApiKey(user.id, apiKeyId);
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== apiKeyId));
      setActionState({ success: "API key revoked successfully" });
    } catch (error) {
      setActionState({ error: "Failed to revoke API key" });
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">API Settings</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Token Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              <p className="text-xl font-bold">{tokenBalance} Tokens</p>
              <Button variant="outline" onClick={() => router.push("/pricing")}>
                Purchase More Tokens
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {actionState.error && (
            <p className="text-red-500 mb-4">{actionState.error}</p>
          )}
          {actionState.success && (
            <p className="text-green-500 mb-4">{actionState.success}</p>
          )}
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <p>No API keys found. Generate one below.</p>
            ) : (
              <ul className="space-y-4">
                {apiKeys.map((key) => (
                  <li
                    key={key.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono">{key.key}</p>
                      <p className="text-sm text-muted-foreground">
                        Created at: {new Date(key.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeApiKey(key.id)}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="default"
              onClick={handleGenerateApiKey}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate New API Key"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
