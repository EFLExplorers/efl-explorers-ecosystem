import React from "react";
import sharedStyles from "../styles/shared.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  color = "currentColor" 
}: LoadingSpinnerProps) => {
  return (
    <div 
      className={`${sharedStyles.spinner} ${sharedStyles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}
      style={{ borderTopColor: color }}
    />
  );
}; 