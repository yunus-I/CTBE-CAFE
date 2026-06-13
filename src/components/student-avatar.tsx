import Image from "next/image";
import { initials } from "@/lib/utils";

export function StudentAvatar({
  name,
  photoUrl,
  size = "lg",
}: {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-12 w-12 text-sm",
    md: "h-16 w-16 text-lg",
    lg: "h-24 w-24 text-2xl",
  };

  const containerClass = sizes[size];

  if (photoUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-brand-soft ${containerClass}`}>
        <Image src={photoUrl} alt={name} fill className="object-cover" sizes="96px" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-brand-soft font-semibold text-brand-strong ${containerClass}`}
    >
      {initials(name)}
    </div>
  );
}
