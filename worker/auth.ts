import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwt, sign } from "hono/jwt";
import type { AppEnv } from "./config";
import { verifyTurnstile } from "./turnstile";

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 2; // 2 hours
const SESSION_COOKIE_NAME = "chat_session";

function getSessionTtl(c: Context<AppEnv>) {
  const raw = c.env.SESSION_JWT_TTL_SECONDS;
  if (!raw) return DEFAULT_SESSION_TTL_SECONDS;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_SESSION_TTL_SECONDS;
  }

  return parsed;
}

function getJwtSecret(c: Context<AppEnv>) {
  return c.env.JWT_SECRET_KEY?.trim();
}

export async function startSession(c: Context<AppEnv>) {
  const turnstileError = await verifyTurnstile(c);
  if (turnstileError) {
    return turnstileError;
  }

  const jwtSecret = getJwtSecret(c);
  if (!jwtSecret) {
    deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
    return c.json({ authEnabled: false });
  }

  const ttl = getSessionTtl(c);
  const now = Math.floor(Date.now() / 1000);
  const token = await sign(
    { sub: "chat-session", iat: now, exp: now + ttl },
    jwtSecret,
  );

  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: "Lax",
    path: "/",
    maxAge: ttl,
  });

  return c.json({
    authEnabled: true,
    expiresIn: ttl,
  });
}

export const sessionJwtMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const jwtSecret = getJwtSecret(c);
    if (!jwtSecret) {
      return c.json({ error: "Authentication not configured" }, 500);
    }

    return jwt({
      alg: "HS256",
      secret: jwtSecret,
      cookie: SESSION_COOKIE_NAME,
    })(c, next);
  },
);
