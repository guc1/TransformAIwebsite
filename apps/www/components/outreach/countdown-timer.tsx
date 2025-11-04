"use client";

import { useEffect, useMemo, useState } from "react";

interface CountdownTimerProps {
  target: string;
  runningTemplate: string;
  expiredLabel: string;
}

function buildLabel(
  target: string,
  runningTemplate: string,
  expiredLabel: string,
): { label: string; expired: boolean } {
  const targetTime = new Date(target).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (!Number.isFinite(targetTime) || diff <= 0) {
    return { label: expiredLabel, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  parts.push(`${hours.toString().padStart(2, "0")}h`);
  parts.push(`${minutes.toString().padStart(2, "0")}m`);
  parts.push(`${seconds.toString().padStart(2, "0")}s`);

  const formatted = parts.join(" ");

  return {
    label: runningTemplate.replace("{time}", formatted),
    expired: false,
  };
}

export function CountdownTimer({ target, runningTemplate, expiredLabel }: CountdownTimerProps) {
  const initial = useMemo(() => buildLabel(target, runningTemplate, expiredLabel), [
    target,
    runningTemplate,
    expiredLabel,
  ]);
  const [label, setLabel] = useState(initial.label);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = buildLabel(target, runningTemplate, expiredLabel);
      setLabel(next.label);

      if (next.expired) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [target, runningTemplate, expiredLabel]);

  return <p className="text-lg font-semibold text-white">{label}</p>;
}
