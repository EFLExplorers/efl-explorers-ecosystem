import * as React from "react";
import styles from './Alert.module.css';
import { classNames } from '@/utils/classNames';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={classNames(styles.alert, styles[variant], className)}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={classNames(styles.title, className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(styles.description, className)}
      {...props}
    />
  )
);
AlertDescription.displayName = "AlertDescription";
