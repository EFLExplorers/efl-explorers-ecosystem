import { useState } from "react";
import styles from "@/styles/Auth.module.css";

export default function RegisterForm({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"student" | "teacher" | "">(
    ""
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!accountType) {
      setError("⚠️ Please select an account type (Student or Teacher)");
      return;
    }

    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ") || "User";

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName: firstName || "User",
        lastName,
        platform: accountType,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error || "Registration failed");
      return;
    }

    setSuccess("✅ Registration successful! You can now log in.");
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <label>
            <input
              type="radio"
              name="accountType"
              value="student"
              checked={accountType === "student"}
              onChange={() => setAccountType("student")}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              name="accountType"
              value="teacher"
              checked={accountType === "teacher"}
              onChange={() => setAccountType("teacher")}
            />
            Teacher
          </label>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button onClick={closeModal} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
}
