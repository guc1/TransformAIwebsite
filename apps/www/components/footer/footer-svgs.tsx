import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "transparent";

const LOGO_ASSETS: Record<LogoVariant, { src: string; width: number; height: number }> = {
  dark: {
    src: "/images/logos/transformai/Darklogoenhanced.png",
    width: 1684,
    height: 769,
  },
  transparent: {
    src: "/images/logos/transformai/logotransparant.png",
    width: 1506,
    height: 650,
  },
};

type TransformAILogoProps = {
  className?: string;
  variant?: LogoVariant;
  priority?: boolean;
  sizes?: string;
};

export function TransformAILogo({
  className,
  variant = "dark",
  priority,
  sizes = "(max-width: 768px) 140px, 200px",
}: TransformAILogoProps) {
  const asset = LOGO_ASSETS[variant];

  return (
    <Image
      src={asset.src}
      alt="TransformAI logo"
      width={asset.width}
      height={asset.height}
      priority={priority}
      sizes={sizes}
      className={cn("h-10 w-auto", className)}
    />
  );
}
