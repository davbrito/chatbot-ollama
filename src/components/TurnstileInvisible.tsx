import {
  setTurnstileError,
  setTurnstileToken,
  TURNSTILE_SITEKEY,
} from "@/lib/turnstile";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

export function TurnstileInvisible() {
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  if (!TURNSTILE_SITEKEY) {
    return null;
  }

  return (
    <Turnstile
      ref={turnstileRef}
      siteKey={TURNSTILE_SITEKEY}
      id="turnstile-widget"
      options={{
        size: "invisible",
        action: "chat_request",
      }}
      scriptOptions={{
        id: "turnstile-script",
      }}
      onSuccess={(token) => {
        setTurnstileToken(token);
      }}
      onError={() => {
        setTurnstileError("Fallo la validacion de Turnstile");
      }}
      onExpire={() => {
        setTurnstileError("Turnstile expiro");
      }}
      onTimeout={() => {
        setTurnstileError("Turnstile timeout");
      }}
    />
  );
}
