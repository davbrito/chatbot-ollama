import type { Context } from "hono";
import type { AppEnv } from "./config";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(c: Context<AppEnv>) {
  const secret = c.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return null;
  }

  const token = c.req.header("CF-Turnstile-Token")?.trim();
  if (!token) {
    return c.json({ error: "Missing Turnstile token" }, 400);
  }

  const remoteip = c.req.header("CF-Connecting-IP");
  const formData = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteip) {
    formData.set("remoteip", remoteip);
  }

  const verificationResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: formData,
    },
  );

  if (!verificationResponse.ok) {
    return c.json({ error: "Turnstile verification unavailable" }, 502);
  }

  const result = (await verificationResponse.json()) as TurnstileVerifyResponse;
  if (!result.success) {
    return c.json(
      {
        error: "Turnstile verification failed",
        codes: result["error-codes"] ?? [],
      },
      403,
    );
  }

  return null;
}
