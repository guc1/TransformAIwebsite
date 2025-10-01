import type { CSSProperties } from "react";

import Image from "next/image";

import { TransformAILogo } from "@/components/footer/footer-svgs";
import mainboard from "@/images/mainboard.svg";
import { cn } from "@/lib/utils";

type MainboardArtworkProps = {
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
};

export function MainboardArtwork({
  className,
  priority = false,
  style,
}: MainboardArtworkProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={style}
    >
      <div className="relative h-auto w-auto">
        <Image
          src={mainboard}
          alt="Circuit board background with TransformAI overlays"
          priority={priority}
          className="h-auto w-auto"
        />
        <TransformAILogo
          variant="transparent"
          priority={priority}
          className="absolute left-[982px] top-[262px] w-[210px] max-w-none"
          sizes="210px"
        />
      </div>
    </div>
  );
}
