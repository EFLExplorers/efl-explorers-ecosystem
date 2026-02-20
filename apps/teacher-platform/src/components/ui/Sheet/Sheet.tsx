import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import styles from './Sheet.module.css';
import { classNames } from '@/utils/classNames';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetPortal = SheetPrimitive.Portal;

export interface SheetOverlayProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> {}

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  SheetOverlayProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={classNames(styles.overlay, className)}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={classNames(styles.content, styles[side], className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className={styles.close}>
        <X className={styles.closeIcon} />
        <span className={styles.srOnly}>Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      className={classNames(styles.header, className)}
      {...props}
    />
  );
}
SheetHeader.displayName = "SheetHeader";

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      className={classNames(styles.footer, className)}
      {...props}
    />
  );
}
SheetFooter.displayName = "SheetFooter";

export interface SheetTitleProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> {}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={classNames(styles.title, className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

export interface SheetDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> {}

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={classNames(styles.description, className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
