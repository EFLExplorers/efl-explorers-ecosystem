import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "./SideRail.module.css";

type RailItem = {
  id: string;
  label: string;
};

export const SideRail = () => {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>("hero");
  const lastActiveRef = useRef<string>("");

  const items = useMemo<RailItem[]>(() => {
    if (router.pathname === "/") {
      return [
        { id: "hero", label: "Hero" },
        { id: "tagline", label: "Tagline" },
        { id: "learning-tools", label: "Learning Tools" },
        { id: "how-we-teach", label: "How We Teach" },
        { id: "services", label: "Services" },
        { id: "pricing", label: "Pricing" },
        { id: "register-cta", label: "Get Started" },
      ];
    }

    if (router.pathname === "/platforms/teacher") {
      return [
        { id: "teacher-hero", label: "Hero" },
        { id: "teaching-tools", label: "Tools" },
        { id: "lesson-modules", label: "Modules" },
        { id: "teacher-benefits", label: "Benefits" },
        { id: "teacher-cta", label: "Get Started" },
      ];
    }

    if (router.pathname === "/platforms/student") {
      return [
        { id: "student-hero", label: "Hero" },
        { id: "student-characters", label: "Characters" },
        { id: "student-planets", label: "Planets" },
        { id: "student-cta", label: "Get Started" },
      ];
    }

    if (router.pathname === "/about") {
      return [
        { id: "about-hero", label: "Hero" },
        { id: "about-description", label: "About" },
        { id: "about-tagline", label: "Tagline" },
        { id: "about-mission", label: "Mission" },
        { id: "about-vision", label: "Vision" },
        { id: "about-team", label: "Team" },
        { id: "about-values", label: "Values" },
      ];
    }

    if (router.pathname === "/contact") {
      return [
        { id: "contact-hero", label: "Hero" },
        { id: "contact-form", label: "Form" },
        { id: "faq", label: "FAQ" },
      ];
    }

    return [];
  }, [router.pathname]);

  useEffect(() => {
    if (!items.length) return;

    const getHeaderOffset = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const headerValue = rootStyles
        .getPropertyValue("--header-height")
        .trim();
      if (!headerValue) return 64;
      if (headerValue.endsWith("rem")) {
        const rem = Number.parseFloat(headerValue);
        const base = Number.parseFloat(
          rootStyles.getPropertyValue("font-size") || "16"
        );
        return rem * base;
      }
      if (headerValue.endsWith("px")) {
        return Number.parseFloat(headerValue);
      }
      return Number.parseFloat(headerValue) || 64;
    };

    let frame: number | null = null;
    let intervalId: number | null = null;

    const updateActive = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        const headerOffset = getHeaderOffset();
        const scrollPosition = window.scrollY + headerOffset + 12;

        let nextId = items[0]?.id ?? "";
        let matched = false;
        items.forEach((item) => {
          const element = document.getElementById(item.id);
          if (!element) return;
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const bottom = top + rect.height;
          if (scrollPosition >= top && scrollPosition < bottom) {
            nextId = item.id;
            matched = true;
          }
          if (!matched && top <= scrollPosition) {
            nextId = item.id;
          }
        });

        if (nextId && lastActiveRef.current !== nextId) {
          lastActiveRef.current = nextId;
          setActiveId(nextId);
        }
      });
    };

    const onScroll = () => updateActive();
    const onResize = () => updateActive();
    const onHashChange = () => updateActive();

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("hashchange", onHashChange);
    intervalId = window.setInterval(() => updateActive(), 250);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHashChange);
      if (intervalId) window.clearInterval(intervalId);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items, router.pathname]);

  if (!items.length) return null;

  return (
    <nav className={styles.rail} aria-label="Section navigation">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`${styles.link} ${
            activeId === item.id ? styles.active : ""
          }`}
          data-active={activeId === item.id ? "true" : "false"}
          aria-current={activeId === item.id ? "true" : "false"}
        >
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.label}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};
