import { AuthFormData } from "../types/auth.types";

export const validateRegistration = (formData: AuthFormData): string | null => {
  // Check for empty required fields
  if (!formData.firstName?.trim()) {
    return "First name is required";
  }

  if (!formData.lastName?.trim()) {
    return "Last name is required";
  }

  if (!formData.email?.trim()) {
    return "Email is required";
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return "Please enter a valid email address";
  }

  // Password validation
  if (!formData.password) {
    return "Password is required";
  }

  if (formData.password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  // Password confirmation
  if (formData.password !== formData.confirmPassword) {
    return "Passwords do not match";
  }

  // Add any additional validation rules here
  // For example:
  // - Password complexity requirements
  // - Special character requirements
  // - Maximum length checks

  return null; // Return null if validation passes
};

export const validateLogin = (
  email: string,
  password: string
): string | null => {
  if (!email?.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  if (!password) {
    return "Password is required";
  }

  return null;
};

// Helper function to validate password strength
export const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return null;
};
