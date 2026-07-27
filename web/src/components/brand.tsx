import Link from "next/link";
import Image from "next/image";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Chulacraft home">
      <Image className="brand-crest" src="/images/chulacraft-logo.webp" alt="" width={160} height={160} priority />
      <span>
        <strong>ChulaCraft</strong>
        <small>MINECRAFT SERVER</small>
      </span>
    </Link>
  );
}
