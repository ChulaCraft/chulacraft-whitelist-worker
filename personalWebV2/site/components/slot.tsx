import Image, { type StaticImageData } from "next/image";

// Stand-in for the prototype's <image-slot>: fills its parent, cover or contain.
// Remote URLs are passed through unoptimized; local images get a blur-up placeholder.
export default function Slot({ src, alt, fit = "cover", sizes, round, priority }: {
  src: StaticImageData | string; alt: string; fit?: "cover" | "contain"; sizes: string; round?: boolean; priority?: boolean;
}) {
  const remote = typeof src === "string";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: round ? "50%" : undefined }}>
      <Image
        src={src} alt={alt} fill sizes={sizes} priority={priority}
        unoptimized={remote} placeholder={remote ? "empty" : "blur"}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
