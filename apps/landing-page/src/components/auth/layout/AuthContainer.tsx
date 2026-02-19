import { AuthContainerProps } from "../types/auth.types";
import layoutStyles from "../styles/AuthContainer.module.css";

export const AuthContainer = ({
  children,
  title,
  subtitle,
}: AuthContainerProps) => {
  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.formContainer}>
        <h1 className={layoutStyles.title}>{title}</h1>
        {subtitle && <p className={layoutStyles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};
