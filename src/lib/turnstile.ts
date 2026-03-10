export const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITE_KEY!;
let turnstilePromise: PromiseWithResolvers<string> | null = null;

export function getTurnstileToken() {
  if (turnstilePromise) return turnstilePromise.promise;
  if (!TURNSTILE_SITEKEY)
    return Promise.reject(new Error("Turnstile site key is not configured"));

  const p = (turnstilePromise = Promise.withResolvers<string>());

  const widgetId = turnstile.render("#turnstile-widget", {
    sitekey: TURNSTILE_SITEKEY,
    action: "chat_request",
    callback(token) {
      p.resolve(token);
    },
    "error-callback"(error) {
      p.reject(new Error("Turnstile validation failed: " + error));
    },
    "timeout-callback"() {
      p.reject(new Error("Turnstile validation timed out"));
    },
  });

  return p.promise.finally(() => {
    turnstilePromise = null;
    if (widgetId) turnstile.remove(widgetId);
  });
}
