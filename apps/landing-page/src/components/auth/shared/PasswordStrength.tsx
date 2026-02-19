import React from "react";
import sharedStyles from "../styles/shared.module.css";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const getStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 1) return { level: "weak", color: "#ef4444", text: "Weak" };
    if (score <= 3) return { level: "medium", color: "#f59e0b", text: "Medium" };
    return { level: "strong", color: "#22c55e", text: "Strong" };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className={sharedStyles.passwordStrength}>
      <div className={sharedStyles.strengthBar}>
        <div 
          className={sharedStyles.strengthFill}
          style={{ 
            width: `${(password.length > 0 ? getStrength(password).level === "weak" ? 33 : getStrength(password).level === "medium" ? 66 : 100 : 0)}%`,
            backgroundColor: strength.color 
          }}
        />
      </div>
      <span 
        className={sharedStyles.strengthText}
        style={{ color: strength.color }}
      >
        {strength.text}
      </span>
    </div>
  );
}; 