import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import styles from './Toast.module.css';
import { classNames } from '@/utils/classNames';

export const ToastProvider = ToastPrimitives.Provider;

export interface ToastViewportProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> {}

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={classNames(styles.viewport, className)}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?: 'default' | 'destructive';
}

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={classNames(styles.toast, styles[variant], className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

export interface ToastActionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> {}

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  ToastActionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={classNames(styles.action, className)}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

export interface ToastCloseProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> {}

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  ToastCloseProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={classNames(styles.close, className)}
    toast-close=""
    {...props}
  >
    <X className={styles.closeIcon} />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export interface ToastTitleProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> {}

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  ToastTitleProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={classNames(styles.title, className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

export interface ToastDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> {}

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={classNames(styles.description, className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export type ToastPropsType = ToastProps;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
