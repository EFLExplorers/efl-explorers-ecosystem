import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styles from './Tooltip.module.css';
import { classNames } from '@/utils/classNames';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  sideOffset?: number;
}

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={classNames(styles.content, className)}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
