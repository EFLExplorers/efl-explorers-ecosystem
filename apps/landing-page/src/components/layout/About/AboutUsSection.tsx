import Image from "next/image";
import { PageSection } from "../../../pages/api/page-content";
import styles from "./AboutUsSection.module.css";

export interface TeamMember {
  id?: string;
  name: string;
  role?: string;
  title?: string;
  image?: string;
  bio?: string;
  expertise?: string[];
}

export interface AboutStat {
  id?: string;
  number: string;
  label: string;
}

export interface CoreValue {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface AboutUsSectionProps {
  heroSection?: PageSection | null;
  descriptionSection?: PageSection | null;
  taglineSection?: PageSection | null;
  missionSection?: PageSection | null;
  visionSection?: PageSection | null;
  teamIntroSection?: PageSection | null;
  valuesHeaderSection?: PageSection | null;
  teamMembers?: TeamMember[];
  stats?: AboutStat[];
  coreValues?: CoreValue[];
}

const getSectionText = (section?: PageSection | null, key?: string) => {
  if (!section) return "";
  const contentText = (section.content as Record<string, any> | undefined)?.[
    key || "text"
  ];
  return (
    contentText ??
    section.body ??
    section.subtitle ??
    section.title ??
    section.heading ??
    ""
  );
};

export const AboutUsSection = ({
  heroSection,
  descriptionSection,
  taglineSection,
  missionSection,
  visionSection,
  teamIntroSection,
  valuesHeaderSection,
  teamMembers,
  stats,
  coreValues,
}: AboutUsSectionProps) => {
  const safeTeamMembers = teamMembers ?? [];
  const safeStats = stats ?? [];
  const safeValues = coreValues ?? [];

  const heroTitle =
    heroSection?.title ||
    heroSection?.heading ||
    (heroSection?.content as Record<string, any> | undefined)?.title ||
    "";
  const heroSubtitle =
    heroSection?.subtitle ||
    heroSection?.subheading ||
    (heroSection?.content as Record<string, any> | undefined)?.subtitle ||
    "";

  const descriptionText = getSectionText(descriptionSection, "body");

  const taglineText = getSectionText(taglineSection, "text");

  const missionTitle =
    missionSection?.title ||
    missionSection?.heading ||
    (missionSection?.content as Record<string, any> | undefined)?.title ||
    "";
  const missionBody = getSectionText(missionSection, "body");
  const missionPoints = ((
    missionSection?.content as Record<string, any> | undefined
  )?.points || []) as string[];

  const visionTitle =
    visionSection?.title ||
    visionSection?.heading ||
    (visionSection?.content as Record<string, any> | undefined)?.title ||
    "";
  const visionBody = getSectionText(visionSection, "body");
  const visionGoals = ((
    visionSection?.content as Record<string, any> | undefined
  )?.goals || []) as string[];

  const teamIntroTitle =
    teamIntroSection?.title ||
    teamIntroSection?.heading ||
    (teamIntroSection?.content as Record<string, any> | undefined)?.title ||
    "";
  const teamIntroBody = getSectionText(teamIntroSection, "body");

  const valuesHeaderTitle =
    valuesHeaderSection?.title ||
    valuesHeaderSection?.heading ||
    (valuesHeaderSection?.content as Record<string, any> | undefined)?.title ||
    "";

  return (
    <section className={styles.aboutUs} data-cy="about-page">
      <div className={styles.container}>
        {heroTitle || heroSubtitle ? (
          <div className={styles.heroSection}>
            {heroTitle ? (
              <h1 className={styles.title} data-cy="about-title">
                {heroTitle}
              </h1>
            ) : null}
            {heroSubtitle ? (
              <div className={styles.subtitle} data-cy="about-subtitle">
                {heroSubtitle}
              </div>
            ) : null}
          </div>
        ) : null}

        {descriptionText || safeStats.length ? (
          <div className={styles.description} data-cy="about-description">
            {descriptionText ? <p>{descriptionText}</p> : null}
            {safeStats.length ? (
              <div className={styles.statsGrid} data-cy="about-stats">
                {safeStats.map((stat) => (
                  <div
                    key={`${stat.id || stat.label}-${stat.number}`}
                    className={styles.statItem}
                    data-cy="about-stat"
                  >
                    <div className={styles.statNumber}>{stat.number}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {taglineText ? (
          <div className={styles.tagline} data-cy="about-tagline">
            <span className={styles.quoteMark}>"</span>
            {taglineText}
            <span className={styles.quoteMark}>"</span>
          </div>
        ) : null}

        <div className={styles.infoSections}>
          {missionTitle || missionBody || missionPoints.length ? (
            <div className={styles.mission} data-cy="about-mission">
              <div className={styles.sectionHeader}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>🎯</span>
                </div>
                {missionTitle ? <h2>{missionTitle}</h2> : null}
              </div>
              {missionBody ? <p>{missionBody}</p> : null}
              {missionPoints.length ? (
                <div className={styles.missionPoints}>
                  {missionPoints.map((point, index) => (
                    <div key={`${point}-${index}`} className={styles.point}>
                      {point}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {visionTitle || visionBody || visionGoals.length ? (
            <div className={styles.vision} data-cy="about-vision">
              <div className={styles.sectionHeader}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>🔮</span>
                </div>
                {visionTitle ? <h2>{visionTitle}</h2> : null}
              </div>
              {visionBody ? <p>{visionBody}</p> : null}
              {visionGoals.length ? (
                <div className={styles.visionGoals}>
                  {visionGoals.map((goal, index) => (
                    <div key={`${goal}-${index}`} className={styles.goal}>
                      {goal}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {safeTeamMembers.length ? (
            <div className={styles.team} data-cy="about-team">
              <div className={styles.sectionHeader}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>👥</span>
                </div>
                {teamIntroTitle ? <h2>{teamIntroTitle}</h2> : null}
              </div>
              {teamIntroBody ? (
                <p className={styles.teamIntro}>{teamIntroBody}</p>
              ) : null}
              <div className={styles.teamGrid} data-cy="about-team-grid">
                {safeTeamMembers.map((member) => (
                  <div
                    key={member.id || member.name}
                    className={styles.teamMember}
                    data-cy="about-team-member"
                  >
                    {member.image ? (
                      <div className={styles.memberImage}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={120}
                          height={120}
                          className={styles.memberPhoto}
                        />
                        <div className={styles.memberOverlay}>
                          <div className={styles.socialLinks}>
                            <span className={styles.socialIcon}>💼</span>
                            <span className={styles.socialIcon}>📧</span>
                            <span className={styles.socialIcon}>🔗</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className={styles.memberInfo}>
                      <h3>{member.name}</h3>
                      {member.role && (
                        <p className={styles.memberRole}>{member.role}</p>
                      )}
                      {member.title && (
                        <p className={styles.memberTitle}>{member.title}</p>
                      )}
                      {member.bio && (
                        <p className={styles.memberBio}>{member.bio}</p>
                      )}
                      {member.expertise?.length ? (
                        <div className={styles.expertise}>
                          {member.expertise.map((skill, skillIndex) => (
                            <span
                              key={`${member.name}-${skill}-${skillIndex}`}
                              className={styles.skillTag}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {safeValues.length ? (
          <div className={styles.values} data-cy="about-values">
            {valuesHeaderTitle ? <h2>{valuesHeaderTitle}</h2> : null}
            <div className={styles.valuesGrid} data-cy="about-values-grid">
              {safeValues.map((value) => (
                <div
                  key={value.id || value.title}
                  className={styles.value}
                  data-cy="about-value"
                >
                  {value.icon ? (
                    <div className={styles.valueIcon}>{value.icon}</div>
                  ) : null}
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
