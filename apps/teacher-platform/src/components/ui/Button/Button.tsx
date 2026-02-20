import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from './Button.module.css';
import { classNames } from '@/utils/classNames';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        className={classNames(
          styles.button,
          styles[variant],
          size !== 'default' && styles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
