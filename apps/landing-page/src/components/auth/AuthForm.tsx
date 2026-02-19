import { useState } from "react";
import styles from "./Styles/AuthForm.module.css";

interface AuthFormProps {
  userType: "student" | "teacher";
}

const AuthForm: React.FC<AuthFormProps> = ({ userType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Logging in ${userType} with`, { email, password });
  };

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.heading}>
        {userType === "student" ? "Student Login" : "Teacher Login"}
      </h1>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button}>
          Login
        </button>
      </form>
      <p>
        Don&apos;t have an account?{" "}
        <a href="/signup" className={styles.link}>
          Sign up here
        </a>
      </p>
    </div>
  );
};

export default AuthForm;
