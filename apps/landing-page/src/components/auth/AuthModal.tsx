import styles from "./Styles/AuthModal.module.css";
import { LoginForm } from "./LoginForm";
import { authHelpers } from "./authHelpers";

const AuthModal = () => {
  const { handleLogin } = authHelpers();

  return (
    <div className={styles.authModal}>
      <LoginForm platform="student" />
    </div>
  );
};

export default AuthModal;
