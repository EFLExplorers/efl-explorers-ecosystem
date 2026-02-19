import { FormInputProps } from "../types/auth.types";
import sharedStyles from "../styles/shared.module.css";

export const FormInput = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
}: FormInputProps) => {
  return (
    <div className={sharedStyles.formGroup}>
      <label htmlFor={id} className={sharedStyles.label}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`${sharedStyles.input} ${error ? sharedStyles.error : ""}`}
        required={required}
        disabled={disabled}
      />
      {error && <span className={sharedStyles.error}>{error}</span>}
    </div>
  );
};
