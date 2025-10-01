"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeroMainSection } from "./hero-main-section";

import { SubHeroMainboard } from "./hero-sub-mainboard";

const MAINBOARD_IMAGE_SRC = "/images/logos/transformai/mainbordtransform.svg";
export const Hero: React.FC = () => {
  const hero = useTranslations("Hero");
  const cta = useTranslations("CTA");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="relative w-full flex flex-col items-center justify-between mt-48"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={childVariants}>
        <HeroMainSection
          title={hero("title")}
          body={hero("body")}
          primaryCtaLabel={cta("getStarted")}
          secondaryCtaLabel={cta("exploreProjects")}
          hoursSavedLabel={cta("hoursSavedLabel")}
          hoursSavedAmount={cta("hoursSavedAmount")}
        />
      </motion.div>

      <div>
        <Image
          src={MAINBOARD_IMAGE_SRC}
          width={1512}
          height={546}
          unoptimized
          alt="Animated SVG showing computer circuits lighting up"
          className="absolute hidden xl:right-32 xl:flex -z-10 xl:-top-56"
          style={{ transform: "scale(2)" }}
          priority
        />
      </div>
      <SubHeroMainboard className="absolute hidden md:flex left-1/2 -translate-x-[calc(50%+85px)] -bottom-[224px] -z-10" />
    </motion.div>
  );
};
