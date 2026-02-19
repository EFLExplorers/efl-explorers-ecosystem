import Image from "next/image";
import styles from "./Logo.module.css";
import Link from "next/link";
import logoPath from "../../../../public/assets/images/logo/Logo.png";

export const Logo = () => {
  // Calculate a more reasonable size while maintaining aspect ratio
  const aspectRatio = 14286 / 4086; // Original width / height
  const height = 60; // Desired height
  const width = Math.round(height * aspectRatio); // Maintain aspect ratio

  return (
    <Link href="/" className={styles.logoLink} data-cy="logo-link">
      <div className={styles.logoContainer}>
        <Image
          src={logoPath}
          alt="EFL Explorers"
          width={width}
          height={height}
          priority
          className={styles.logoImage}
          data-cy="logo-image"
        />
      </div>
    </Link>
  );
};

export default Logo;
