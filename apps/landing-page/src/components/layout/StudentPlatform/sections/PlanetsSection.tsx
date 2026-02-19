import { useEffect, useMemo, useState } from "react";
import styles from "@/pages/platforms/student.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface StudentPlanet {
  slug: string;
  name: string;
  color: string;
  icon: string;
}

export interface StudentPlanetsSectionProps {
  section: PageSection | null;
  planets: StudentPlanet[];
}

export const StudentPlanetsSection = ({
  section,
  planets,
}: StudentPlanetsSectionProps) => {
  if (!section) return null;
  if (!planets?.length) return null;

  const title = (section.content as any)?.title ?? "";
  const toggleOnLabel = (section.content as any)?.toggle_on_label ?? "";
  const toggleOffLabel = (section.content as any)?.toggle_off_label ?? "";
  const autoplayMs = Number((section.content as any)?.autoplay_ms || 5000);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % planets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + planets.length) % planets.length);
  };

  const calculatePlanetStyle = useMemo(
    () => (index: number) => {
      const angle = (360 / planets.length) * index;
      const radius = 300;
      const zOffset = Math.cos((angle * Math.PI) / 180) * 100;

      return {
        "--planet-color": planets[index].color,
        transform: `
          rotate(${angle + (isSpinning ? currentSlide * 36 : 0)}deg)
          translateX(${radius}px)
          scale(${index === currentSlide ? 1.2 : 0.8})
          translateZ(${zOffset}px)
        `,
        zIndex: Math.round(zOffset),
      } as React.CSSProperties;
    },
    [currentSlide, isSpinning]
  );

  useEffect(() => {
    if (isSpinning) {
      const timer = setInterval(nextSlide, autoplayMs);
      return () => clearInterval(timer);
    }
  }, [isSpinning, autoplayMs]);

  return (
    <section className={styles.planets} data-cy="student-planets-section">
      <h2 data-cy="student-planets-title">{title}</h2>
      <div className={styles.planetCarousel}>
        <button
          className={styles.carouselButton}
          onClick={prevSlide}
          aria-label="Previous planet"
          data-cy="student-planets-prev"
        >
          &lt;
        </button>

        <div className={styles.planetCircles}>
          <div className={styles.windmill} data-cy="student-planets-windmill">
            {planets.map((planet, index) => (
              <div
                key={planet.name}
                className={`${styles.planetCircle} ${
                  index === currentSlide ? styles.activePlanet : ""
                }`}
                style={calculatePlanetStyle(index)}
                onClick={() => {
                  setCurrentSlide(index);
                  setIsSpinning(false);
                }}
                data-cy="student-planet-circle"
                data-planet-name={planet.name}
                aria-label={planet.name}
              >
                <span className={styles.planetIcon} aria-hidden="true">
                  {planet.icon}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.carouselButton}
          onClick={nextSlide}
          aria-label="Next planet"
          data-cy="student-planets-next"
        >
          &gt;
        </button>
      </div>
      <p className={styles.planetName} data-cy="student-planet-name">
        {planets[currentSlide].name}
      </p>
      <button
        className={`${styles.spinButton} ${isSpinning ? styles.active : ""}`}
        onClick={() => setIsSpinning(!isSpinning)}
        data-cy="student-planets-toggle"
      >
        {isSpinning ? toggleOnLabel : toggleOffLabel}
      </button>
    </section>
  );
};
