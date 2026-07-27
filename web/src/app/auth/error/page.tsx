import Link from "next/link";
import { Brand } from "@/components/brand";
import { authFailureMessage, safeAuthFailureReason } from "@/lib/auth-error";

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const reason = safeAuthFailureReason((await searchParams).reason);
  return <main className="simple-page"><Brand /><section className="simple-card"><span className="error-symbol">!</span><h1>Discord sign-in didn’t finish</h1><p>{authFailureMessage(reason)}</p><Link className="button button-primary" href="/">Try again</Link></section></main>;
}
