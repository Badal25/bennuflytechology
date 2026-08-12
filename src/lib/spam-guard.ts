import { useRef } from "react";

/** Minimum time a genuine human takes to fill a form. */
const MIN_FILL_MS = 3000;
/** Minimum gap between two submissions from the same browser. */
const COOLDOWN_MS = 30_000;

export type SpamCheck = { ok: true } | { ok: false; reason: string };

export function useSpamGuard(key: string) {
  const mountedAt = useRef(Date.now());
  const honeypot = useRef("");

  function setHoneypot(v: string) {
    honeypot.current = v;
  }

  function check(): SpamCheck {
    if (honeypot.current.trim() !== "") {
      return { ok: false, reason: "Your submission could not be verified. Please try again." };
    }
    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      return { ok: false, reason: "That was too quick — please take a moment and submit again." };
    }
    try {
      const last = Number(localStorage.getItem(`bf_submit_${key}`) ?? 0);
      if (last && Date.now() - last < COOLDOWN_MS) {
        return { ok: false, reason: "You just submitted this form. Please wait a moment before trying again." };
      }
    } catch {
      /* storage unavailable — skip rate limit */
    }
    return { ok: true };
  }

  function markSubmitted() {
    try {
      localStorage.setItem(`bf_submit_${key}`, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  function reset() {
    mountedAt.current = Date.now();
    honeypot.current = "";
  }

  return { setHoneypot, check, markSubmitted, reset };
}
