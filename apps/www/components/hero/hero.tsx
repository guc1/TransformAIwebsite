"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeroMainSection } from "./hero-main-section";

import mainboard from "@/images/mainboard.svg";
import { SubHeroMainboard } from "./hero-sub-mainboard";
export const Hero: React.FC = () => {
  const t = useTranslations("Hero");
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
      className="relative w-full flex flex-col items-center justify-between mt-24 sm:mt-28 md:mt-32 lg:mt-36 xl:mt-40 pb-20 sm:pb-24 md:pb-32 lg:pb-36"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={childVariants}>
        <HeroMainSection
          title={t("title")}
          body={t("body")}
          primaryCtaLabel={cta("getStarted")}
          secondaryCtaLabel={cta("exploreProjects")}
        />
      </motion.div>

      <div>
        <Image
          src={mainboard}
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
