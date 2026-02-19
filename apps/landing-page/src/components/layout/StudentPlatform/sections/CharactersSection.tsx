import Image from "next/image";
import styles from "@/pages/platforms/student.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface StudentCharacter {
  slug: string;
  name: string;
  imageUrl: string;
}

export interface StudentCharactersSectionProps {
  section: PageSection | null;
  characters: StudentCharacter[];
}

export const StudentCharactersSection = ({
  section,
  characters,
}: StudentCharactersSectionProps) => {
  if (!section) return null;
  if (!characters?.length) return null;

  const intro = (section.content as any)?.intro ?? "";
  const outro = (section.content as any)?.outro ?? "";

  return (
    <section className={styles.characters} data-cy="student-characters-section">
      <div className={styles.characterContent}>
        <div className={styles.characterGridContainer}>
          <p className={styles.characterText} data-cy="student-characters-copy">
            {intro}
          </p>
          <div
            className={styles.characterGrid}
            data-cy="student-characters-grid"
          >
            {characters.map((character) => (
              <div
                key={character.slug}
                className={styles.characterCircle}
                data-cy="student-character-card"
              >
                <div className={styles.characterAvatar}>
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    width={80}
                    height={80}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className={styles.characterName}>{character.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.featureText} data-cy="student-characters-outro">
          <p>{outro}</p>
        </div>
      </div>
    </section>
  );
};
