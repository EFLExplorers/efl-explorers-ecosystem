import * as React from "react";
import styles from './Badge.module.css';
import { classNames } from '@/utils/classNames';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={classNames(
        styles.badge,
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
