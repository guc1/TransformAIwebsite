"use client";

import { useEffect } from "react";

import { VISITOR_COOKIE_NAME } from "@/lib/visitors/constants";

const STORAGE_KEY = "transformai:visitor-session:initialized";

export function VisitorSessionInitializer() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const hasVisitorCookie = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith(`${VISITOR_COOKIE_NAME}=`));

    try {
      if (hasVisitorCookie) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        return;
      }

      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        return;
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Visitor session storage unavailable", error);
      }
    }

    const controller = new AbortController();

    async function registerVisitor() {
      try {
        const response = await fetch("/api/visitor-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          keepalive: true,
        });

        if (response.ok) {
          const cookieRegistered = document.cookie
            .split(";")
            .some((cookie) =>
              cookie.trim().startsWith(`${VISITOR_COOKIE_NAME}=`),
            );

          if (!cookieRegistered) {
            return;
          }

          try {
            sessionStorage.setItem(STORAGE_KEY, "1");
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.error("Visitor session storage unavailable", error);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to register visitor session", error);
        }
      }
    }

    registerVisitor();

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
