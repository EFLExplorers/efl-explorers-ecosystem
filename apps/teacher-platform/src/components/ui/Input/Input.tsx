import * as React from "react";
import styles from './Input.module.css';
import { classNames } from '@/utils/classNames';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={classNames(styles.input, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
