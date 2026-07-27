export type AuthFailureReason =
  | "cancelled"
  | "provider_error"
  | "callback_missing_code"
  | "session_exchange_failed"
  | "start_failed";

export function classifyOAuthCallbackFailure(
  error: string | null,
  errorCode: string | null
): AuthFailureReason {
  if (error === "access_denied" || errorCode === "access_denied") return "cancelled";
  if (error || errorCode) return "provider_error";
  return "callback_missing_code";
}

export function safeAuthFailureReason(value: string | undefined): AuthFailureReason {
  switch (value) {
    case "cancelled":
    case "provider_error":
    case "callback_missing_code":
    case "session_exchange_failed":
    case "start_failed":
      return value;
    default:
      return "provider_error";
  }
}

export function authFailureMessage(reason: AuthFailureReason) {
  switch (reason) {
    case "cancelled":
      return "Discord authorization was cancelled. No account was connected.";
    case "provider_error":
      return "Discord could not complete authorization. The site owner should check the Discord provider credentials in Supabase.";
    case "callback_missing_code":
      return "The sign-in response was incomplete. Start again from this browser and finish within a few minutes.";
    case "session_exchange_failed":
      return "Discord authorized the account, but the secure session could not be created. Please start again in the same browser.";
    case "start_failed":
      return "The Discord sign-in request could not be started. Please refresh the page and try again.";
  }
}
