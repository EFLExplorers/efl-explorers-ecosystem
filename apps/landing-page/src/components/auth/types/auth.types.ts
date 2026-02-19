export type UserPlatform = "student" | "teacher";

export interface AuthFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export interface FormInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}
