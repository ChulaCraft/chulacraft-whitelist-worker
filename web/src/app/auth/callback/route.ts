import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseEnvironment, getSiteUrl } from "@/lib/env";
import { safeNextPath } from "@/lib/registration";
import { createBoundedFetch } from "@/lib/bounded-fetch";
import { classifyOAuthCallbackFailure, type AuthFailureReason } from "@/lib/auth-error";

function authErrorResponse(reason: AuthFailureReason) {
  const destination = new URL("/auth/error", getSiteUrl());
  destination.searchParams.set("reason", reason);
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error");
  const providerErrorCode = url.searchParams.get("error_code");
  const next = safeNextPath(url.searchParams.get("next"));
  const destination = new URL(next, getSiteUrl());
  const response = NextResponse.redirect(destination);
  if (!code) {
    const reason = classifyOAuthCallbackFailure(providerError, providerErrorCode);
    console.warn("oauth_callback_failed", {
      reason,
      providerError: providerError?.slice(0, 64) ?? null,
      providerErrorCode: providerErrorCode?.slice(0, 64) ?? null
    });
    return authErrorResponse(reason);
  }
  const { url: supabaseUrl, key } = getPublicSupabaseEnvironment();
  const supabase = createServerClient(supabaseUrl, key, {
    global: { fetch: createBoundedFetch() },
    cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) }
  });
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("oauth_session_exchange_failed", {
        errorCode: error.code ?? null,
        status: error.status ?? null
      });
      return authErrorResponse("session_exchange_failed");
    }
    return response;
  } catch (error) {
    console.error("oauth_session_exchange_failed", {
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    return authErrorResponse("session_exchange_failed");
  }
}
