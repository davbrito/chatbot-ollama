const turnstilePromise = Promise.withResolvers<string>();

export function setTurnstileError(newError: string) {
  console.error("Turnstile error:", newError);
  turnstilePromise.reject(newError);
}

export function setTurnstileToken(newToken: string) {
  turnstilePromise.resolve(newToken);
}

export function getTurnstileToken() {
  let timeoutId: number | undefined;
  return Promise.race([
    turnstilePromise.promise,
    new Promise<string>(
      (_, reject) =>
        (timeoutId = setTimeout(
          () => reject(new Error("Turnstile validation timed out")),
          60000,
        )),
    ),
  ]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
}

export const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
