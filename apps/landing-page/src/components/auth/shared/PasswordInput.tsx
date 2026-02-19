import React, { useState } from "react";
import sharedStyles from "../styles/shared.module.css";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  showStrength = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={sharedStyles.formGroup}>
      <label htmlFor={id} className={sharedStyles.label}>
        {label}
      </label>
      <div className={sharedStyles.passwordInputWrapper}>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`${sharedStyles.input} ${sharedStyles.passwordInput} ${error ? sharedStyles.error : ""}`}
          required={required}
          disabled={disabled}
        />
        <button
          type="button"
          className={sharedStyles.passwordToggle}
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {error && <span className={sharedStyles.error}>{error}</span>}
      {showStrength && value && (
        <div className={sharedStyles.passwordStrength}>
          <div className={sharedStyles.strengthBar}>
            <div 
              className={sharedStyles.strengthFill}
              style={{ 
                width: `${(() => {
                  let score = 0;
                  if (value.length >= 8) score++;
                  if (/[a-z]/.test(value)) score++;
                  if (/[A-Z]/.test(value)) score++;
                  if (/\d/.test(value)) score++;
                  if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;
                  if (score <= 1) return 33;
                  if (score <= 3) return 66;
                  return 100;
                })()}%`,
                backgroundColor: (() => {
                  let score = 0;
                  if (value.length >= 8) score++;
                  if (/[a-z]/.test(value)) score++;
                  if (/[A-Z]/.test(value)) score++;
                  if (/\d/.test(value)) score++;
                  if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;
                  if (score <= 1) return "#ef4444";
                  if (score <= 3) return "#f59e0b";
                  return "#22c55e";
                })()
              }}
            />
          </div>
          <span 
            className={sharedStyles.strengthText}
            style={{ 
              color: (() => {
                let score = 0;
                if (value.length >= 8) score++;
                if (/[a-z]/.test(value)) score++;
                if (/[A-Z]/.test(value)) score++;
                if (/\d/.test(value)) score++;
                if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;
                if (score <= 1) return "#ef4444";
                if (score <= 3) return "#f59e0b";
                return "#22c55e";
              })()
            }}
          >
            {(() => {
              let score = 0;
              if (value.length >= 8) score++;
              if (/[a-z]/.test(value)) score++;
              if (/[A-Z]/.test(value)) score++;
              if (/\d/.test(value)) score++;
              if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;
              if (score <= 1) return "Weak";
              if (score <= 3) return "Medium";
              return "Strong";
            })()}
          </span>
        </div>
      )}
    </div>
  );
}; 