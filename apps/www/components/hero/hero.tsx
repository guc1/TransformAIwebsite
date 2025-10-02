"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { HeroMainSection } from "./hero-main-section";

import mainboard from "@/images/mainboard.svg";
import { SubHeroMainboard } from "./hero-sub-mainboard";
export const Hero: React.FC = () => {
  const hero = useTranslations("Hero");
  const cta = useTranslations("CTA");
  const locale = useLocale();
  const meetingHref = `/${locale}/meeting`;

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
          primaryCtaHref={meetingHref}
          secondaryCtaLabel={cta("exploreProjects")}
          hoursSavedLabel={cta("hoursSavedLabel")}
          hoursSavedAmount={cta("hoursSavedAmount")}
        />
      </motion.div>

      <div
        className="absolute hidden xl:flex -z-10 xl:-top-56 xl:right-32"
        aria-hidden="true"
      >
        <div className="relative" style={{ transform: "scale(2)" }}>
          <Image
            src={mainboard}
            alt="Animated SVG showing computer circuits lighting up"
            className="pointer-events-none select-none"
            priority
          />
          <div className="hero-mainboard-lights">
            <span className="hero-mainboard-light hero-mainboard-light--one" />
            <span className="hero-mainboard-light hero-mainboard-light--two" />
            <span className="hero-mainboard-light hero-mainboard-light--three" />
          </div>
        </div>
      </div>
      <SubHeroMainboard className="absolute hidden md:flex left-1/2 -translate-x-[calc(50%+85px)] -bottom-[224px] -z-10" />
    </motion.div>
  );
};
