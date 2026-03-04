import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import styles from './Toggle.module.css';
import { classNames } from '@/utils/classNames';

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={classNames(
      styles.toggle,
      styles[variant],
      styles[size],
      className
    )}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;
