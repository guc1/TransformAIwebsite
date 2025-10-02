"use client";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeroMainSection } from "./hero-main-section";

import mainboard from "@/images/mainboard.svg";
import { SubHeroMainboard } from "./hero-sub-mainboard";
type HoursSavedResponse = {
  total?: number;
  nextUpdateAt?: string | null;
};

const FALLBACK_POLL_INTERVAL = 1000 * 60 * 5;

export const Hero: React.FC = () => {
  const hero = useTranslations("Hero");
  const cta = useTranslations("CTA");
  const locale = useLocale();
  const meetingHref = `/${locale}/meeting`;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fallbackAmount = useMemo(() => {
    const raw = cta("hoursSavedAmount");
    const digits = Number.parseInt(raw.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(digits) ? digits : 0;
  }, [cta]);

  const [hoursSaved, setHoursSaved] = useState(() => fallbackAmount);
  const [nextUpdateAt, setNextUpdateAt] = useState<string | null>(null);

  const fetchHoursSaved = useCallback(async () => {
    try {
      const response = await fetch("/api/hours-saved", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load hours saved: ${response.status}`);
      }

      const payload = (await response.json()) as HoursSavedResponse;

      if (typeof payload.total === "number" && Number.isFinite(payload.total)) {
        if (isMountedRef.current) {
          setHoursSaved(payload.total);
        }
      }

      if (isMountedRef.current) {
        setNextUpdateAt(payload.nextUpdateAt ?? null);
      }
    } catch (error) {
      console.error("Unable to refresh hours saved counter", error);
    }
  }, []);

  useEffect(() => {
    setHoursSaved((current) => {
      if (!Number.isFinite(current)) {
        return fallbackAmount;
      }

      return current;
    });
  }, [fallbackAmount]);

  useEffect(() => {
    void fetchHoursSaved();

    const intervalId = window.setInterval(() => {
      void fetchHoursSaved();
    }, FALLBACK_POLL_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchHoursSaved]);

  useEffect(() => {
    if (!nextUpdateAt) {
      return;
    }

    const nextUpdateMs = new Date(nextUpdateAt).getTime();
    if (Number.isNaN(nextUpdateMs)) {
      return;
    }

    const delay = nextUpdateMs - Date.now();
    if (delay <= 0) {
      void fetchHoursSaved();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchHoursSaved();
    }, delay + 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [nextUpdateAt, fetchHoursSaved]);

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
          hoursSavedAmount={<AnimatedHoursSaved value={hoursSaved} locale={locale} />}
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

type AnimatedHoursSavedProps = {
  value: number;
  locale: string;
};

function AnimatedHoursSaved({ value, locale }: AnimatedHoursSavedProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => {
      unsubscribe();
    };
  }, [motionValue]);

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      setDisplayValue(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => {
      controls.stop();
    };
  }, [motionValue, shouldReduceMotion, value]);

  const formattedValue = useMemo(
    () => new Intl.NumberFormat(locale).format(displayValue),
    [displayValue, locale],
  );

  return <>{formattedValue}+</>;
}
