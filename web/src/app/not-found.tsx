import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFoundPage() {
  return <main className="simple-page">
    <Brand />
    <section className="simple-card">
      <span className="error-symbol error-symbol-neutral">404</span>
      <h1>This chunk is unexplored</h1>
      <p>The page you were looking for is not part of this world. Head back to Chulacraft and continue your adventure.</p>
      <Link className="button button-primary" href="/">Return home</Link>
    </section>
  </main>;
}
